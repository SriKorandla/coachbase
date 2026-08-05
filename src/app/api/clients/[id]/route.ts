import { NextResponse } from "next/server";
import {
  deleteClient,
  getClient,
  updateClientPageBody,
  updateClientProfile,
} from "@/db/queries";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const client = await getClient(id);
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    return NextResponse.json(client);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load client" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = (await request.json()) as {
      pageBody?: string;
      name?: string;
      goal?: string;
      startDate?: string;
      notes?: string;
    };

    if (typeof body.pageBody === "string") {
      const client = await updateClientPageBody(id, body.pageBody);
      if (!client) {
        return NextResponse.json({ error: "Client not found" }, { status: 404 });
      }
      return NextResponse.json(client);
    }

    if (!body.name?.trim() || !body.goal?.trim() || !body.startDate?.trim()) {
      return NextResponse.json(
        { error: "name, goal, and startDate are required" },
        { status: 400 }
      );
    }

    const client = await updateClientProfile(id, {
      name: body.name,
      goal: body.goal,
      startDate: body.startDate,
      notes: body.notes,
    });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    return NextResponse.json(client);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const ok = await deleteClient(id);
    if (!ok) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    );
  }
}
