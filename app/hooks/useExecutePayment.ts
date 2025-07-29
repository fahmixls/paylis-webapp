import { useAccount, useWalletClient } from "wagmi";
import { encodeFunctionData } from "viem";
import { liskSepolia } from "viem/chains";
import { MinimalForwarderAddress, PaymentGatewayAddress } from "~/mocks/token";
import PAYMENT_GATEWAY_ABI from "~/abi/PaymentGateway.json";
import { useNavigate } from "react-router";

export function useExecutePayment(nonce: bigint | undefined) {
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const navigate = useNavigate();

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
    if (!walletClient || !address || nonce === undefined) {
      throw new Error("Missing wallet client, address, or nonce");
    }

    // Encode the function call to PaymentGateway
    const innerCalldata = encodeFunctionData({
      abi: PAYMENT_GATEWAY_ABI,
      functionName: "pay",
      args: [token, receiver, amount, feeBps],
    });

    // Create the ForwardRequest
    const request = {
      from: address,
      to: PaymentGatewayAddress,
      value: 0n,
      gas: 300_000n,
      nonce,
      data: innerCalldata,
    };

    // Sign the ForwardRequest using EIP-712
    const signature = await walletClient.signTypedData({
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
      message: request,
    });

    // POST to backend API to relay the transaction
    const submitRes = await fetch(`${window.location.origin}/api/transaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        request,
        signature,
        forwarder: MinimalForwarderAddress,
        meta: {
          receiver,
          token,
          amount,
          fee: feeBps,
        },
      }),
    });

    if (!submitRes.ok) {
      const err = await submitRes.json();
      throw new Error(err?.error || "Transaction submission failed");
    }

    const { id } = await submitRes.json();
    //navigate(`/transaction/${id}`);
  };
}
