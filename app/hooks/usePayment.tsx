import { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { encodeFunctionData, type Address } from "viem";
import { Speed } from "@openzeppelin/relayer-sdk";
import type { SplitPayment } from "~/types";
import { signTypedData } from "@wagmi/core";
import {
  domain,
  PAYMENT_FORWARDER_ABI,
  PAYMENT_FORWARDER_ADDRESS,
  splitPaymentTypes,
} from "~/lib/constants";
import { useNavigate } from "react-router";
import { config, publicClient } from "~/providers";

type PayParams = {
  token: Address;
  totalInNumber: number;
  total: bigint;
  fee: bigint;
  recipient: Address;
  speed?: Speed;
  order?: number;
};

type HookReturn = {
  isLoading: boolean;
  error: string | null;
  executePayment: (params: PayParams) => Promise<void>; // <-- fixed type
};

export function usePayRelay(): HookReturn {
  const nav = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { address: userAddress, chainId } = useAccount();

  const executePayment = useCallback(
    async (params: PayParams) => {
      if (!userAddress || !chainId) {
        throw new Error("Wallet not connected");
      }

      setIsLoading(true);
      setError(null);

      try {
        const { total, token, recipient, fee, totalInNumber } = params;

        // 1. Get nonce from forwarder
        const nonce = await publicClient.readContract({
          address: PAYMENT_FORWARDER_ADDRESS,
          abi: PAYMENT_FORWARDER_ABI,
          functionName: "getNonce",
          args: [userAddress],
        });

        // 2. Prepare EIP-712 typed data
        const signed: SplitPayment = {
          from: userAddress,
          to: recipient,
          token: token,
          total,
          fee,
          nonce: nonce as bigint,
          deadline: BigInt(Math.floor(Date.now() / 1000) + 600), // 10 min
        };

        // 3. Sign typed data
        const signature = await signTypedData(config, {
          domain,
          types: splitPaymentTypes,
          primaryType: "SplitPayment",
          message: signed,
        });

        // 4. Encode calldata for relay
        const data = encodeFunctionData({
          abi: PAYMENT_FORWARDER_ABI,
          functionName: "executeSplitPayment",
          args: [
            {
              splitPayment: {
                from: signed.from as Address,
                to: signed.to as Address,
                token: signed.token as Address,
                total: BigInt(signed.total),
                fee: BigInt(signed.fee),
                nonce: BigInt(signed.nonce),
                deadline: BigInt(signed.deadline),
              },
              signature: signature as `0x${string}`,
            },
          ],
        });

        // 5. Send request to backend relay
        const submitRes = await fetch(
          `${window.location.origin}/api/transaction`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              data,
              meta: {
                receiver: recipient,
                token,
                total: totalInNumber,
                from: userAddress,
                amount: total - fee,
              },
              orderId: params.order,
            }),
          }
        );

        if (!submitRes.ok) {
          const err = await submitRes.json();
          throw new Error(err?.error || "Transaction submission failed");
        }

        const { id } = await submitRes.json();

        if (!id) {
          throw new Error("Transaction hash missing from backend response");
        }

        nav(`/transaction/${id}`);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        console.error("PayRelay error:", err);
        throw err; // let caller know it failed
      } finally {
        setIsLoading(false);
      }
    },
    [userAddress, chainId]
  );

  return {
    executePayment,
    isLoading,
    error,
  };
}
