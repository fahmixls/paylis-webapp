import { relayersApi, relayerId } from "~/lib/relayer.server";
import {
  Speed,
  type ApiResponseTransactionResponseData,
  type NetworkTransactionRequest,
} from "@openzeppelin/relayer-sdk";
import { db } from "~/db/connection";
import { transactions } from "~/db/schema";
import type { Route } from "./+types/submit";
import { PAYMENT_FORWARDER_ADDRESS } from "~/lib/constants";

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
      data,
      meta: { from, receiver, amount, token, receiverAmount },
    } = await request.json();
    const networkTransaction: NetworkTransactionRequest = {
      to: PAYMENT_FORWARDER_ADDRESS,
      data,
      speed: Speed.FAST,
      gas_limit: 300_000,
      value: 0,
    };
    const sendTxRes = await relayersApi.sendTransaction(
      relayerId,
      networkTransaction
    );

    const { id: txId } = sendTxRes.data
      .data as ApiResponseTransactionResponseData;
    let hash: string | null = null;
    let resData: ApiResponseTransactionResponseData | null = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      const txStatusRes = await relayersApi.getTransactionById(relayerId, txId);
      const txData = txStatusRes.data
        .data as ApiResponseTransactionResponseData;

      if (txData.hash) {
        hash = txData.hash;
        resData = txData;
        break;
      }

      await delay(1000 * Math.pow(2, attempt)); // 1s, 2s, 4s
    }

    if (!resData) {
      const finalTxRes = await relayersApi.getTransactionById(relayerId, txId);
      resData = finalTxRes.data.data as ApiResponseTransactionResponseData;
    }

    const { status, confirmed_at, created_at } = resData;

    await db.insert(transactions).values({
      transactionId: txId,
      txHash: hash,
      status,
      confirmedAt: confirmed_at ? new Date(confirmed_at) : null,
      createdAt: new Date(created_at),
      payerAddress: from,
      recipientAddress: receiver,
      amount: receiverAmount,
      tokenAddress: token,
      chainId: 4202,
    });

    return new Response(JSON.stringify({ id: hash }), { status: 200 });
  } catch (err: unknown) {
    console.error("Relayer error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to submit transaction" }),
      { status: 500 }
    );
  }
}
