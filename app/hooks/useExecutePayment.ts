import { useAccount, useWalletClient } from "wagmi";
import { encodeFunctionData } from "viem";
import { liskSepolia } from "viem/chains";
import { MinimalForwarderAddress } from "~/mocks/token";

import PAYMENT_GATEWAY_ABI from "~/abi/PaymentGateway.json";
import { useNavigate } from "react-router";

export function useExecutePayment(nonce: bigint | undefined) {
  const { data: walletClient } = useWalletClient();
  let navigate = useNavigate();
  const { address } = useAccount();

  return async ({
    token,
    receiver,
    amount,
    feeBps,
  }: {
    token: `0x${string}`;
    receiver: `0x${string}`;
    amount: bigint;
    feeBps: bigint;
  }) => {
    if (!address || nonce === undefined)
      throw new Error("Missing wallet or nonce");
    const innerCalldata = encodeFunctionData({
      abi: PAYMENT_GATEWAY_ABI,
      functionName: "pay",
      args: [token, receiver, amount, feeBps],
    });

    const signature = await walletClient?.signTypedData({
      domain: {
        name: "MinimalForwarder",
        version: "0.0.1",
        chainId: liskSepolia.id,
        verifyingContract: MinimalForwarderAddress,
      },
      types: {
        ForwardRequest: [
          { name: "from", type: "address" },
          { name: "to", type: "address" },
          { name: "value", type: "uint256" },
          { name: "gas", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "data", type: "bytes" },
        ],
      },
      primaryType: "ForwardRequest",
      message: {
        from: address,
        to: receiver,
        value: 0n,
        gas: 30_000n,
        nonce,
        data: innerCalldata,
      },
    });

    const backendUrl = `${window.location.origin}/api/transaction`;
    const submitRes = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: {
          from: address,
          to: receiver,
          value: 0n,
          gas: 30_000n,
          nonce,
          data: innerCalldata,
          amount,
          feeBps,
          token,
        },
        signature,
        forwarder: MinimalForwarderAddress,
      }),
    });

    if (!submitRes.ok) {
      const err = await submitRes.json();
      throw new Error(err?.error || "Submission failed");
    }

    const { id } = await submitRes.json();
    navigate(`/transaction/${id}`);
  };
}
