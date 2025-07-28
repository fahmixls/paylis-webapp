import { useWriteContract } from "wagmi";
import ERC20_ABI from "~/abi/MockIDRX.json";
import { parseEther } from "viem";

export function useApproveToken(token: `0x${string}`, spender: string) {
  const { writeContractAsync } = useWriteContract();

  return async (amount: string) => {
    const parsedAmount = parseEther(amount);
    return await writeContractAsync({
      address: token,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [spender, parsedAmount],
    });
  };
}
