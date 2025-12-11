import { NextResponse, type NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Only check auth for admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Simple cookie check without .some() which might have issues
    const cookies = request.cookies.getAll()
    let hasAuthCookie = false
    for (const cookie of cookies) {
      if (cookie.name.includes("sb-") && cookie.name.includes("-auth-token")) {
        hasAuthCookie = true
        break
      }
    }

    if (!hasAuthCookie) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/articles/:path*",
    "/categories/:path*",
  ],
}
