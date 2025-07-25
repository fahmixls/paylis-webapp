import { getOrCreateUser } from "~/lib/auth.server";
import type { Route } from "./+types/nonce";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { address } = await request.json();

    if (!address) {
      return Response.json({ error: "Address is required" }, { status: 400 });
    }

    const user = await getOrCreateUser(address);

    return Response.json({ nonce: user.nonce });
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
