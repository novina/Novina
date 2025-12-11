import { NextResponse, type NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Check for Supabase auth cookie presence
  const hasAuthCookie = request.cookies.getAll().some(
    (cookie) => cookie.name.includes("sb-") && cookie.name.includes("-auth-token")
  )

  // Redirect to login if accessing admin without auth cookie
  if (request.nextUrl.pathname.startsWith("/admin") && !hasAuthCookie) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
