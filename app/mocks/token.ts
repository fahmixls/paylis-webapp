export type TokenType = {
  address: `0x${string}`;
  name: string;
  symbol: string;
  icon: string;
};

export const MockToken: Array<TokenType> = [
  {
    address: "0x7d454248C467e7b0dA868d370F045Ea462C36179",
    name: "Mock IDRX",
    symbol: "IDRX",
    icon: "/assets/idrx.svg",
  },
  {
    address: "0x8261591aD2C36cE05E36F4c249B635fcB2748a8F",
    name: "Mock USDC",
    symbol: "USDC",
    icon: "/assets/usdc.svg",
  },
];
