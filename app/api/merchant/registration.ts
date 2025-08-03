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
    const { address, name, email, website, update } = await request.json();
    const user = await db
      .select()
      .from(users)
      .where(eq(users.address, address));
    let key = randomUUID() as string;
    if (update === "y") {
      const currenctData = await db
        .update(merchants)
        .set({
          name: name,
          email: email,
          website: website,
        })
        .returning({ apiKey: merchants.apiKey });
      key = currenctData[0].apiKey;
    } else {
      await db.insert(merchants).values({
        userId: user[0].id,
        name,
        email,
        website,
        apiKey: key,
      });
    }

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
