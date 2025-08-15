import { useEffect, useState } from "react";
import { parseUnits, type Address } from "viem";
import { toast } from "sonner";
import { useDisconnect, useWalletClient } from "wagmi";
import { usePayRelay } from "~/hooks/usePayment";
import { ERC20_ABI, PAYMENT_FORWARDER_ADDRESS } from "~/lib/constants";
import { publicClient } from "~/providers";
import { Speed } from "@openzeppelin/relayer-sdk";
import {
  merchants,
  paymentIntents,
  transactions,
  users,
  type PaymentIntent,
} from "~/db/schema";
import { db } from "~/db/connection";
import { eq, or, sql } from "drizzle-orm";
import { Link, redirect, useLoaderData } from "react-router";
import { calculateFees, getTokenByAddress, shortenAddress } from "~/lib/utils";
import { useWalletLifecycle } from "~/hooks/useWalletLifecycle";
import type { TokenType } from "~/types";
import type { Route } from "./+types";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import ConnectButtonCustom from "~/components/derived/ConnectButtonCustom";
import { Spinner } from "~/components/derived/Spinner";

export type FormData = {
  sender: Address | null;
  receiver: Address | null;
  merchantName: string | null;
  amount: number | null;
  total: number | null;
  fee: number | null;
  transactionId: string | null;
  token: {
    address: Address;
    symbol: string;
    icon: string;
    decimal: number;
    min: number;
    flat: number;
  };
};

