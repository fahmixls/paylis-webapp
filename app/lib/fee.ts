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
  const amountInTokens = Number(amount);
  const flatFeeInTokens = Number(config.flat);
  const percentageFeeInTokens =
    (amountInTokens * Number(config.percentage)) / 10_000;
  const totalFeeInTokens = flatFeeInTokens + percentageFeeInTokens;
  const totalAmountInTokens = amountInTokens + totalFeeInTokens;
  return {
    amount: amountInTokens,
    flatFee: flatFeeInTokens,
    percentageFee: percentageFeeInTokens,
    totalFee: totalFeeInTokens,
    totalAmount: totalAmountInTokens,
    amountBigInt: parseUnits(amountInTokens.toString(), tokenDecimals),
    totalFeeBps: Math.round((totalFeeInTokens / amountInTokens) * 10000),
    totalAmountBigInt: parseUnits(
      totalAmountInTokens.toString(),
      tokenDecimals,
    ),
  };
};
