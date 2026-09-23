"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import type { TripStatus } from "@/lib/db/schema";
import { gateIn, gateOut } from "@/app/actions";
import { Plate } from "./ui";

export type BoardCard = {
  id: number;
  orderId: number;
  plate: string;
  driverName: string;
  dealer: string;
  destination: string;
  orderNumber: string;
  netKg: number | null;
  status: TripStatus;
  time: string;
};

export type Column = { status: TripStatus; label: string; cards: BoardCard[] };

type Labels = { empty: string; hint: string; in: string; out: string; needWeight: string; net: string; t: string };

/**
 * Перетаскивать можно только туда, где действие не требует ввода данных.
 * Взвешивание так не пройдёт: без цифр с весов машину выпускать нельзя.
 */
const MOVES: Partial<Record<TripStatus, { from: TripStatus; action: (fd: FormData) => Promise<void> }>> = {
  on_site: { from: "expected", action: gateIn },
  departed: { from: "loaded", action: gateOut },
};

const LONG_PRESS_MS = 220;

export function Board({ columns, labels }: { columns: Column[]; labels: Labels }) {
  const [drag, setDrag] = useState<{ card: BoardCard; x: number; y: number; w: number } | null>(null);
  const [target, setTarget] = useState<TripStatus | null>(null);
  const [pending, start] = useTransition();

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const origin = useRef({ x: 0, y: 0 });

  const cancelPress = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const columnUnder = (x: number, y: number): TripStatus | null => {
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-status]");
    return (el?.dataset.status as TripStatus) ?? null;
  };

  const canDrop = (card: BoardCard, to: TripStatus | null) => !!to && MOVES[to]?.from === card.status;

  const onPointerDown = (e: React.PointerEvent<HTMLElement>, card: BoardCard) => {
    if (!Object.values(MOVES).some((m) => m.from === card.status)) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    origin.current = { x: e.clientX, y: e.clientY };

    // Ждём удержания: иначе палец не сможет прокрутить колонку, начав жест с карточки.
    timer.current = setTimeout(() => {
      el.setPointerCapture(e.pointerId);
      setDrag({ card, x: e.clientX, y: e.clientY, w: rect.width });
      if (navigator.vibrate) navigator.vibrate(8);
    }, LONG_PRESS_MS);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!drag) {
      // Сдвинулся раньше, чем сработало удержание — это прокрутка, не перетаскивание.
      const moved = Math.hypot(e.clientX - origin.current.x, e.clientY - origin.current.y);
      if (moved > 8) cancelPress();
      return;
    }
    e.preventDefault();
    setDrag({ ...drag, x: e.clientX, y: e.clientY });
    setTarget(columnUnder(e.clientX, e.clientY));
  };

  const onPointerUp = () => {
    cancelPress();
    if (drag && canDrop(drag.card, target)) {
      const move = MOVES[target!]!;
      const data = new FormData();
      data.set("tripId", String(drag.card.id));
      start(() => void move.action(data));
    }
    setDrag(null);
    setTarget(null);
  };

  return (
    <>
      <p className="label no-print mb-4">{labels.hint}</p>

      <div className={`board ${pending ? "opacity-60" : ""}`}>
        {columns.map((col) => {
          const active = drag && target === col.status && canDrop(drag.card, col.status);
          return (
            <section key={col.status} data-status={col.status} className={`board-col ${active ? "board-col-over" : ""}`}>
              <h2 className="board-head">
                {col.label} <span className="num text-muted">{col.cards.length}</span>
              </h2>

              <div className="space-y-3">
                {col.cards.length === 0 && <p className="py-5 text-center text-sm text-muted">{labels.empty}</p>}

                {col.cards.map((card) => (
                  <article
                    key={card.id}
                    onPointerDown={(e) => onPointerDown(e, card)}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                    className={`card board-card p-4 ${drag?.card.id === card.id ? "board-card-ghost" : ""}`}
                  >
                    <CardBody card={card} labels={labels} />
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Карточка под пальцем: живёт поверх всего, поэтому не ломает раскладку колонок. */}
      {drag && (
        <div
          className="board-float card p-4"
          style={{ left: drag.x, top: drag.y, width: drag.w }}
          aria-hidden
        >
          <CardBody card={drag.card} labels={labels} floating />
        </div>
      )}
    </>
  );
}

function CardBody({ card, labels, floating }: { card: BoardCard; labels: Labels; floating?: boolean }) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Plate value={card.plate} />
        <span className="label num">{card.time}</span>
      </div>

      <p className="mt-2.5 leading-snug font-bold">{card.driverName}</p>
      <p className="mt-1 text-sm text-muted">{card.dealer}</p>
      <p className="mt-1 text-sm leading-snug">{card.destination}</p>

      <p className="label mt-2">
        {floating ? (
          <span className="mono">{card.orderNumber}</span>
        ) : (
          <Link href={`/orders/${card.orderId}`} className="mono underline underline-offset-2">
            {card.orderNumber}
          </Link>
        )}
        {card.netKg ? ` · ${labels.net} ${(card.netKg / 1000).toFixed(1)} ${labels.t}` : ""}
      </p>

      {!floating && (
        <div className="no-print mt-3">
          {card.status === "expected" && (
            <form action={gateIn}>
              <input type="hidden" name="tripId" value={card.id} />
              <button className="btn btn-go w-full">{labels.in}</button>
            </form>
          )}
          {card.status === "loaded" && (
            <form action={gateOut}>
              <input type="hidden" name="tripId" value={card.id} />
              <button className="btn btn-brand w-full">{labels.out}</button>
            </form>
          )}
          {card.status === "on_site" && <p className="label">{labels.needWeight}</p>}
        </div>
      )}
    </>
  );
}
