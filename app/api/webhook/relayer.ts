import { db } from "~/db/connection";
import { transactions, paymentIntents, merchants } from "~/db/schema";
import { eq } from "drizzle-orm";
import type { Route } from "./+types/relayer";
import crypto from "crypto";
import { TransactionStatus } from "@openzeppelin/relayer-sdk";

export async function action({ request }: Route.ActionArgs) {
  const data = await request.json();

  if (
    data.event !== "transaction_update" ||
    data.payload.payload_type !== "transaction"
  ) {
    return Response.json({ success: true });
  }

  try {
    const [updatedTransaction] = await db
      .update(transactions)
      .set({
        txHash: data.payload.hash,
        status: data.payload.status,
        confirmedAt: new Date(data.payload.confirmed_at),
      })
      .where(eq(transactions.transactionId, data.payload.id))
      .returning();

    if (data.payload.status === "confirmed" && updatedTransaction) {
      await notifyWordPress(updatedTransaction, data.payload);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error processing transaction update:", error);
    return Response.json(
      { error: "Failed to process update" },
      { status: 500 }
    );
  }
}

async function notifyWordPress(transaction: any, payload: any) {
  try {
    const paymentIntent = await db
      .select({
        orderId: paymentIntents.orderId,
        merchantId: paymentIntents.merchantId,
        amount: paymentIntents.amount,
        tokenAddress: paymentIntents.tokenAddress,
      })
      .from(paymentIntents)
      .where(eq(paymentIntents.id, transaction.orderId))
      .limit(1);

    if (!paymentIntent.length || !paymentIntent[0].merchantId) {
      console.log("No payment intent or merchant found for transaction");
      return;
    }

    const merchant = await db
      .select({
        id: merchants.id,
        apiKey: merchants.apiKey,
        website: merchants.website,
      })
      .from(merchants)
      .where(eq(merchants.id, paymentIntent[0].merchantId))
      .limit(1);

    if (!merchant.length || !merchant[0].website || !merchant[0].apiKey) {
      console.log("No merchant website or API key found");
      return;
    }

    const webhookData = {
      order_id: paymentIntent[0].orderId,
      status:
        payload.status === TransactionStatus.CONFIRMED ||
        TransactionStatus.MINED
          ? "success"
          : payload.status,
      payment_id: paymentIntent[0].orderId,
      transaction_id: transaction.transactionId,
      tx_hash: payload.hash,
      amount: paymentIntent[0].amount,
      currency: "IDRX",
    };

    const timestamp = Math.floor(Date.now() / 1000);
    const webhookPayload = JSON.stringify(webhookData);
    const signature = createSignature(webhookPayload, merchant[0].apiKey);

    const wordpressUrl = `${merchant[0].website}/wc-api/paylis_callback`;

    const response = await fetch(wordpressUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Paylis-Signature": signature,
        "X-Paylis-Timestamp": timestamp.toString(),
      },
      body: webhookPayload,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `WordPress webhook failed: ${response.status} ${response.statusText} - ${errorText}`
      );
    } else {
      console.log(
        "WordPress webhook sent successfully for order:",
        paymentIntent[0].orderId
      );
    }
  } catch (error) {
    console.error("Error sending WordPress webhook:", error);
  }
}

function createSignature(payload: string, apiKey: string): string {
  const signature = crypto
    .createHmac("sha256", apiKey)
    .update(payload)
    .digest("hex");

  return `sha256=${signature}`;
}
