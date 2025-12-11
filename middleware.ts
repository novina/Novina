import { NextResponse, type NextRequest } from "next/server"

// Explicitly use Edge Runtime
export const runtime = "edge"

export function middleware(request: NextRequest) {
  // Skip API routes entirely
  if (request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  // Only check auth for admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
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
