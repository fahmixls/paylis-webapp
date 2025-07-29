import { parseUnits } from "viem";

export interface FeeMapping {
  [key: string]: {
    flat: number;
    percentage: number;
  };
}

export const feeMapping: FeeMapping = {
  "0x7d454248C467e7b0dA868d370F045Ea462C36179": {
    flat: 150,
    percentage: 100, //1%
  },
  "0x8261591aD2C36cE05E36F4c249B635fcB2748a8F": {
    flat: 0.1,
    percentage: 100, // 1%
  },
};

export const calculateFees = (
  amount: number,
  tokenAddress: string,
  tokenDecimals: number,
) => {
  const config = feeMapping[tokenAddress];
  if (!config) {
    throw new Error(`Fee config not found for token ${tokenAddress}`);
  }
  const amountInTokens = amount;

  // Calculate flat fee (convert from basis points to actual tokens)
  // If flat is in basis points: flat fee = (amount * flatBps) / 10000
  // If flat is a fixed token amount: use directly
  const flatFeeInTokens = (amountInTokens * config.flat) / 10000;

  // Calculate percentage fee
  const percentageFeeInTokens = (amountInTokens * config.percentage) / 10000;

  // Total fee in tokens
  const totalFeeInTokens = flatFeeInTokens + percentageFeeInTokens;

  // Total amount user needs to pay
  const totalAmountInTokens = amountInTokens + totalFeeInTokens;

  return {
    amount: amountInTokens,
    flatFee: flatFeeInTokens,
    percentageFee: percentageFeeInTokens,
    totalFee: totalFeeInTokens,
    totalAmount: totalAmountInTokens,
    // For contract calls - convert to BigInt with proper decimals
    amountBigInt: parseUnits(amountInTokens.toString(), tokenDecimals),
    totalFeeBps: Math.round((totalFeeInTokens / amountInTokens) * 10000), // Convert back to BPS for contract
    totalAmountBigInt: parseUnits(
      totalAmountInTokens.toString(),
      tokenDecimals,
    ),
  };
};
