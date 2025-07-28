import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { shortenAddress } from "~/lib/utils";
import { db } from "~/db/connection";
import { transactions, type Transaction } from "~/db/schema";
import { eq } from "drizzle-orm";
import type { Route } from "./+types";
import { useLoaderData } from "react-router";

export const meta: Route.MetaFunction = () => [
  { title: "Transaction Details" },
];

export async function loader({ params }: Route.LoaderArgs) {
  const rows = await db
    .select()
    .from(transactions)
    .where(eq(transactions.transactionId, params.id))
    .limit(1);
  if (!rows.length) throw new Response("Not found", { status: 404 });
  return Response.json(rows[0]);
}

export default function TransactionPage() {
  const tx = useLoaderData<Transaction>();

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-slate-800">
              Transaction Details
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* status badge */}
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={
                  tx.status === "connected"
                    ? "border-green-600 text-green-700"
                    : tx.status === "connecting"
                      ? "border-yellow-600 text-yellow-700"
                      : "border-red-600 text-red-700"
                }
              >
                {tx.status}
              </Badge>
            </div>

            {/* success icon */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-2">
                <span className="text-3xl">✅</span>
              </div>
              <p className="text-sm text-slate-600">Confirmed on-chain</p>
            </div>

            {/* fields */}
            <Field label="Recipient">
              <Mono>{shortenAddress(tx.recipientAddress, 8)}</Mono>
            </Field>

            <Field label="Token">
              <Mono>{shortenAddress(tx.tokenAddress, 8)}</Mono>
            </Field>

            <Field label="Amount">
              <span className="font-semibold text-slate-900">{tx.amount}</span>
            </Field>

            <Field label="Block">
              <Mono>{tx.blockNumber}</Mono>
            </Field>

            <Field label="Confirmed At">
              <Mono>{String(tx.confirmedAt)}</Mono>
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
      <p className="text-xs font-medium text-slate-600 mb-0.5">{label}</p>
      <div className="text-sm text-slate-800">{children}</div>
    </div>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono bg-slate-100 py-1 rounded text-xs break-words">
      {children}
    </span>
  );
}
