import { useWriteContract } from "wagmi";
import ERC20_ABI from "~/abi/MockIDRX.json";
import { publicClient } from "~/providers";

export function useApproveToken(token: `0x${string}`, spender: string) {
  const { writeContractAsync } = useWriteContract();

  return async (amount: string) => {
    const tx = await writeContractAsync({
      address: token,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [spender, amount],
    });
    await publicClient.waitForTransactionReceipt({ hash: tx });
  };
}
