import { NextResponse } from "next/server";
import { listCheckIns, listClients, resetAndSeed } from "@/db/queries";

export const runtime = "nodejs";

export async function POST() {
  try {
    await resetAndSeed();
    const [clients, checkIns] = await Promise.all([
      listClients(),
      listCheckIns(),
    ]);
    return NextResponse.json({ clients, checkIns });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to reset data" },
      { status: 500 }
    );
  }
}
