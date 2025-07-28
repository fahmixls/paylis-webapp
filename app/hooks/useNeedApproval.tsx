import { parseEther } from "viem";

export function useNeedsApproval(allowance?: bigint, amount?: string): boolean {
  if (!allowance || !amount) return false;
  return allowance < parseEther(amount);
}
