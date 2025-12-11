import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Check for Supabase auth cookie presence (simple check, actual validation in protected routes)
  const hasAuthCookie = request.cookies.getAll().some(
    (cookie) => cookie.name.includes("sb-") && cookie.name.includes("-auth-token")
  )

  // Redirect to login if accessing admin without auth cookie
  if (request.nextUrl.pathname.startsWith("/admin") && !hasAuthCookie) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return response
}


