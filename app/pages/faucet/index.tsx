import { RefreshCcw } from "lucide-react";
import { useState } from "react";
import type { Address } from "viem";
import { useDisconnect } from "wagmi";
import { DailyClaimButton } from "~/components/derived/ClaimButton";
import ConnectButtonCustom from "~/components/derived/ConnectButtonCustom";
import Footer from "~/components/derived/Footer";
import { useWalletLifecycle } from "~/hooks/useWalletLifecycle";
import { MockToken } from "~/lib/constants";
import { shortenAddress } from "~/lib/utils";

export default function Faucet() {
  const [userAddress, setUserAddress] = useState<Address | null>();
  const { isConnected } = useWalletLifecycle({
    onConnect(address) {
      setUserAddress(address);
    },
    onDisconnect() {
      setUserAddress(null);
    },
  });
  const { disconnect } = useDisconnect();
  return (
    <div className="w-full grid grid-rows-[auto_1fr_auto] min-h-screen">
      <div aria-hidden />
      <div className="flex items-center w-full flex-col max-w-xs mx-auto justify-center gap-8">
        {isConnected ? (
          <div>
            <p className="font-medium w-full text-center text-wp">{`Your wallet: ${shortenAddress(
              userAddress!
            )}`}</p>
            <br />
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
          </div>
        ) : (
          <div>
            <p className="font-medium w-full text-center text-wp">
              Connect your wallet first!
            </p>
            <br />
            <ConnectButtonCustom />
          </div>
        )}
        {MockToken.map(({ address, icon, symbol, min, decimal }) => (
          <DailyClaimButton
            address={address}
            icon={icon}
            symbol={symbol}
            key={address}
            amount={min * 2}
            activate={isConnected}
            userAddress={userAddress!}
          />
        ))}
        <br />
        <br />
        <p className="text-sm text-gray-700">
          Or you can request by filling this&nbsp;
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScpNW5NTizROT_0WPWG4okw2Nu8f46kbDf4IA8CzauN0uON5g/viewform?usp=header"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            form
          </a>
          .
        </p>
      </div>
      <Footer />
    </div>
  );
}
