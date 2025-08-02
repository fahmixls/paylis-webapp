import { db } from "~/db/connection";
import { merchants, users } from "~/db/schema";
import type { Route } from "./+types/registration";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  }

  try {
    const { address, name, email, website } = await request.json();
    const user = await db
      .select()
      .from(users)
      .where(eq(users.address, address));
    const key = randomUUID();
    await db.insert(merchants).values({
      userId: user[0].id,
      name,
      email,
      website,
      apiKey: key,
    });

    return new Response(JSON.stringify({ key }), {
      status: 200,
    });
  } catch (err: unknown) {
    console.error("Relayer error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to submit transaction" }),
      { status: 500 }
    );
  }
}
