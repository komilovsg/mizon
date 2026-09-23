import { NextResponse } from "next/server";
import { flushOutbox } from "@/lib/onec";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const token = req.headers.get("authorization");
  if (process.env.SYNC_TOKEN && token !== `Bearer ${process.env.SYNC_TOKEN}`) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return NextResponse.json(await flushOutbox());
}
