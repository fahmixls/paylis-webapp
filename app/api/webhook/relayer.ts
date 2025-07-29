import { db } from "~/db/connection";
import type { Route } from "./+types/relayer";
import { transactions } from "~/db/schema";
import { eq } from "drizzle-orm";

export async function action({ request }: Route.ActionArgs) {
  const data = await request.json();

  if (
    data.event !== "transaction_update" ||
    data.payload.payload_type !== "transaction"
  )
    return Response.json({ success: true });

  await db
    .update(transactions)
    .set({
      txHash: data.payload.hash,
      status: data.payload.status,
      confirmedAt: new Date(data.payload.confirmed_at),
    })
    .where(eq(transactions.transactionId, data.payload.id));

  return Response.json({ success: true });
}
