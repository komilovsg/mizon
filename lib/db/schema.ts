import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

const now = () => Math.floor(Date.now() / 1000);

export const DEALER_STATUS = ["pending", "active", "blocked"] as const;
export type DealerStatus = (typeof DEALER_STATUS)[number];

/**
 * Дилер — контрагент с договором, а не посетитель сайта.
 * Записаться может кто угодно, но до одобрения диспетчером заявки недоступны
 * и в 1С ничего не уходит: иначе в справочнике Контрагенты копятся дубли.
 */
export const dealers = sqliteTable("dealers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),          // название фирмы или ФИО
  inn: text("inn"),
  phone: text("phone"),
  code1c: text("code_1c"),               // заполняется ответом 1С при одобрении
  status: text("status").$type<DealerStatus>().notNull().default("pending"),
  createdAt: integer("created_at").notNull().$defaultFn(now),
  approvedBy: integer("approved_by"),
  approvedAt: integer("approved_at"),
});

/** Номенклатура предприятия. Цемент, щебень, известь, зерно — что отгружают, то и заводят. */
export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  code1c: text("code_1c"),
  sortOrder: integer("sort_order").notNull().default(100),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

export const ROLES = ["dealer", "dispatcher", "gate", "scale", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  pin: text("pin").notNull(),            // ponytail: PIN в открытом виде для v0, заменить на argon2 перед продом
  role: text("role").$type<Role>().notNull(),
  dealerId: integer("dealer_id").references(() => dealers.id),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

export const ORDER_STATUS = ["new", "approved", "rejected", "closed", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUS)[number];

/** Заявка: сколько тонн и куда. Машина/водитель тут ещё неизвестны — они в trips. */
export const orders = sqliteTable(
  "orders",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    number: text("number").notNull().unique(),         // ЗВ-260922-014
    dealerId: integer("dealer_id").notNull().references(() => dealers.id),
    createdBy: integer("created_by").notNull().references(() => users.id),
    createdAt: integer("created_at").notNull().$defaultFn(now),
    channel: text("channel").$type<"web" | "phone">().notNull().default("web"),
    // Кто именно оставил заявку. У фирмы-дилера звонить может любой из своих —
    // имя из учётки не всегда совпадает с тем, кто отвечает за этот рейс.
    contactName: text("contact_name"),
    productId: integer("product_id").references(() => products.id),
    // Название сохраняем копией: переименуют позицию в справочнике — старые накладные не поедут.
    product: text("product").notNull(),
    tons: integer("tons").notNull(),                    // сколько тонн просят
    destination: text("destination").notNull(),         // назначение: объект, город, адрес
    note: text("note"),
    status: text("status").$type<OrderStatus>().notNull().default("new"),
    decidedBy: integer("decided_by").references(() => users.id),
    decidedAt: integer("decided_at"),
    rejectReason: text("reject_reason"),
  },
  (t) => [index("orders_status_idx").on(t.status), index("orders_dealer_idx").on(t.dealerId)],
);

export const TRIP_STATUS = ["expected", "on_site", "loaded", "departed", "cancelled"] as const;
export type TripStatus = (typeof TRIP_STATUS)[number];

/** Рейс = одна машина по заявке. 30 т это обычно 2-3 рейса. */
export const trips = sqliteTable(
  "trips",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    orderId: integer("order_id").notNull().references(() => orders.id),
    truckModel: text("truck_model"),                    // марка машины: КамАЗ, Howo, Shacman
    plate: text("plate").notNull(),                     // госномер тягача
    trailerPlate: text("trailer_plate"),
    driverName: text("driver_name").notNull(),
    driverPhone: text("driver_phone"),
    driverDoc: text("driver_doc"),                      // серия/номер вод. удостоверения
    status: text("status").$type<TripStatus>().notNull().default("expected"),
    grossKg: integer("gross_kg"),
    tareKg: integer("tare_kg"),
    netKg: integer("net_kg"),
    waybillNo: text("waybill_no"),                      // номер накладной
    arrivedAt: integer("arrived_at"),
    loadedAt: integer("loaded_at"),
    departedAt: integer("departed_at"),
    gateInBy: integer("gate_in_by").references(() => users.id),
    gateOutBy: integer("gate_out_by").references(() => users.id),
    createdAt: integer("created_at").notNull().$defaultFn(now),
  },
  (t) => [index("trips_order_idx").on(t.orderId), index("trips_plate_idx").on(t.plate)],
);

/** Очередь в 1С. Пишем сюда в той же транзакции, воркер отправляет и ретраит. */
export const outbox = sqliteTable(
  "outbox",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    topic: text("topic").notNull(),                     // order.approved | trip.departed
    payload: text("payload", { mode: "json" }).notNull(),
    status: text("status").$type<"pending" | "sent" | "failed">().notNull().default("pending"),
    attempts: integer("attempts").notNull().default(0),
    lastError: text("last_error"),
    ref1c: text("ref_1c"),                              // GUID документа, который вернула 1С
    createdAt: integer("created_at").notNull().$defaultFn(now),
    sentAt: integer("sent_at"),
  },
  (t) => [index("outbox_status_idx").on(t.status)],
);

/** Кто что сделал. Это и есть замена бумажной волокиты как доказательства. */
export const auditLog = sqliteTable("audit_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  actorId: integer("actor_id").references(() => users.id),
  entity: text("entity").notNull(),
  entityId: integer("entity_id").notNull(),
  action: text("action").notNull(),
  data: text("data", { mode: "json" }),
  at: integer("at").notNull().$defaultFn(now),
});
