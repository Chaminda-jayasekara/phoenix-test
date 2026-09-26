import { NextResponse } from "next/server";
import { COOKIE_NAME, verifySessionToken } from "@/lib/adminAuth";

// Protects everything under /admin with a signed session cookie set by
// app/admin/actions.js#adminLogin. Redirects to /admin/login if the
// cookie is missing, tampered with, or expired. Plain Next.js — no
// external auth service, works the same on Vercel or a self-hosted VPS.
export async function middleware(request) {
  if (request.nextUrl.pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const valid = await verifySessionToken(token);

  if (!valid) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
