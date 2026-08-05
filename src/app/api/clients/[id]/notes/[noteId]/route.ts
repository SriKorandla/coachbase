import { NextResponse } from "next/server";
import { deleteClientNote, updateClientNote } from "@/db/queries";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string; noteId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id, noteId } = await params;
    const body = (await request.json()) as { title?: string; body?: string };

    const note = await updateClientNote(id, noteId, body);
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }
    return NextResponse.json(note);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id, noteId } = await params;
    const ok = await deleteClientNote(id, noteId);
    if (!ok) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
