"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { and, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { requireUser, type SessionUser } from "@/lib/session";
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

const orderInput = z.object({
  dealerId: z.coerce.number().int().positive().optional(),
  productId: z.coerce.number().int().positive(),
  tons: z.coerce.number().int().min(1).max(500),
  destination: z.string().min(3).max(300),
  contactName: z.string().max(120).optional(),
  note: z.string().max(500).optional(),
});

/**
 * Машина в заявке дилера.
 * Завод просил, чтобы дилер сразу писал, кто поедет: тогда на воротах
 * охране остаётся сверить номер с металлом и нажать одну кнопку.
 */
const orderTruckInput = z.object({
  truckModel: z.string().max(60).optional(),
  plate: z.string().max(20).optional(),
  driverName: z.string().max(120).optional(),
});

/**
 * Логина нет, поэтому «от кого» приходит строкой.
 * Уже знакомого контрагента находим по имени, нового заводим сразу —
 * иначе справочник пришлось бы вести руками до каждой заявки.
 */
async function resolveDealer(name?: string): Promise<number | null> {
  const clean = name?.trim();
  if (!clean) return null;

  const found = await db.query.dealers.findFirst({
    where: sql`lower(trim(${schema.dealers.name})) = lower(${clean})`,
  });
  if (found) return found.id;

  const [created] = await db.insert(schema.dealers).values({ name: clean, status: "active" }).returning();
  return created.id;
}

export async function createOrder(formData: FormData) {
  const user = await requireUser("dealer", "dispatcher");
  const input = orderInput.parse({
    dealerId: user.role === "dealer" ? user.dealerId : formData.get("dealerId") || undefined,
    productId: formData.get("productId"),
    tons: formData.get("tons"),
    destination: formData.get("destination"),
    contactName: formData.get("contactName") || undefined,
    note: formData.get("note") || undefined,
  });
  const truck = orderTruckInput.parse({
    truckModel: formData.get("truckModel") || undefined,
    plate: formData.get("plate") || undefined,
    driverName: formData.get("driverName") || undefined,
  });

  const product = await db.query.products.findFirst({ where: eq(schema.products.id, input.productId) });
  if (!product) throw new Error("Позиция номенклатуры не найдена");

  const dealerId = input.dealerId ?? (await resolveDealer(input.contactName));
  if (!dealerId) throw new Error("Не указано, от кого заявка");
  const dealer = await db.query.dealers.findFirst({ where: eq(schema.dealers.id, dealerId) });
  if (dealer?.status === "blocked") throw new Error("Дилер заблокирован");

  const midnight = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.orders)
    .where(gte(schema.orders.createdAt, midnight));

  const [order] = await db
    .insert(schema.orders)
    .values({
      ...input,
      dealerId,
      product: product.name,
      contactName: input.contactName ?? user.name,
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

  // Дилер указал машину прямо в заявке — заводим рейс сразу, не дожидаясь ворот.
  if (truck.plate && truck.driverName) {
    const [trip] = await db
      .insert(schema.trips)
      .values({
        orderId: order.id,
        plate: normalizePlate(truck.plate),
        truckModel: truck.truckModel ?? null,
        driverName: truck.driverName,
      })
      .returning();
    await log(user, "trip", trip.id, "created", { plate: trip.plate, via: "order" });
  }

  if (order.status === "approved") await enqueueOrder(order.id);
  redirect(`/orders/${order.id}?created=1`);
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

/** Справочник контрагентов: заблокированному заявки создавать нельзя. */
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
  if (status === "active" && dealer && !dealer.code1c) {
    await enqueue("dealer.approved", {
      dealerId: dealer.id,
      name: dealer.name,
      inn: dealer.inn,
      phone: dealer.phone,
    });
  }

  revalidatePath("/dealers");
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
  truckModel: z.string().max(60).optional(),
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
    truckModel: formData.get("truckModel") || undefined,
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
      truckModel: input.truckModel ?? null,
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
