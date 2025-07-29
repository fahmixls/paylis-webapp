import { relayersApi, relayerId } from "~/lib/relayer.server";
import type { Route } from "./+types/send";
import {
  Speed,
  type ApiResponseTransactionResponseData,
} from "@openzeppelin/relayer-sdk";
import { db } from "~/db/connection";
import { transactions } from "~/db/schema";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  }

  try {
    const {
      request: { from, to, value, gas, data },
      meta: { receiver, fee, token, amount },
    } = await request.json();

    // Step 1: Send transaction
    const res = await relayersApi.sendTransaction(relayerId, {
      data,
      to,
      value,
      gas_limit: gas,
      speed: Speed.FAST,
    });

    const { id: respId } = res.data.data as ApiResponseTransactionResponseData;

    // Step 2: Retry to get transaction status with exponential backoff
    let resData: ApiResponseTransactionResponseData | null = null;
    let hash: string | null = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      const tx = await relayersApi.getTransactionById(relayerId, respId);
      const data = tx.data.data as ApiResponseTransactionResponseData;

      if (data.hash) {
        resData = data;
        hash = data.hash;
        break;
      }

      const delayMs = 1000 * Math.pow(2, attempt); // 1s, 2s, 4s
      await delay(delayMs);
    }

    if (!resData) {
      // Final fetch (even if no hash), for metadata like created_at
      const finalTx = await relayersApi.getTransactionById(relayerId, respId);
      resData = finalTx.data.data as ApiResponseTransactionResponseData;
    }

    const { id, status, confirmed_at, created_at } = resData;

    // Step 3: Insert transaction into DB
    await db.insert(transactions).values({
      transactionId: id,
      txHash: hash,
      status,
      confirmedAt: confirmed_at ? new Date(confirmed_at) : null,
      createdAt: new Date(created_at),
      payerAddress: from,
      recipientAddress: receiver,
      amount,
      tokenAddress: token,
      fee: fee,
      chainId: 4202,
    });

    return new Response(JSON.stringify({ id: respId }), {
      status: 200,
    });
  } catch (err: any) {
    console.error("Relayer error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
