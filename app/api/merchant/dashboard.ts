import { db } from "~/db/connection";
import { transactions } from "~/db/schema";
import { inArray, sql, lt, and } from "drizzle-orm";
import { TransactionStatus } from "@openzeppelin/relayer-sdk";
import type { Route } from "./+types/registration";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const url = new URL(request.url);

    // Pagination params
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const cursor = url.searchParams.get("cursor"); // ISO date string

    // ---- Summary query ----
    const summary = await db
      .select({
        totalRevenue: sql<string>`COALESCE(SUM(${transactions.amount}), 0)`,
        totalPaidTransactions: sql<number>`COUNT(*)`,
      })
      .from(transactions)
      .where(
        inArray(transactions.status, [
          TransactionStatus.CONFIRMED,
          TransactionStatus.MINED,
        ])
      );

    // ---- History query ----
    const filters = [
      inArray(transactions.status, [
        TransactionStatus.CONFIRMED,
        TransactionStatus.MINED,
      ]),
    ];

    if (cursor) {
      filters.push(lt(transactions.createdAt, new Date(cursor)));
    }

    const history = await db
      .select()
      .from(transactions)
      .where(and(...filters))
      .orderBy(sql`${transactions.createdAt} DESC`)
      .limit(limit + 1); // fetch 1 extra to know if there's a next page

    // Cursor logic
    let nextCursor: string | null = null;
    if (history.length > limit) {
      const nextItem = history.pop(); // remove extra
      nextCursor = nextItem?.createdAt.toISOString() ?? null;
    }

    return Response.json({
      summary: {
        totalRevenue: summary[0].totalRevenue,
        totalPaidTransactions: summary[0].totalPaidTransactions,
      },
      history,
      nextCursor,
    });
  } catch (error) {
    console.error("Transaction fetch error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
