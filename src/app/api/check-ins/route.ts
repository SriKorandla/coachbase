import { NextResponse } from "next/server";
import { listCheckIns, upsertCheckIn } from "@/db/queries";
import type { CheckInInput, Rating } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId") ?? undefined;
    const checkIns = await listCheckIns(clientId);
    return NextResponse.json(checkIns);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load check-ins" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<CheckInInput>;

    if (
      !body.clientId ||
      !body.weekOf ||
      body.bodyWeightLbs == null ||
      !body.notes?.trim() ||
      body.energy == null ||
      body.sleep == null
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const input: CheckInInput = {
      clientId: body.clientId,
      weekOf: body.weekOf,
      bodyWeightLbs: Number(body.bodyWeightLbs),
      energy: Number(body.energy) as Rating,
      sleep: Number(body.sleep) as Rating,
      notes: body.notes.trim(),
      squatEst1rm:
        body.squatEst1rm != null && !Number.isNaN(Number(body.squatEst1rm))
          ? Number(body.squatEst1rm)
          : undefined,
    };

    const checkIn = await upsertCheckIn(input);
    return NextResponse.json(checkIn, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to save check-in" },
      { status: 500 }
    );
  }
}
