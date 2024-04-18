import { NextResponse, NextRequest } from "next/server";
// export { default } from "next-auth/middleware";

// This function can be marked `async` if using `await` inside
export default function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const isAuth = !!token;
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  if (isAuth) {
    if (isAuthPage || request.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/home", request.url));
    }
    return NextResponse.next();
  } else {
    if (!isAuthPage) {
      const lastSearchParams = new URL(request.url).searchParams;
      let lastUrlPath = new URL(request.url).pathname;
      lastUrlPath = lastUrlPath.startsWith("/")
        ? lastUrlPath.slice(1)
        : lastUrlPath;
      if (!!lastSearchParams.toString()) {
        lastUrlPath += "?" + lastSearchParams.toString();
      }
      return NextResponse.redirect(
        !!lastUrlPath
          ? new URL("/auth/?lasturl=" + lastUrlPath, request.url)
          : new URL("/auth", request.url)
      );
    }
  }
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
