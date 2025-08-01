import { ArrowRight, RefreshCcw } from "lucide-react";
import { useRef } from "react";
import ConnectButtonCustom from "~/components/derived/ConnectButtonCustom";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "~/components/ui/select";
import { useWalletLifecycle } from "~/hooks/useWalletLifecycle";
import { ERC20_ABI, MockToken } from "~/lib/constants";
import { useDisconnect, useReadContract } from "wagmi";
import { toast } from "sonner";
import { calculateFees, getTokenByAddress } from "~/lib/utils";
import type { FormData } from "..";

type Props = {
  setData: (x: any) => void;
  setFee: (n: number) => void;
  setTotal: (n: number) => void;
  goNext: () => void;
  data: FormData;
};

export default function Step1Form({
  setData,
  setFee,
  setTotal,
  goNext,
  data,
}: Props) {
  const amountRef = useRef<HTMLInputElement>(null);

  const { isConnected } = useWalletLifecycle({
    onConnect(address) {
      setData((p: any) => ({ ...p, sender: address }));
    },
    onDisconnect() {
      setData((p: any) => ({ ...p, sender: "0x" }));
    },
  });

  const { data: balance } = useReadContract({
    address: data.token.address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [data.sender],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (data.amount! < data.token.minAmount) {
      amountRef.current?.focus();
      toast.error(`Minimum amount is ${data.token.minAmount}`);
      return;
    }

    try {
      const fee = calculateFees(data.amount!, data.token.address);

      const balanceInTokens = Number(balance) / 10 ** data.token.decimal;

      if (balanceInTokens < fee.total) {
        amountRef.current?.focus();
        toast.error(
          `Insufficient balance. Need ${fee.total} ${
            data.token.symbol
          } (including fee), but you only have ${balanceInTokens.toFixed(4)}`
        );
        return;
      }

      setFee(fee.fee);
      setTotal(fee.total);
      setData(data);
      goNext();
    } catch (error) {
      console.error("Fee calculation error:", error);
      toast.error("Error calculating fees");
    }
  };

  const { disconnect } = useDisconnect();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string) => {
    const data = getTokenByAddress(value);
    if (!data) return;

    setData((prev: any) => ({
      ...prev,
      token: {
        address: data.address,
        icon: data.icon,
        symbol: data.symbol,
        decimal: data.decimal,
        minAmount: data.min,
        flat: data.flat,
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full text-center">
      <div className="grid w-full gap-3">
        {isConnected ? (
          <button
            type="button"
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
        <Label htmlFor="sender">Your Address</Label>
        <Input
          id="sender"
          type="text"
          name="sender"
          disabled
          value={data.sender!}
          onChange={handleInputChange}
        />
      </div>
      <div className="grid w-full gap-3">
        <Label htmlFor="receiver">Receiver Address</Label>
        <Input
          id="receiver"
          type="text"
          name="receiver"
          value={data.receiver!}
          onChange={handleInputChange}
        />
      </div>
      <div className="grid w-full gap-3">
        <Label htmlFor="token_address">Select Stablecoin</Label>
        <Select
          value={data.token.address}
          onValueChange={(v) => handleSelectChange(v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue id="token_address" placeholder="Select stablecoin" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Stabelcoin</SelectLabel>
              {MockToken.map((x) => {
                return (
                  <SelectItem key={x.address} value={x.address}>
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
          value={data.amount!}
          onChange={handleInputChange}
        />
      </div>
      <button
        type="submit"
        className="inline-flex w-full text-center justify-center items-center gap-2 px-9 py-3 rounded-lg bg-wp text-white font-semibold shadow-md hover:shadow-lg hover:scale-101 transition-transform duration-200 ease-in-out disabled:cursor-not-allowed disabled:opacity-50"
      >
        Review Payment
        <ArrowRight />
      </button>
    </form>
  );
}
