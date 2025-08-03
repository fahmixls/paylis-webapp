import { db } from "~/db/connection";
import type { Route } from "./+types/checkout";
import {
  merchants,
  paymentIntents,
  users,
  type NewPaymentIntent,
} from "~/db/schema";
import { calculateFees, getTokenByAddress } from "~/lib/utils";
import { eq, sql } from "drizzle-orm";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const IDRX_ADDRESS = "0xcA0A2cE00d5b6Dd22C65731D8F64939537595D01";
    const token = getTokenByAddress(IDRX_ADDRESS);
    const { amount, address } = body;
    const order_id = new URL(request.url).searchParams.get(
      "orderId"
    ) as unknown as string;
    const fee = calculateFees(amount, IDRX_ADDRESS);
    const existingIntent = await db
      .select({ id: paymentIntents.id })
      .from(paymentIntents)
      .where(eq(paymentIntents.orderId, order_id));
    if (existingIntent.length > 0) {
      const paymentUrl = `${new URL(request.url).origin}/checkout/${order_id}`;
      const response = {
        payment_url: paymentUrl,
        payment_id: order_id,
        status: "created",
      };
      return Response.json(response);
    }
    const dataUser = await db.execute(sql`
      select ${merchants.id}
      from ${merchants}
      left join ${users} on ${users.id} = ${merchants.userId}
      where ${users.address} = ${address}
      limit 1
    `);
    const intent: NewPaymentIntent = {
      orderId: order_id,
      amount,
      tokenAddress: token?.address!,
      fee: String(fee.fee),
      total: String(fee.total),
      merchantId: dataUser.rows[0].id as number,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };

    await db.insert(paymentIntents).values(intent);
    const paymentUrl = `${new URL(request.url).origin}/checkout/${order_id}`;
    const response = {
      payment_url: paymentUrl,
      payment_id: order_id,
      status: "created",
    };

    return Response.json(response);
  } catch (error) {
    console.error("Payment creation error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const orderId = new URL(request.url).searchParams.get(
    "orderId"
  ) as unknown as string;

  if (!orderId) {
    return Response.json({ error: "Payment ID required" }, { status: 400 });
  }

  const payment = null;
  if (!payment) {
    return Response.json({ error: "Payment not found" }, { status: 404 });
  }

  return Response.json({});
}
