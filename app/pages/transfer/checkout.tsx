import { useEffect, useState } from "react";
import Footer from "~/components/derived/Footer";
import { parseUnits, type Address } from "viem";
import { AnnouncementBar } from "~/components/derived/ClaimFaucetAnnounce";
import { toast } from "sonner";
import { useDisconnect, useWalletClient } from "wagmi";
import { usePayRelay } from "~/hooks/usePayment";
import { ERC20_ABI, PAYMENT_FORWARDER_ADDRESS } from "~/lib/constants";
import { publicClient } from "~/providers";
import { Spinner } from "~/components/derived/Spinner";
import { Speed } from "@openzeppelin/relayer-sdk";
import { type FormData } from ".";
import type { Route } from "./+types/checkout";
import {
  merchants,
  paymentIntents,
  transactions,
  users,
  type PaymentIntent,
} from "~/db/schema";
import { db } from "~/db/connection";
import { eq, or, sql } from "drizzle-orm";
import { redirect, useLoaderData } from "react-router";
import { calculateFees, getTokenByAddress } from "~/lib/utils";
import { useWalletLifecycle } from "~/hooks/useWalletLifecycle";
import { RefreshCcw } from "lucide-react";
import ConnectButtonCustom from "~/components/derived/ConnectButtonCustom";
import type { TokenType } from "~/types";

export async function loader({ params }: Route.LoaderArgs) {
  const rows = await db
    .select()
    .from(paymentIntents)
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
  });
}

export default function Payment() {
  const [isLoading, setIsLoading] = useState(true);
  const {
    order,
    user: merchantAddress,
    token,
    total,
    fee,
    isPayed,
  } = useLoaderData<{
    order: PaymentIntent;
    user: Address;
    token: TokenType;
    total: number;
    fee: number;
    isPayed: boolean;
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
    if (needsApproval) await handleApproval();
    setIsExecuting(true);
    toast.loading("Processing your payment...", { id: "pay" });
    try {
      executePayment({
        token: data.token.address,
        totalInNumber: data.total!,
        total: BigInt(parseUnits(String(data.total), data.token.decimal)),
        recipient: data.receiver as Address,
        speed: Speed.FAST,
        fee: BigInt(parseUnits(String(data.fee), data.token.decimal)),
        order: order.id,
      });
      toast.success("Payment successful!", { id: "pay" });
    } catch (e) {
      console.error(e);
      toast.error("Payment failed. Please try again later.", { id: "pay" });
    } finally {
      setIsExecuting(false);
    }
  };

  const Field = ({ name, value }: { name: string; value: any }) => (
    <div className="grid w-full border-b border-slate-200">
      <label className="text-slate-500 text-sm">{name}</label>
      <input
        className="appearance-none truncate text-wp text-lg wrap-normal border-none p-0 m-0 font-medium font-mono focus:outline-none tracking-tighter"
        value={value}
        title={value}
        disabled
      />
    </div>
  );

  const { disconnect } = useDisconnect();

  return (
    <div className="w-full grid grid-rows-[auto_1fr_auto] min-h-screen">
      <AnnouncementBar />
      <div aria-hidden />
      <div className="h-full mx-auto px-6 py-12 flex flex-col max-w-md justify-center items-center">
        <h1 className="w-full text-center font-extrabold text-2xl text-wp mb-12">
          Instantly Send and Receive Stablecoin Payments
        </h1>
        <div className="flex justify-evenly max-w-sm mx-auto gap-x-7 mb-8"></div>
        <div className="flex h-full justify-center py-12 w-full">
          <div className="space-y-6 w-full">
            {isConnected ? (
              <button
                type="button"
                onClick={() => disconnect()}
                className="inline-flex w-full justify-center items-center gap-2 rounded-md px-8 py-3 text-base font-semibold border transition-all duration-200 ease-in-out
               border-wp text-wp hover:bg-wp/10 hover:shadow-md hover:scale-[1.01]
               focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wp"
              >
                <RefreshCcw className="w-5 h-5" />
                Switch Wallet
              </button>
            ) : (
              <div className="w-full flex justify-center">
                <ConnectButtonCustom />
              </div>
            )}
            <br />
            <Field name="Your Address" value={data.sender} />
            <Field name="Recipient Address" value={data.receiver} />
            <Field
              name={`${data.token.symbol} Address`}
              value={order.tokenAddress}
            />
            <Field
              name="Amount"
              value={`${order.amount} ${data.token.symbol}`}
            />
            <Field name="Fee" value={`${data.fee} ${data.token.symbol}`} />
            <Field
              name="Total To Pay"
              value={`${data.total} ${data.token.symbol}`}
            />
            {isPayed ? (
              <div className="rounded-sm bg-green-50 border border-green-200 text-green-800 p-4 text-sm">
                <p className="font-medium">This order has already been paid.</p>
              </div>
            ) : null}
            <button
              onClick={handleExecute}
              disabled={isExecuting || isLoading || isPayed}
              className="inline-flex w-full text-center justify-center items-center gap-2 px-9 py-3 rounded-sm bg-wp text-white font-semibold shadow-md hover:shadow-lg hover:scale-101 transition-transform duration-200 ease-in-out disabled:bg-slate-200 disabled:text-wp disabled:cursor-not-allowed"
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
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
