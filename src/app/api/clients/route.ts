import { NextResponse } from "next/server";
import { listClients } from "@/db/queries";

export const runtime = "nodejs";

export async function GET() {
  try {
    const clients = await listClients();
    return NextResponse.json(clients);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load clients" },
      { status: 500 }
    );
  }
}
