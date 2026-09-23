"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { randomInt } from "node:crypto";
import { and, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { createSession, destroySession, homeFor, requireUser, type SessionUser } from "@/lib/session";
import { enqueue } from "@/lib/onec";
import { normalizePlate, orderNumber } from "@/lib/format";
import { LOCALES, type Locale } from "@/lib/i18n";

const now = () => Math.floor(Date.now() / 1000);

async function log(actor: SessionUser, entity: string, entityId: number, action: string, data?: unknown) {
  await db.insert(schema.auditLog).values({ actorId: actor.id, entity, entityId, action, data: (data ?? null) as object });
}

export async function setLocale(formData: FormData) {
  const value = String(formData.get("locale"));
  if (LOCALES.includes(value as Locale)) {
    (await cookies()).set("locale", value, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  }
  revalidatePath("/", "layout");
}

const registerInput = z.object({
  name: z.string().min(2).max(200),
  inn: z.string().max(30).optional(),
  contact: z.string().min(3).max(120),
  phone: z.string().min(6).max(30),
  pin: z.string().regex(/^\d{4}$/),
});

/**
 * Самозапись дилера. Создаёт контрагента со статусом pending: войти он сможет
 * сразу, а создавать заявки — только после того, как диспетчер откроет доступ.
 * В 1С отсюда ничего не уходит.
 */
export async function registerDealer(_: unknown, formData: FormData) {
  const parsed = registerInput.safeParse({
    name: formData.get("name"),
    inn: formData.get("inn") || undefined,
    contact: formData.get("contact"),
    phone: formData.get("phone"),
    pin: formData.get("pin"),
  });
  if (!parsed.success) return { error: "invalid" as const };
  const input = parsed.data;

  const taken = await db.query.users.findFirst({ where: eq(schema.users.phone, input.phone) });
  if (taken) return { error: "taken" as const };

  const [dealer] = await db
    .insert(schema.dealers)
    .values({ name: input.name, inn: input.inn ?? null, phone: input.phone, status: "pending" })
    .returning();
  await db
    .insert(schema.users)
    .values({ name: input.contact, phone: input.phone, pin: input.pin, role: "dealer", dealerId: dealer.id });

  return { ok: true as const };
}

const dealerInput = registerInput.omit({ pin: true });

/** Диспетчер заводит дилера, который позвонил: доступ открыт сразу, PIN он диктует по телефону. */
export async function addDealer(_: unknown, formData: FormData) {
  const user = await requireUser("dispatcher");
  const parsed = dealerInput.safeParse({
    name: formData.get("name"),
    inn: formData.get("inn") || undefined,
    contact: formData.get("contact"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) return { error: "invalid" as const };
  const input = parsed.data;

  const taken = await db.query.users.findFirst({ where: eq(schema.users.phone, input.phone) });
  if (taken) return { error: "taken" as const };

  const pin = String(randomInt(1000, 10000));
  const [dealer] = await db
    .insert(schema.dealers)
    .values({
      name: input.name,
      inn: input.inn ?? null,
      phone: input.phone,
      status: "active",
      approvedBy: user.id,
      approvedAt: now(),
    })
    .returning();
  await db
    .insert(schema.users)
    .values({ name: input.contact, phone: input.phone, pin, role: "dealer", dealerId: dealer.id });

  await log(user, "dealer", dealer.id, "created");
  await enqueueDealer(dealer.id);
  revalidatePath("/dealers");
  return { ok: true as const, phone: input.phone, pin };
}

async function enqueueDealer(dealerId: number) {
  const dealer = await db.query.dealers.findFirst({ where: eq(schema.dealers.id, dealerId) });
  if (!dealer) return;
  await enqueue("dealer.approved", {
    dealerId: dealer.id,
    name: dealer.name,
    inn: dealer.inn,
    phone: dealer.phone,
  });
}

export async function setDealerStatus(formData: FormData) {
  const user = await requireUser("dispatcher");
  const id = Number(formData.get("dealerId"));
  const status = String(formData.get("status")) as schema.DealerStatus;
  if (!schema.DEALER_STATUS.includes(status)) throw new Error("Неизвестный статус");

  await db
    .update(schema.dealers)
    .set({
      status,
      approvedBy: status === "active" ? user.id : undefined,
      approvedAt: status === "active" ? now() : undefined,
    })
    .where(eq(schema.dealers.id, id));
  await log(user, "dealer", id, status);

  // Контрагент уходит в 1С только после одобрения и только один раз.
  const dealer = await db.query.dealers.findFirst({ where: eq(schema.dealers.id, id) });
  if (status === "active" && dealer && !dealer.code1c) await enqueueDealer(id);

  revalidatePath("/dealers");
}

export async function login(_: unknown, formData: FormData) {
  const phone = String(formData.get("phone") ?? "").trim();
  const pin = String(formData.get("pin") ?? "").trim();
  const user = await db.query.users.findFirst({ where: eq(schema.users.phone, phone) });
  if (!user || !user.active || user.pin !== pin) return { error: true };
  await createSession(user.id);
  redirect(homeFor(user.role));
}

export async function logout() {
  await destroySession();
  redirect("/");
}

const orderInput = z.object({
  dealerId: z.coerce.number().int().positive(),
  productId: z.coerce.number().int().positive(),
  tons: z.coerce.number().int().min(1).max(500),
  destination: z.string().min(3).max(300),
  note: z.string().max(500).optional(),
});

export async function createOrder(formData: FormData) {
  const user = await requireUser("dealer", "dispatcher");
  const input = orderInput.parse({
    dealerId: user.role === "dealer" ? user.dealerId : formData.get("dealerId"),
    productId: formData.get("productId"),
    tons: formData.get("tons"),
    destination: formData.get("destination"),
    note: formData.get("note") || undefined,
  });

  const product = await db.query.products.findFirst({ where: eq(schema.products.id, input.productId) });
  if (!product) throw new Error("Позиция номенклатуры не найдена");

  const dealer = await db.query.dealers.findFirst({ where: eq(schema.dealers.id, input.dealerId) });
  if (dealer?.status !== "active") throw new Error("Доступ дилера ещё не открыт");

  const midnight = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.orders)
    .where(gte(schema.orders.createdAt, midnight));

  const [order] = await db
    .insert(schema.orders)
    .values({
      ...input,
      product: product.name,
      note: input.note ?? null,
      number: orderNumber(count + 1),
      createdBy: user.id,
      channel: user.role === "dealer" ? "web" : "phone",
      // Диспетчер принимает звонок и сразу подтверждает — лишнего шага нет.
      status: user.role === "dealer" ? "new" : "approved",
      decidedBy: user.role === "dealer" ? null : user.id,
      decidedAt: user.role === "dealer" ? null : now(),
    })
    .returning();

  await log(user, "order", order.id, "created");
  if (order.status === "approved") await enqueueOrder(order.id);
  redirect(`/orders/${order.id}`);
}

async function enqueueOrder(orderId: number) {
  const order = await db.query.orders.findFirst({ where: eq(schema.orders.id, orderId) });
  if (!order) return;
  const dealer = await db.query.dealers.findFirst({ where: eq(schema.dealers.id, order.dealerId) });
  const product = order.productId
    ? await db.query.products.findFirst({ where: eq(schema.products.id, order.productId) })
    : null;
  await enqueue("order.approved", {
    number: order.number,
    date: new Date(order.createdAt * 1000).toISOString(),
    dealer: { code1c: dealer?.code1c, name: dealer?.name, inn: dealer?.inn },
    product: { code1c: product?.code1c, name: order.product },
    tons: order.tons,
    destination: order.destination,
  });
}

export async function decideOrder(formData: FormData) {
  const user = await requireUser("dispatcher");
  const id = Number(formData.get("orderId"));
  const approve = formData.get("decision") === "approve";
  await db
    .update(schema.orders)
    .set({
      status: approve ? "approved" : "rejected",
      decidedBy: user.id,
      decidedAt: now(),
      rejectReason: approve ? null : String(formData.get("reason") ?? "") || null,
    })
    .where(and(eq(schema.orders.id, id), eq(schema.orders.status, "new")));
  await log(user, "order", id, approve ? "approved" : "rejected");
  if (approve) await enqueueOrder(id);
  revalidatePath(`/orders/${id}`);
}

const tripInput = z.object({
  orderId: z.coerce.number().int().positive(),
  plate: z.string().min(3).max(20).transform(normalizePlate),
  trailerPlate: z.string().max(20).transform(normalizePlate).optional(),
  driverName: z.string().min(3).max(120),
  driverPhone: z.string().max(30).optional(),
  driverDoc: z.string().max(40).optional(),
});

/** Машину заводят когда она уже у ворот — до этого её номер никто не знает. */
export async function addTrip(formData: FormData) {
  const user = await requireUser("dispatcher", "gate", "dealer");
  const input = tripInput.parse({
    orderId: formData.get("orderId"),
    plate: formData.get("plate"),
    trailerPlate: formData.get("trailerPlate") || undefined,
    driverName: formData.get("driverName"),
    driverPhone: formData.get("driverPhone") || undefined,
    driverDoc: formData.get("driverDoc") || undefined,
  });
  const order = await db.query.orders.findFirst({ where: eq(schema.orders.id, input.orderId) });
  if (!order || order.status !== "approved") throw new Error("Заявка не подтверждена");

  const [trip] = await db
    .insert(schema.trips)
    .values({
      ...input,
      trailerPlate: input.trailerPlate ?? null,
      driverPhone: input.driverPhone ?? null,
      driverDoc: input.driverDoc ?? null,
    })
    .returning();
  await log(user, "trip", trip.id, "created", { plate: trip.plate });
  revalidatePath(`/orders/${input.orderId}`);
  revalidatePath("/gate");
}

export async function gateIn(formData: FormData) {
  const user = await requireUser("gate", "dispatcher");
  const id = Number(formData.get("tripId"));
  await db
    .update(schema.trips)
    .set({ status: "on_site", arrivedAt: now(), gateInBy: user.id })
    .where(and(eq(schema.trips.id, id), eq(schema.trips.status, "expected")));
  await log(user, "trip", id, "gate_in");
  revalidatePath("/gate");
}

export async function saveWeight(formData: FormData) {
  const user = await requireUser("scale", "dispatcher");
  const id = Number(formData.get("tripId"));
  const grossKg = Number(formData.get("grossKg"));
  const tareKg = Number(formData.get("tareKg"));
  if (!(grossKg > tareKg && tareKg > 0)) throw new Error("Брутто должно быть больше тары");
  const trip = await db.query.trips.findFirst({ where: eq(schema.trips.id, id) });
  if (!trip) throw new Error("Рейс не найден");

  await db
    .update(schema.trips)
    .set({
      grossKg,
      tareKg,
      netKg: grossKg - tareKg,
      status: "loaded",
      loadedAt: now(),
      waybillNo: trip.waybillNo ?? `НК-${String(id).padStart(6, "0")}`,
    })
    .where(eq(schema.trips.id, id));
  await log(user, "trip", id, "weighed", { grossKg, tareKg });
  revalidatePath(`/orders/${trip.orderId}`);
  revalidatePath("/gate");
}

/** Выезд = момент истины. Тут рождается накладная и уходит в 1С. */
export async function gateOut(formData: FormData) {
  const user = await requireUser("gate", "dispatcher");
  const id = Number(formData.get("tripId"));
  const trip = await db.query.trips.findFirst({ where: eq(schema.trips.id, id) });
  if (!trip) throw new Error("Рейс не найден");
  if (trip.status !== "loaded" || !trip.netKg) throw new Error("Машина не взвешена — выпускать нельзя");

  await db
    .update(schema.trips)
    .set({ status: "departed", departedAt: now(), gateOutBy: user.id })
    .where(eq(schema.trips.id, id));
  await log(user, "trip", id, "gate_out");

  const order = await db.query.orders.findFirst({ where: eq(schema.orders.id, trip.orderId) });
  const dealer = order ? await db.query.dealers.findFirst({ where: eq(schema.dealers.id, order.dealerId) }) : null;
  const product = order?.productId
    ? await db.query.products.findFirst({ where: eq(schema.products.id, order.productId) })
    : null;
  await enqueue("trip.departed", {
    orderNumber: order?.number,
    waybillNo: trip.waybillNo,
    dealer: { code1c: dealer?.code1c, name: dealer?.name },
    product: { code1c: product?.code1c, name: order?.product },
    plate: trip.plate,
    driver: trip.driverName,
    destination: order?.destination,
    grossKg: trip.grossKg,
    tareKg: trip.tareKg,
    netKg: trip.netKg,
    departedAt: new Date().toISOString(),
  });

  revalidatePath("/gate");
  revalidatePath(`/orders/${trip.orderId}`);
}

export async function closeOrder(formData: FormData) {
  const user = await requireUser("dispatcher");
  const id = Number(formData.get("orderId"));
  await db.update(schema.orders).set({ status: "closed" }).where(eq(schema.orders.id, id));
  await log(user, "order", id, "closed");
  await enqueue("order.closed", { orderId: id });
  revalidatePath(`/orders/${id}`);
}
