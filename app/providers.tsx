"use client";

import { liskSepolia } from "viem/chains";
import { defaultConfig } from "@xellar/kit";
import { WagmiProvider, type Config } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { XellarKitProvider, lightTheme } from "@xellar/kit";
import type React from "react";

const queryClient = new QueryClient();
const walletConnectProjectId = import.meta.env.VITE_CONNECT;
const xellarAppId = import.meta.env.VITE_XELLAR;

const config = defaultConfig({
  appName: "Paylis",
  walletConnectProjectId,
  xellarAppId,
  xellarEnv: "production",
  chains: [liskSepolia],
}) as Config;

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <XellarKitProvider theme={lightTheme}>{children}</XellarKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
