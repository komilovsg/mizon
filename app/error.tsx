"use client";

import { useEffect } from "react";

/**
 * Последний рубеж: на КПП и весовой человек должен увидеть, что делать,
 * а не стек вызовов. Текст здесь русский — переводы недоступны в клиентской границе ошибки.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <p className="label">Ошибка</p>
      <h1 className="title mt-2 text-3xl">Что-то сломалось</h1>
      <p className="mt-3 text-muted">
        Данные не загрузились. Повторите, а если повторится — сообщите диспетчеру.
      </p>
      {error.digest && <p className="mono mt-3 text-xs text-muted">Код: {error.digest}</p>}
      <div className="mt-8 flex flex-wrap gap-3">
        <button onClick={reset} className="btn btn-primary flex-1">
          Повторить
        </button>
        <a href="/login" className="btn flex-1 text-center">
          На главную
        </a>
      </div>
    </main>
  );
}
