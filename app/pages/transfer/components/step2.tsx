import { Pencil, Check } from "lucide-react";
import { useState, useEffect } from "react";
import type { FormData } from "..";
import { parseUnits, type Address } from "viem";
import { useWalletClient } from "wagmi";
import { publicClient } from "~/providers";
import { ERC20_ABI, PAYMENT_FORWARDER_ADDRESS } from "~/lib/constants";
import { toast } from "sonner";
import { usePayRelay } from "~/hooks/usePayment";
import { Speed } from "@openzeppelin/relayer-sdk";
import { Spinner } from "~/components/derived/Spinner";

type Props = {
  formData: FormData;
  fee: number;
  total: number;
  goBack: () => void;
};

export default function Step2Review({ formData, fee, total, goBack }: Props) {
  const { data: walletClient } = useWalletClient();
  const [needsApproval, setNeedsApproval] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const { executePayment } = usePayRelay();

  useEffect(() => {
    (async () => {
      const allowance = await publicClient.readContract({
        address: formData.token.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [formData.sender as `0x${string}`, PAYMENT_FORWARDER_ADDRESS],
      });
      setNeedsApproval(
        (allowance as number) <
          parseUnits(String(total), formData.token.decimal)
      );
    })();
  }, [formData.sender, formData.token.address, total]);

  const handleApproval = async () => {
    toast.loading("Requesting token approval...", { id: "approval" });
    try {
      const hash = await walletClient!.writeContract({
        address: formData.token.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [
          PAYMENT_FORWARDER_ADDRESS,
          parseUnits(String(total), formData.token.decimal),
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
        token: formData.token.address,
        totalInNumber: total!,
        total: BigInt(parseUnits(String(total), formData.token.decimal)),
        recipient: formData.receiver as Address,
        speed: Speed.FAST,
        fee: BigInt(parseUnits(String(fee), formData.token.decimal)),
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
    <div className="space-y-6 w-full">
      <Field name="Your Address" value={formData.sender} />
      <Field name="Recipient Address" value={formData.receiver} />
      <Field
        name={`${formData.token.symbol} Address`}
        value={formData.token.address}
      />
      <Field
        name="Amount"
        value={`${formData.amount} ${formData.token.symbol}`}
      />
      <Field name="Fee" value={`${fee} ${formData.token.symbol}`} />
      <Field name="Total To Pay" value={`${total} ${formData.token.symbol}`} />

      <button
        onClick={goBack}
        type="button"
        className="inline-flex w-full text-center justify-center items-center gap-2 px-9 py-3 rounded-lg border border-wp text-wp font-semibold shadow-sm hover:shadow-md hover:scale-101 transition-transform duration-200 ease-in-out"
      >
        Edit Again
        <Pencil className="size-3" />
      </button>
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
  );
}
