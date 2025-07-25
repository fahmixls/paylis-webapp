import { getSessionFromRequest } from "~/lib/session.server";
import type { Route } from "./+types/me";
import { verifySession } from "~/lib/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  const sessionToken = getSessionFromRequest(request);

  if (!sessionToken) {
    return Response.json({ error: "No session found" }, { status: 401 });
  }

  const user = await verifySession(sessionToken);

  if (!user) {
    return Response.json({ error: "Invalid session" }, { status: 401 });
  }

  return Response.json({
    user: {
      address: user.address,
      created_at: user.createdAt,
    },
  });
}
