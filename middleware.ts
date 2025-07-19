import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes
  const protectedPaths = ["/dashboard", "/forms", "/analytics", "/settings"]
  const isProtectedPath = protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path))

  // Redirect to login if accessing protected route without session
  if (isProtectedPath && !session) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/auth/login"
    redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect to dashboard if accessing auth pages with session
  const authPaths = ["/auth/login", "/auth/register"]
  const isAuthPath = authPaths.some((path) => req.nextUrl.pathname.startsWith(path))

  if (isAuthPath && session) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/dashboard"
    return NextResponse.redirect(redirectUrl)
  }

  // Add security headers
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set("x-pathname", req.nextUrl.pathname)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
