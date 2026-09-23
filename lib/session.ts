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

export async function currentUser(): Promise<SessionUser | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const id = verify(raw);
  if (!id) return null;
  const rows = await db
    .select({ u: schema.users, dealerName: schema.dealers.name })
    .from(schema.users)
    .leftJoin(schema.dealers, eq(schema.users.dealerId, schema.dealers.id))
    .where(eq(schema.users.id, id))
    .limit(1);
  const row = rows[0];
  if (!row || !row.u.active) return null;
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
  if (!user) redirect("/login");
  if (roles.length && !roles.includes(user.role) && user.role !== "admin") redirect(homeFor(user.role));
  return user;
}
