import { NextResponse } from "next/server";
import {
  createSessionToken,
  isAuthEnabled,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAuthEnabled()) {
    return NextResponse.json(
      { error: "Auth is not configured. Set AUTH_PASSWORD and AUTH_SECRET." },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => null)) as {
    password?: string;
  } | null;

  if (!body?.password) {
    return NextResponse.json(
      { error: "Password is required" },
      { status: 400 }
    );
  }

  if (!(await verifyPassword(body.password))) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookieOptions(token));
  return response;
}
