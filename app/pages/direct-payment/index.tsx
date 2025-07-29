import { ArrowRight, Pencil, RefreshCcw } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import ConnectButtonCustom from "~/components/derived/ConnectButtonCustom";
import Footer from "~/components/derived/Footer";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useWalletLifecycle } from "~/hooks/useWalletLifecycle";
import {
  getTokenByAddress,
  MinimalForwarderAddress,
  MockToken,
  PaymentGatewayAddress,
} from "~/mocks/token";

import { useDisconnect, useReadContract } from "wagmi";
import { useApproveToken } from "~/hooks/useApproveToken";
import { useExecutePayment } from "~/hooks/useExecutePayment";
import { useNeedsApproval } from "~/hooks/useNeedApproval";
import { toast } from "sonner";

import ERC20_ABI from "~/abi/MockIDRX.json";
import MINIMAL_FORWARDER_ABI from "~/abi/MinimalForwarder.json";
import { parseUnits } from "viem";

type FormDataType = {
  sender_address: `0x${string}`;
  token_address: `0x${string}`;
  recipient_address: `0x${string}`;
  token_symbol: string;
  token_icon: string;
  amount: number;
  token_decimal: number;
  token_min_amount: number;
};

export default function DirectPayment() {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const amountRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<FormDataType>({
    sender_address: "0x",
    recipient_address: "0x",
    token_address: "0x",
    token_symbol: "",
    token_icon: "",
    token_decimal: 18,
    token_min_amount: 0,
    amount: 0,
  });
  const [apiData, setApiData] = useState<any>(null);
  const [fee, setFee] = useState(0);
  const [total, setTotal] = useState(0);
  const { address, isConnected } = useWalletLifecycle({
    onConnect(address) {
      setFormData({
        ...formData,
        sender_address: address as `0x${string}`,
      });
    },
    onDisconnect() {
      setFormData({
        ...formData,
        sender_address: "0x",
      });
    },
  });
  const { data: allowance } = useReadContract({
    address: formData.token_address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [address, PaymentGatewayAddress],
    query: { enabled: !!(address && formData.token_address) },
  });
  const { data: nonce } = useReadContract({
    address: MinimalForwarderAddress,
    abi: MINIMAL_FORWARDER_ABI,
    functionName: "getNonce",
    args: [address],
    query: { enabled: !!address },
  });
  const approve = useApproveToken(
    formData.token_address,
    PaymentGatewayAddress,
  );
  const executePayment = useExecutePayment(nonce as bigint);
  const needsApproval = useNeedsApproval(
    allowance as bigint,
    String(formData.amount),
  );

  const handleExecute = async () => {
    toast.loading("Processing your payment...");
    try {
      if (needsApproval) {
        toast("Requesting token approval...");
        await approve(String(formData.amount));
      }

      toast("Executing payment...");
      await executePayment({
        token: formData.token_address,
        receiver: formData.recipient_address,
        amount: BigInt(
          parseUnits(String(formData.amount), formData.token_decimal),
        ),
        feeBps: BigInt(parseUnits(String(fee), formData.token_decimal)),
      });

      toast.success("Payment successful!");
    } catch (err: any) {
      toast.error("Payment failed. Please try again.", {
        duration: Infinity,
        closeButton: true,
      });
    } finally {
      toast.dismiss();
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (value: string) => {
    const data = getTokenByAddress(value);
    setFormData({
      ...formData,
      token_address: data!.address,
      token_icon: data!.icon,
      token_symbol: data!.symbol,
      token_decimal: data!.decimal,
      token_min_amount: data!.min,
    });
  };
  const { data: balance } = useReadContract({
    address: formData.token_address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [formData.sender_address],
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.amount < formData.token_min_amount) {
      amountRef.current?.focus();
      toast(`Minimal amount is ${formData.token_min_amount}`);
      return;
    }
    try {
      const url = `${window.location.origin}/api/transaction/fee?token=${formData.token_address}&amount=${formData.amount}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (Number(balance) < data.total) {
        amountRef.current?.focus();
        toast(
          `Token balance on your wallet is less than ${formData.amount} ${formData.token_symbol}`,
        );
        return;
      }
      setApiData(data);
      setFee(data.fee || 0);
      setTotal(parseFloat(data.total || 0));
      setCurrentStep(2);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  useEffect(() => {
    if (apiData) {
      setCurrentStep(2);
    }
  }, [apiData]);

  const { disconnect } = useDisconnect();

  const StepIndicator = ({ step, title }: { step: number; title: string }) => (
    <div className="flex items-center space-x-2">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
          currentStep >= step ? "bg-wp text-white" : "bg-gray-200 text-gray-500"
        }`}
      >
        {step}
      </div>
      <span
        className={`text-sm ${
          currentStep >= step ? "text-wp" : "text-gray-400"
        }`}
      >
        {title}
      </span>
    </div>
  );

  return (
    <div className="w-full grid grid-rows-[auto_1fr_auto] min-h-screen">
      <div aria-hidden />
      <div className="h-full mx-auto px-6 py-12 flex flex-col max-w-md justify-center items-center">
        <h1 className="w-full text-center font-extrabold text-2xl text-wp mb-12">
          Instantly Send and Receive Stablecoin Payments
        </h1>
        <div className="flex justify-evenly max-w-sm mx-auto gap-x-7 mb-8">
          <StepIndicator step={1} title="Enter Payment Details" />
          <StepIndicator step={2} title="Review & Confirm" />
        </div>
        <div className="flex h-full justify-center py-12 w-full">
          {currentStep === 1 && (
            <form
              onSubmit={handleSubmit}
              className="space-y-6 w-full text-center"
            >
              <div className="grid w-full gap-3">
                {isConnected ? (
                  <button
                    onClick={() => disconnect()}
                    className="inline-flex justify-center items-center w-full gap-2 rounded-md px-8 py-3 text-base font-semibold border transition-all duration-200 ease-in-out
               border-wp text-wp hover:bg-wp/10 hover:shadow-md hover:scale-[1.01]
               focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wp"
                  >
                    <RefreshCcw className="w-5 h-5" />
                    Switch Wallet
                  </button>
                ) : (
                  <ConnectButtonCustom />
                )}
                <br />
                <Label htmlFor="sender_address">Your Address</Label>
                <Input
                  id="sender_address"
                  type="text"
                  name="sender_address"
                  value={formData.sender_address}
                  onChange={handleInputChange}
                  disabled
                />
              </div>
              <div className="grid w-full gap-3">
                <Label htmlFor="recipient_address">Recipient Address</Label>
                <Input
                  id="recipient_address"
                  type="text"
                  name="recipient_address"
                  value={formData.recipient_address}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid w-full gap-3">
                <Label htmlFor="token_address">Select Stablecoin</Label>
                <Select
                  value={formData.token_address}
                  onValueChange={(v) => handleSelectChange(v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      id="token_address"
                      placeholder="Select stablecoin"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Stabelcoin</SelectLabel>
                      {MockToken.map((x) => {
                        return (
                          <SelectItem value={x.address}>
                            <img
                              className="rounded-full size-5 -p-2 outline-1"
                              alt={x.symbol}
                              title={x.name}
                              src={x.icon}
                            />
                            <span>{x.symbol}</span>
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid w-full gap-3">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  name="amount"
                  ref={amountRef}
                  value={formData.amount}
                  onChange={handleInputChange}
                />
              </div>
              <button
                type="submit"
                className="inline-flex w-full text-center justify-center items-center gap-2 px-9 py-3 rounded-lg bg-wp text-white font-semibold shadow-md hover:shadow-lg hover:scale-101 transition-transform duration-200 ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
                disabled={
                  !formData.token_address ||
                  !formData.amount ||
                  !formData.sender_address ||
                  !formData.recipient_address
                }
              >
                Review Payment
                <ArrowRight />
              </button>
            </form>
          )}
          {currentStep === 2 && (
            <div className="space-y-6 w-full">
              <Field name="Your Address" value={formData.sender_address} />
              <Field
                name="Recipient Address"
                value={formData.recipient_address}
              />
              <Field name="Stablecoin" value={formData.token_address} />
              <Field name="Amount" value={formData.amount} />
              <Field name="Fee" value={fee} />
              <Field name="Total To Pay" value={total} />
              <button
                onClick={() => setCurrentStep(1)}
                type="button"
                className="inline-flex w-full text-center justify-center items-center gap-2 px-9 py-3 rounded-lg border border-wp text-wp font-semibold shadow-sm hover:shadow-md hover:scale-101 transition-transform duration-200 ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
              >
                Edit Again
                <Pencil className="size-3" />
              </button>
              <button
                onClick={() => handleExecute()}
                type="button"
                className="inline-flex w-full text-center justify-center items-center gap-2 px-9 py-3 rounded-lg bg-wp text-white font-semibold shadow-md hover:shadow-lg hover:scale-101 transition-transform duration-200 ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
                disabled={
                  !formData.token_address ||
                  !formData.amount ||
                  !formData.sender_address ||
                  !formData.recipient_address
                }
              >
                Process Payment
                <ArrowRight />
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

const Field = ({ name, value }: { name: string; value: any }) => {
  return (
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
};
