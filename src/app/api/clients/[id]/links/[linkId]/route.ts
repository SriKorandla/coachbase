import { NextResponse } from "next/server";
import { deleteClientLink, updateClientLink } from "@/db/queries";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string; linkId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id, linkId } = await params;
    const body = (await request.json()) as {
      label?: string;
      url?: string;
      sortOrder?: number;
    };

    const link = await updateClientLink(id, linkId, body);
    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }
    return NextResponse.json(link);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update link" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id, linkId } = await params;
    const ok = await deleteClientLink(id, linkId);
    if (!ok) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete link" },
      { status: 500 }
    );
  }
}
