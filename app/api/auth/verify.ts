import {
  createSession,
  getOrCreateUser,
  verifySiweSignature,
} from "~/lib/auth.server";
import { createSessionCookie } from "~/lib/session.server";
import type { Route } from "./+types/verify";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { message, signature } = await request.json();

    if (!message || !signature) {
      return Response.json(
        { error: "Message and signature are required" },
        { status: 400 },
      );
    }

    const verification = await verifySiweSignature(message, signature);

    if (!verification.success) {
      return Response.json({ error: verification.error }, { status: 400 });
    }

    const user = await getOrCreateUser(verification.address!);
    const sessionToken = await createSession(user.id);

    return Response.json(
      { success: true, user: { address: user.address } },
      {
        headers: {
          "Set-Cookie": createSessionCookie(sessionToken),
        },
      },
    );
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
