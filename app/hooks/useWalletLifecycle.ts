import { useRef } from "react";
import { useAccount } from "wagmi";

type WalletLifecycleProps = {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
};

export function useWalletLifecycle({
  onConnect,
  onDisconnect,
}: WalletLifecycleProps) {
  const { address, isConnected, isDisconnected } = useAccount();
  const wasConnected = useRef(false);

  if (isConnected && !wasConnected.current) {
    wasConnected.current = true;
    onConnect?.(address!);
  }

  if (isDisconnected && wasConnected.current) {
    wasConnected.current = false;
    onDisconnect?.();
  }

  return {
    isConnected,
    isDisconnected,
    address,
  };
}
