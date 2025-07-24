import { ConnectButton } from "@xellar/kit";
import { Wallet2 } from "lucide-react";
import { shortenAddress } from "~/lib/utils";

export default function ConnectButtonCustom() {
  return (
    <ConnectButton.Custom>
      {({ openConnectModal, isConnected, openProfileModal, account }) => {
        const address = account?.address || "";

        return (
          <div>
            <button
              className="inline-flex items-center gap-2 px-3 py-3 rounded-lg bg-white text-wp font-semibold hover:bg-sky-50 transition"
              onClick={isConnected ? openProfileModal : openConnectModal}
            >
              <Wallet2 className="size-4" />
              {isConnected ? shortenAddress(address) : "Connect"}
            </button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
