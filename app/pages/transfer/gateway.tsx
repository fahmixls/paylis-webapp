import { useEffect, useState } from "react";
import Footer from "~/components/derived/Footer";
import { parseUnits, type Address } from "viem";
import { AnnouncementBar } from "~/components/derived/ClaimFaucetAnnounce";
import type { data } from "react-router";
import { toast } from "sonner";
import { useWalletClient } from "wagmi";
import { usePayRelay } from "~/hooks/usePayment";
import { ERC20_ABI, PAYMENT_FORWARDER_ADDRESS } from "~/lib/constants";
import { publicClient } from "~/providers";
import { Spinner } from "~/components/derived/Spinner";
import { Speed } from "@openzeppelin/relayer-sdk";

export type FormData = {
  sender: Address | null;
  receiver: Address | null;
  amount: number | null;
  token: {
    address: Address;
    symbol: string;
    icon: string;
    decimal: number;
    minAmount: number;
    flat: number;
  };
  total: number;
  fee: number;
};

export default function Payment() {
  const { data: walletClient } = useWalletClient();
  const [needsApproval, setNeedsApproval] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const { executePayment } = usePayRelay();
  const [data, setData] = useState<FormData>({
    sender: null,
    receiver: null,
    amount: null,
    token: {
      address: "0x",
      symbol: "",
      icon: "",
      decimal: 18,
      minAmount: 0,
      flat: 0,
    },
    total: 0,
    fee: 0,
  });

  useEffect(() => {
    (async () => {
      const allowance = await publicClient.readContract({
        address: data.token.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [data.sender as `0x${string}`, PAYMENT_FORWARDER_ADDRESS],
      });
      setNeedsApproval(
        (allowance as number) <
          parseUnits(String(data.total), data.token.decimal)
      );
    })();
  }, [data.sender, data.token.address, data.total]);

  const handleApproval = async () => {
    toast.loading("Requesting token approval...", { id: "approval" });
    try {
      const hash = await walletClient!.writeContract({
        address: data.token.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [
          PAYMENT_FORWARDER_ADDRESS,
          parseUnits(String(data.total), data.token.decimal),
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
    setIsExecuting(true);
    toast.loading("Processing your payment...", { id: "pay" });
    try {
      if (needsApproval) await handleApproval();
      executePayment({
        token: data.token.address,
        totalInNumber: data.total!,
        total: BigInt(parseUnits(String(data.total), data.token.decimal)),
        recipient: data.receiver as Address,
        speed: Speed.FAST,
        fee: BigInt(parseUnits(String(data.fee), data.token.decimal)),
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
            <Field name="Your Address" value={data.sender} />
            <Field name="Recipient Address" value={data.receiver} />
            <Field
              name={`${data.token.symbol} Address`}
              value={data.token.address}
            />
            <Field
              name="Amount"
              value={`${data.amount} ${data.token.symbol}`}
            />
            <Field name="Fee" value={`${data.fee} ${data.token.symbol}`} />
            <Field
              name="Total To Pay"
              value={`${data.total} ${data.token.symbol}`}
            />
            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className="inline-flex w-full text-center justify-center items-center gap-2 px-9 py-3 rounded-lg bg-wp text-white font-semibold shadow-md hover:shadow-lg hover:scale-101 transition-transform duration-200 ease-in-out disabled:bg-slate-200 disabled:text-wp disabled:cursor-not-allowed"
            >
              {isExecuting ? (
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
