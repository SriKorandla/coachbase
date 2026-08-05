import { NextResponse } from "next/server";
import { createClientLink, getClient, listClientLinks } from "@/db/queries";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const client = await getClient(id);
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    const links = await listClientLinks(id);
    return NextResponse.json(links);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load links" },
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

    const body = (await request.json()) as { label?: string; url?: string };
    if (!body.label?.trim() || !body.url?.trim()) {
      return NextResponse.json(
        { error: "label and url are required" },
        { status: 400 }
      );
    }

    const link = await createClientLink(id, {
      label: body.label,
      url: body.url,
    });
    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create link" },
      { status: 500 }
    );
  }
}
