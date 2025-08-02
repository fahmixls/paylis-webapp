import { redirect, useLoaderData, useNavigate } from "react-router";
import Footer from "~/components/derived/Footer";
import Header from "~/components/derived/Header";
import type { Route } from "./+types";
import { getSessionFromRequest } from "~/lib/session.server";
import { verifySession } from "~/lib/auth.server";
import TransactionTable from "../../components/derived/TransactionTable";
import { db } from "~/db/connection";
import { and, desc, gt, lt, sql } from "drizzle-orm";
import { transactions, type Transaction } from "~/db/schema";

export async function loader({ request }: Route.LoaderArgs) {
  const sessionToken = getSessionFromRequest(request);
  const nextParams = new URL(request.url).searchParams.get(
    "next"
  ) as unknown as string;
  const prevParams = new URL(request.url).searchParams.get(
    "prev"
  ) as unknown as string;
  const pageSize =
    (new URL(request.url).searchParams.get("pageSize") as unknown as number) ||
    10;
  const user = sessionToken ? await verifySession(sessionToken) : null;

  if (!user) {
    return redirect("/login");
  }

  let dateCondition;

  if (nextParams && prevParams) {
    // next is for going to past (older records)
    const nextDate = new Date(parseInt(nextParams));
    dateCondition = lt(transactions.createdAt, nextDate);
  } else if (nextParams) {
    // next is for going to past (older records)
    const nextDate = new Date(parseInt(nextParams));
    dateCondition = lt(transactions.createdAt, nextDate);
  } else if (prevParams) {
    // previous is for going to now (newer records)
    const prevDate = new Date(parseInt(prevParams));
    dateCondition = gt(transactions.createdAt, prevDate);
  } else {
    // Default: get the most recent records
    const currentTime = Date.now();
    const currentDate = new Date(currentTime);
    dateCondition = lt(transactions.createdAt, currentDate);
  }

  const query = await db
    .select()
    .from(transactions)
    .where(
      and(
        dateCondition,
        sql`lower(${
          transactions.recipientAddress
        }) = ${user.address.toLowerCase()}`
      )
    )
    .orderBy(desc(transactions.createdAt))
    .limit(pageSize);

  const countOlder =
    query.length === pageSize
      ? await db.$count(
          transactions,
          and(
            lt(transactions.createdAt, query[query.length - 1].createdAt),
            sql`lower(${
              transactions.recipientAddress
            }) = ${user.address.toLowerCase()}`
          )
        )
      : 0;

  const countNewer =
    query.length > 0
      ? await db.$count(
          transactions,
          and(
            gt(transactions.createdAt, query[0].createdAt),
            sql`lower(${
              transactions.recipientAddress
            }) = ${user.address.toLowerCase()}`
          )
        )
      : 0;

  const next =
    countOlder > 0 ? query[query.length - 1].createdAt.getTime() : null;
  const previous = countNewer > 0 ? query[0].createdAt.getTime() : null;
  return {
    user,
    data: query as Array<Transaction>,
    next: next as number,
    previous: previous as number,
  };
}

export default function Dashboard() {
  const { data, next, previous } = useLoaderData<typeof loader>();
  const nav = useNavigate();

  const handleNext = (i: number | string) => {
    nav(`/dashboard?next=${i}`);
  };
  const handlePrevious = (i: number | string) => {
    nav(`/dashboard?prev=${i}`);
  };
  return (
    <div className="w-full grid grid-rows-[auto_1fr_auto] min-h-screen">
      <Header />
      <div>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Incoming Payments
          </h2>
          <p className="text-sm text-gray-600">
            See the payments you've received.
          </p>
        </div>
        <div className="h-full">
          <TransactionTable
            data={data}
            next={next}
            previous={previous}
            handleNext={handleNext}
            handlePrevious={handlePrevious}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}
