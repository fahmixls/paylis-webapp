import { parseUnits } from "viem";
import { DailyClaimButton } from "~/components/derived/ClaimButton";
import Footer from "~/components/derived/Footer";
import { MockToken } from "~/lib/constants";

export default function Faucet() {
  return (
    <div className="w-full grid grid-rows-[auto_1fr_auto] min-h-screen">
      <div aria-hidden />
      <div className="flex items-center justify-center flex-row gap-8">
        {MockToken.map(({ address, icon, symbol, min, decimal }) => (
          <DailyClaimButton
            address={address}
            icon={icon}
            symbol={symbol}
            key={address}
            amount={parseUnits(String(min * 2), decimal)}
          />
        ))}
      </div>
      <Footer />
    </div>
  );
}
