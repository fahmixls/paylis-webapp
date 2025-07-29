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
