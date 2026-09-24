import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, schema } from "./db";

const SECRET = process.env.SESSION_SECRET ?? "dev-only-change-me";
const COOKIE = "sid";

function sign(value: string) {
  return createHmac("sha256", SECRET).update(value).digest("base64url");
}

function verify(raw: string): number | null {
  const [value, mac] = raw.split(".");
  if (!value || !mac) return null;
  const expected = sign(value);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const id = Number(value);
  return Number.isInteger(id) ? id : null;
}

export async function createSession(userId: number) {
  const value = String(userId);
  (await cookies()).set(COOKIE, `${value}.${sign(value)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export type SessionUser = typeof schema.users.$inferSelect & { dealerName: string | null };

/**
 * Программа работает внутри завода, поэтому входа в ней нет.
 * Все действия пишутся на одного служебного пользователя, а кто именно
 * оставил заявку — видно из поля «От кого» в самой заявке.
 */
export const SYSTEM_PHONE = "system";

async function systemUser(): Promise<SessionUser> {
  const found = await db.query.users.findFirst({ where: eq(schema.users.phone, SYSTEM_PHONE) });
  if (found) return { ...found, dealerName: null };

  // Первые запросы после чистой установки приходят пачкой и создают его наперегонки,
  // поэтому дубль по телефону — не ошибка, а сигнал, что кто-то успел раньше.
  const [created] = await db
    .insert(schema.users)
    .values({ name: "Завод", phone: SYSTEM_PHONE, pin: "-", role: "admin" })
    .onConflictDoNothing({ target: schema.users.phone })
    .returning();
  if (created) return { ...created, dealerName: null };

  const existing = await db.query.users.findFirst({ where: eq(schema.users.phone, SYSTEM_PHONE) });
  if (!existing) throw new Error("Не удалось завести служебного пользователя");
  return { ...existing, dealerName: null };
}

export async function currentUser(): Promise<SessionUser | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return systemUser();
  const id = verify(raw);
  if (!id) return systemUser();
  const rows = await db
    .select({ u: schema.users, dealerName: schema.dealers.name })
    .from(schema.users)
    .leftJoin(schema.dealers, eq(schema.users.dealerId, schema.dealers.id))
    .where(eq(schema.users.id, id))
    .limit(1);
  const row = rows[0];
  if (!row || !row.u.active) return systemUser();
  return { ...row.u, dealerName: row.dealerName ?? null };
}

/** Куда роль попадает по умолчанию: охрана живёт на КПП, остальные — в заявках. */
export const homeFor = (role: schema.Role) => (role === "gate" ? "/gate" : "/orders");

/**
 * Не пускает дальше, но и не роняет страницу: чужой раздел — это не сбой,
 * человек просто открыл не свою ссылку, и его надо вернуть на рабочий экран.
 */
export async function requireUser(...roles: schema.Role[]): Promise<SessionUser> {
  const user = await currentUser();
  if (!user) redirect("/");
  if (roles.length && !roles.includes(user.role) && user.role !== "admin") redirect(homeFor(user.role));
  return user;
}
