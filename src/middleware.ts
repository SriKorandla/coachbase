import { NextResponse, type NextRequest } from "next/server";
import {
  isAuthEnabled,
  SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/auth";

export async function middleware(request: NextRequest) {
  if (!isAuthEnabled()) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/login";
  const isAuthApi =
    pathname === "/api/auth/login" || pathname === "/api/auth/logout";

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const authed = token ? await verifySessionToken(token) : false;

  if (isAuthApi) {
    return NextResponse.next();
  }

  if (isLogin) {
    if (authed) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!authed) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
