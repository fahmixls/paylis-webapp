import { deleteSession } from "~/lib/auth.server";
import {
  destroySessionCookie,
  getSessionFromRequest,
} from "~/lib/session.server";
import type { Route } from "./+types/logout";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const sessionToken = getSessionFromRequest(request);

  if (sessionToken) {
    await deleteSession(sessionToken);
  }

  return Response.json(
    { success: true },
    {
      headers: {
        "Set-Cookie": destroySessionCookie(),
      },
    },
  );
}
