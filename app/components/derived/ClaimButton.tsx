import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";
import type { Address } from "viem";
import { toast } from "sonner";
import { publicClient } from "~/providers";
import { ERC20_ABI } from "~/lib/constants";
import { useAccount } from "wagmi";

const STORAGE_PREFIX = "daily_click_";

const getToday = () => new Date().toISOString().split("T")[0];

export function DailyClaimButton({
  address,
  icon,
  symbol,
  amount,
}: {
  address: Address;
  icon: string;
  symbol: string;
  amount: bigint;
}) {
  const [disabled, setDisabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const { address: userAddress } = useAccount();

  const handleClaim = async () => {
    setLoading(true);
    const hash = await publicClient.readContract({
      address: address,
      abi: ERC20_ABI,
      functionName: "publicMint",
      args: [amount],
    });
    await publicClient.waitForTransactionReceipt({ hash: hash as Address });
    const key = `${STORAGE_PREFIX}${userAddress}`;
    const today = getToday();
    localStorage.setItem(key, today);
    setDisabled(true);
    toast.success("🎉 Reward claimed!");
    setLoading(false);
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
      disabled={disabled || loading}
      variant="outline"
      className="flex items-center gap-2 text-wp px-4 py-2"
    >
      {loading ? <Loader2 className="animate-spin h-4 w-4" /> : null}
      {!loading && disabled ? <CheckCircle className="h-4 w-4" /> : null}
      <div className="flex items-center gap-2 text-lg font-semibold text-wp">
        Claim <img className="size-4" src={icon} alt={symbol} />
        {symbol}
      </div>
    </Button>
  );
}
