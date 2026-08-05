import { NextResponse } from "next/server";
import { createClient, listClients } from "@/db/queries";

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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      goal?: string;
      startDate?: string;
      notes?: string;
    };

    if (!body.name?.trim() || !body.goal?.trim()) {
      return NextResponse.json(
        { error: "name and goal are required" },
        { status: 400 }
      );
    }

    const client = await createClient({
      name: body.name,
      goal: body.goal,
      startDate: body.startDate,
      notes: body.notes,
    });
    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}
