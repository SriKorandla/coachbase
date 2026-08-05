import { NextResponse } from "next/server";
import { createClientNote, getClient, listClientNotes } from "@/db/queries";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const client = await getClient(id);
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    const notes = await listClientNotes(id);
    return NextResponse.json(notes);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load notes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const client = await getClient(id);
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const body = (await request.json()) as { title?: string; body?: string };
    if (!body.title?.trim() || !body.body?.trim()) {
      return NextResponse.json(
        { error: "title and body are required" },
        { status: 400 }
      );
    }

    const note = await createClientNote(id, {
      title: body.title,
      body: body.body,
    });
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}
