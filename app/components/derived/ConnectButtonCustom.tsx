import { ConnectButton } from "@xellar/kit";
import { Wallet2 } from "lucide-react";

export default function ConnectButtonCustom() {
  return (
    <ConnectButton.Custom>
      {({ openConnectModal, isConnected, openProfileModal }) => {
        return (
          <button
            type="button"
            className="inline-flex text-center justify-center items-center gap-2 px-9 py-3 rounded-lg bg-wp text-white font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-200 ease-in-out"
            onClick={isConnected ? openProfileModal : openConnectModal}
          >
            <Wallet2 className="size-4" /> Connect Wallet
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}
