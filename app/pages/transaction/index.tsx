import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { cn, getTokenByAddress, shortenAddress } from "~/lib/utils";
import { db } from "~/db/connection";
import { transactions, type Transaction } from "~/db/schema";
import { eq } from "drizzle-orm";
import type { Route } from "./+types";
import { useLoaderData } from "react-router";
import { parseUnits } from "viem";

export const meta: Route.MetaFunction = () => [
  { title: "Transaction Details" },
];

export async function loader({ params }: Route.LoaderArgs) {
  const rows = await db
    .select()
    .from(transactions)
    .where(eq(transactions.txHash, params.id))
    .limit(1);
  if (!rows.length) throw new Response("Not found", { status: 404 });
  return Response.json(rows[0]);
}

export default function TransactionPage() {
  const tx = useLoaderData<Transaction>();
  const token = getTokenByAddress(tx.tokenAddress);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[url(http://api.thumbr.it/whitenoise-361x370.png?background=ffffffff&noise=5c5c5c&density=13&opacity=62)]">
      <div className="w-full max-w-md">
        <Card className="bg-transparent shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-slate-800">
              Transaction Details
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={cn(
                  "font-medium rounded-full",
                  tx.status.toLowerCase() === "success"
                    ? "bg-green-500 text-white dark:bg-green-600"
                    : tx.status === "reverted"
                    ? "bg-red-500 text-white dark:bg-red-600"
                    : "bg-yellow-500 text-white dark:bg-yellow-600"
                )}
              >
                {tx.status.toLowerCase() === "success"
                  ? "Success"
                  : tx.status === "reverted"
                  ? "Failed"
                  : "Pending"}
              </Badge>
            </div>

            <Field label="Recipient">
              <Mono>{shortenAddress(tx.recipientAddress, 16)}</Mono>
            </Field>

            <Field label="Token">
              <div className="flex items-center gap-3 mb-1 py-1">
                <img src={token?.icon} alt={token?.symbol} className="size-9" />
                <p className="text-medium text-lg font-semibold text-wp">
                  {token?.symbol}
                </p>
              </div>
              <Mono>{shortenAddress(tx.tokenAddress, 16)}</Mono>
            </Field>

            <Field label="Amount">
              <Mono>{`${tx.amount} ${token?.symbol}`}</Mono>
            </Field>

            <Field label="Confirmed At">
              <Mono>
                {tx.confirmedAt
                  ? new Date(tx.confirmedAt).toLocaleDateString("en-EN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"}
              </Mono>
            </Field>

            <Field label="Transaction Hash">
              <Mono>
                <a
                  className="text-wp font-normal underline"
                  href={`https://sepolia-blockscout.lisk.com/tx/${tx.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {shortenAddress(tx.txHash!, 16)}
                </a>
              </Mono>
            </Field>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-medium text-slate-500 mb-0.5">{label}</p>
      <div className="text-lg text-slate-800">{children}</div>
    </div>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono bg-slate-100 py-1 rounded break-words">
      {children}
    </span>
  );
}