export async function loader({ params }: Route.LoaderArgs) {
  const rows = await db
    .select({
      merchantName: merchants.name,
      merchantId: paymentIntents.merchantId,
      tokenAddress: paymentIntents.tokenAddress,
      amount: paymentIntents.amount,
      id: paymentIntents.id,
    })
    .from(paymentIntents)
    .leftJoin(merchants, eq(paymentIntents.merchantId, merchants.id))
    .where(
      or(
        eq(paymentIntents.id, Number(params.id)),
        eq(paymentIntents.orderId, params.id)
      )
    )
    .limit(1);
  if (!rows.length) throw new Response("Not found", { status: 404 });
  const dataUser = await db.execute(sql`
      select ${users.address}
      from ${users}
      left join ${merchants} on ${merchants.userId} = ${users.id}
      where ${merchants.id} = ${rows[0].merchantId}
      limit 1
    `);
  const token = getTokenByAddress(rows[0].tokenAddress);
  const dataAmount = calculateFees(
    Number(rows[0].amount),
    rows[0].tokenAddress as Address
  );
  const transactionRow = await db
    .select()
    .from(transactions)
    .where(eq(transactions.orderId, rows[0].id as unknown as string));
  if (transactionRow.length > 0) {
    redirect(`/transaction/${transactionRow[0].txHash}`);
  }
  return Response.json({
    order: rows[0],
    user: dataUser.rows[0].address,
    token,
    total: dataAmount.total,
    fee: dataAmount.fee,
    isPayed: transactionRow.length > 0,
    transactionId:
      transactionRow.length > 0 ? transactionRow[0].transactionId : null,
    merchantName: rows[0].merchantName,
  });
}
export default function TransferV2Page() {
  const [isLoading, setIsLoading] = useState(true);
  const {
    order,
    user: merchantAddress,
    token,
    total,
    fee,
    merchantName,
    isPayed,
    transactionId,
  } = useLoaderData<{
    order: PaymentIntent;
    user: Address;
    token: TokenType;
    total: number;
    fee: number;
    merchantName: string;
    isPayed: boolean;
    transactionId: string | null;
  }>();
  const { data: walletClient } = useWalletClient();
  const [needsApproval, setNeedsApproval] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const { executePayment } = usePayRelay();
  const [data, setData] = useState<FormData>({
    sender: null,
    receiver: merchantAddress,
    amount: Number(order.amount),
    token,
    total,
    fee,
    merchantName,
    transactionId,
  });

  const { isConnected, address: userAddress } = useWalletLifecycle({
    onConnect(address) {
      setData({
        ...data,
        sender: address,
      });
    },
    onDisconnect() {
      setData({
        ...data,
        sender: null,
      });
    },
  });

  useEffect(() => {
    if (!isConnected) return;

    (async () => {
      try {
        setIsLoading(true);
        const allowance = await publicClient.readContract({
          address: order.tokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "allowance",
          args: [userAddress, PAYMENT_FORWARDER_ADDRESS],
        });

        setNeedsApproval(
          (allowance as bigint) <
            parseUnits(String(order.amount), token?.decimal as number)
        );
      } catch (err) {
        console.error("Error loading allowance/fees:", err);
        toast.error("Failed to load payment data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [order, userAddress, isConnected]);

  const handleApproval = async () => {
    toast.loading("Requesting token approval...", { id: "approval" });
    try {
      const dataAmount = calculateFees(
        Number(order.amount),
        order.tokenAddress as Address
      );
      const hash = await walletClient!.writeContract({
        address: data.token.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [
          PAYMENT_FORWARDER_ADDRESS,
          parseUnits(String(dataAmount.total), data.token.decimal),
        ],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      setNeedsApproval(false);
      toast.success("Approval successful!", { id: "approval" });
    } catch (e) {
      console.error(e);
      toast.error("Approval failed. Please check your wallet.", {
        id: "approval",
      });
    }
  };

  const handleExecute = async () => {
    console.log("Here");
    if (needsApproval) {
      await handleApproval();
    }

    setIsExecuting(true);
    toast.loading("Processing your payment...", { id: "pay" });

    try {
      await executePayment({
        token: data.token.address,
        totalInNumber: data.total!,
        total: BigInt(parseUnits(String(data.total), data.token.decimal)),
        recipient: data.receiver as Address,
        speed: Speed.FAST,
        fee: BigInt(parseUnits(String(data.fee), data.token.decimal)),
        order: order.id,
      });

      toast.success("Payment successful!", { id: "pay" });
    } catch {
      toast.error("Payment failed. Please try again later.", { id: "pay" });
    } finally {
      setIsExecuting(false);
    }
  };

  const { disconnect } = useDisconnect();
  return (
    <div className="w-full grid grid-rows-[auto_1fr_auto] bg-background min-h-screen text-foreground">
      <main className="max-w-2xl mx-auto w-full space-y-8">
        <header className="bg-orange-50 px-5 py-3.5 border-b-2 border-logo-bg">
          <h1 className="text-2xl font-bold text-logo-bg">
            {merchantName} Payment
          </h1>
          <p className="text-gray-700 text-sm">
            Powered by Paylis - borderless payments zero volatility one plugin.
          </p>
        </header>

        <Card className="rounded-md px-7 bg-[#fefefe] m-0 border-0 shadow-none pb-14">
          <CardHeader className="px-0">
            <CardTitle>
              {isPayed
                ? "This order already paid ✅"
                : "Finalize your payment securely using stablecoins"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-7 px-0">
            <br />
            {/* Token Selection */}
            <div className="space-y-1">
              <h4 className="text-sm font-normal text-muted-foreground">
                Stablecoin Token
              </h4>
              <div className="flex gap-x-2 items-center">
                <h3 className="text-base font-medium whitespace-nowrap">{`Stablecoin ${token.symbol}`}</h3>
                <img src={token.icon} alt={token.name} className="size-4" />{" "}
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-1">
              <h4 className="text-sm font-normal text-muted-foreground">
                Amount to Send
              </h4>
              <p className="flex items-center gap-2 text-lg font-semibold">
                <span>{total}</span>
                <span>{token.symbol}</span>
              </p>
            </div>

            {/* Your Address */}
            {!isPayed ? (
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Your Wallet Address
                </h4>{" "}
                {isConnected ? (
                  <div className="flex gap-4">
                    <p className="font-mono text-sm break-all">
                      {shortenAddress(userAddress as string)}
                    </p>
                    <button
                      type="button"
                      onClick={() => disconnect()}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Change Wallet
                    </button>
                  </div>
                ) : (
                  <p className="text-sm font-bold duration-500 text-red-600 animate-pulse hover:underline hover:text-red-700">
                    Connect Your Wallet
                  </p>
                )}
              </div>
            ) : null}

            {/* Recipient Address */}
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground">
                Recipient Wallet Address
              </h4>
              <p className="font-mono text-sm break-all">
                {shortenAddress(merchantAddress)}{" "}
                {merchantName ? `(${merchantName} merchant)` : ""}
              </p>
            </div>

            {/* Button to Connect or Pay */}
          </CardContent>
        </Card>

        {/* Info */}
        <div className="text-muted-foreground px-7 pb-14">
          {isPayed ? (
            <Link
              className="inline-flex text-center justify-center items-center gap-2 px-9 py-3 rounded-md bg-wp text-white font-semibold shadow-md hover:shadow-lg hover:scale-101 transition-transform duration-200 ease-in-out w-full max-w-2xs disabled:cursor-not-allowed disabled:bg-muted-foreground"
              to={`/transaction/${transactionId}`}
            >
              Get Transaction Detail
            </Link>
          ) : isConnected ? (
            <button
              onClick={handleExecute}
              disabled={isExecuting || isLoading || isPayed}
              className="inline-flex text-center justify-center items-center gap-2 px-9 py-3 rounded-md bg-wp text-white font-semibold shadow-md hover:shadow-lg hover:scale-101 transition-transform duration-200 ease-in-out w-full max-w-2xs disabled:cursor-not-allowed disabled:bg-muted-foreground"
            >
              {isExecuting || isLoading ? (
                <>
                  <Spinner />
                  <span>Processing...</span>
                </>
              ) : (
                "Process Payment"
              )}
            </button>
          ) : (
            <div className="w-full">
              <ConnectButtonCustom />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
