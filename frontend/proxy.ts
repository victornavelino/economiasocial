import { auth } from "@/auth"

export default auth((req) => {
  if (!req.auth && !req.nextUrl.pathname.startsWith("/api/auth") && req.nextUrl.pathname !== "/login") {
    const url = new URL("/login", req.nextUrl.origin)
    url.searchParams.set("callbackUrl", req.nextUrl.href)
    return Response.redirect(url)
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
