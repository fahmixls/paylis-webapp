import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { getTokenByAddress, shortenAddress } from "~/lib/utils";
import { db } from "~/db/connection";
import { transactions, type Transaction } from "~/db/schema";
import { eq, or } from "drizzle-orm";
import type { Route } from "./+types";
import { useLoaderData } from "react-router";
import { TransactionStatusBadge } from "~/components/derived/TransactionStatusBadge";

export const meta: Route.MetaFunction = () => [
  { title: "Transaction Details" },
];

export async function loader({ params }: Route.LoaderArgs) {
  const rows = await db
    .select()
    .from(transactions)
    .where(
      or(
        eq(transactions.txHash, params.id),
        eq(transactions.transactionId, params.id)
      )
    )
    .limit(1);
  if (!rows.length) throw new Response("Not found", { status: 404 });
  return Response.json(rows[0]);
}

export default function TransactionPage() {
  const tx = useLoaderData<Transaction>();
  const token = getTokenByAddress(tx.tokenAddress);
  console.log(tx);

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
            <TransactionStatusBadge status={tx.status} />

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

            <Field label="Payer">
              <Mono>
                <a
                  className="text-wp font-normal underline"
                  href={`https://sepolia-blockscout.lisk.com/address/${tx.payerAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {shortenAddress(tx.payerAddress!, 16)}
                </a>
              </Mono>
            </Field>

            <Field label="Recipient">
              <Mono>
                <a
                  className="text-wp font-normal underline"
                  href={`https://sepolia-blockscout.lisk.com/address/${tx.recipientAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {shortenAddress(tx.recipientAddress!, 16)}
                </a>
              </Mono>
            </Field>

            <Field label="Stablecoin">
              <div className="flex items-center gap-3 mb-1 py-1">
                <img src={token?.icon} alt={token?.symbol} className="size-4" />
                <p className="text-medium text-lg font-semibold text-wp">
                  {token?.symbol}
                </p>
              </div>
              <Mono>
                <a
                  className="text-wp font-normal underline"
                  href={`https://sepolia-blockscout.lisk.com/address/${tx.tokenAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {shortenAddress(tx.tokenAddress!, 16)}
                </a>
              </Mono>
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
