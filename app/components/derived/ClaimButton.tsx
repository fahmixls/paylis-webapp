import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";
import type { Address } from "viem";
import { toast } from "sonner";
import { config, publicClient } from "~/providers";
import { ERC20_ABI } from "~/lib/constants";
import { writeContract } from "@wagmi/core";

const STORAGE_PREFIX = "daily_click_";

const getToday = () => new Date().toISOString().split("T")[0];

export function DailyClaimButton({
  address,
  icon,
  symbol,
  amount,
  activate,
  userAddress,
}: {
  address: Address;
  icon: string;
  symbol: string;
  amount: number;
  activate: boolean;
  userAddress: Address;
}) {
  const [disabled, setDisabled] = useState(true);
  const [loading, setLoading] = useState(true);

  const handleClaim = async () => {
    try {
      setLoading(true);
      const hash = await writeContract(config, {
        address,
        abi: ERC20_ABI,
        functionName: "publicMint",
        args: [amount],
        account: userAddress,
      });
      await publicClient.waitForTransactionReceipt({ hash: hash as Address });
      const key = `${STORAGE_PREFIX}${userAddress}`;
      const today = getToday();
      localStorage.setItem(key, today);
      setDisabled(true);
      toast.success("🎉 Reward claimed!");
      setLoading(false);
    } catch (e) {
      setLoading(false);
      toast.error("Failed to claim faucet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const key = `${STORAGE_PREFIX}${address}${userAddress}`;
      const lastClick = localStorage.getItem(key);
      const today = getToday();

      if (lastClick === today) {
        setDisabled(true);
        toast.warning("Come back tomorrow!");
      } else {
        setDisabled(false);
      }

      setLoading(false);
    };

    init();
  }, []);

  return (
    <Button
      onClick={handleClaim}
      disabled={disabled || loading || !activate}
      variant="outline"
      className="flex items-center gap-2 w-full h-12 text-wp px-4 py-2"
    >
      {loading ? <Loader2 className="animate-spin h-4 w-4" /> : null}
      {!loading && disabled ? <CheckCircle className="h-4 w-4" /> : null}
      <div className="flex items-center gap-2 text-lg font-semibold text-wp">
        Claim {amount} <img className="size-4" src={icon} alt={symbol} />
        {symbol}
      </div>
    </Button>
  );
}
