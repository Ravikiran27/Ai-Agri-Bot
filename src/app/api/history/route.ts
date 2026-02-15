import { NextRequest, NextResponse } from "next/server";
import { addHistory, getHistory } from "@/lib/history-db";

export async function POST(req: NextRequest) {
  const { uid, type, data } = await req.json();
  if (!uid || !type || !data) {
    return NextResponse.json({ error: "Missing uid, type, or data" }, { status: 400 });
  }
  await addHistory(uid, type, data);
  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url!);
  const uid = searchParams.get("uid");
  const type = searchParams.get("type");
  if (!uid || !type) {
    return NextResponse.json({ error: "Missing uid or type" }, { status: 400 });
  }
  const history = await getHistory(uid, type);
  return NextResponse.json({ history });
}
