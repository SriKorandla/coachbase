import { NextResponse } from "next/server";
import { deleteCheckIn, updateCheckIn } from "@/db/queries";
import type { CheckInInput, Rating } from "@/lib/types";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

function parseInput(body: Partial<CheckInInput>): CheckInInput | null {
  if (
    !body.clientId ||
    !body.weekOf ||
    body.bodyWeightLbs == null ||
    !body.notes?.trim() ||
    body.energy == null ||
    body.sleep == null
  ) {
    return null;
  }

  return {
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
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Partial<CheckInInput>;
    const input = parseInput(body);
    if (!input) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await updateCheckIn(id, input);
    if (result === "not_found") {
      return NextResponse.json({ error: "Check-in not found" }, { status: 404 });
    }
    if (result === "conflict") {
      return NextResponse.json(
        { error: "A check-in already exists for that client and week" },
        { status: 409 }
      );
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update check-in" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const ok = await deleteCheckIn(id);
    if (!ok) {
      return NextResponse.json({ error: "Check-in not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete check-in" },
      { status: 500 }
    );
  }
}
