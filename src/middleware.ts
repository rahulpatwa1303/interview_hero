import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const secret = process.env.NEXTAUTH_SECRET;

export default async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret });

  if (!request.nextUrl.pathname.startsWith("/auth") || !request.nextUrl.pathname.startsWith("/")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signIn", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|favicon.ico|auth/signIn|api|signin).*)"],
};
