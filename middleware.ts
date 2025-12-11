import { NextResponse, type NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Only check auth for admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const hasAuthCookie = request.cookies.getAll().some(
      (cookie) => cookie.name.includes("sb-") && cookie.name.includes("-auth-token")
    )

    if (!hasAuthCookie) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
