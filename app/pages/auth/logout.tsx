import { redirect } from "react-router";
import {
  getSessionFromRequest,
  destroySessionCookie,
} from "../../lib/session.server";
import type { Route } from "./+types/login";
import { deleteSession } from "~/lib/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  const sessionToken = getSessionFromRequest(request);

  if (sessionToken) {
    await deleteSession(sessionToken);
  }

  return redirect("/dashboard", {
    headers: {
      "Set-Cookie": destroySessionCookie(),
    },
  });
}
