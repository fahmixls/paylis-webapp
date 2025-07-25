import { parse, serialize } from "cookie";

const SESSION_COOKIE_NAME = "siwe_session";

export function getSessionFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;

  const cookies = parse(cookieHeader);
  return cookies[SESSION_COOKIE_NAME] || null;
}

export function createSessionCookie(sessionToken: string): string {
  return serialize(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });
}

export function destroySessionCookie(): string {
  return serialize(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}
