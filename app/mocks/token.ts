export type TokenType = {
  address: `0x${string}`;
  name: string;
  symbol: string;
  icon: string;
  decimal: number;
  min: number;
};

export const MockToken: Array<TokenType> = [
  {
    address: "0x7d454248C467e7b0dA868d370F045Ea462C36179",
    name: "Mock IDRX",
    symbol: "IDRX",
    icon: "/assets/idrx.svg",
    decimal: 2,
    min: 2000,
  },
  {
    address: "0x8261591aD2C36cE05E36F4c249B635fcB2748a8F",
    name: "Mock USDC",
    symbol: "USDC",
    icon: "/assets/usdc.svg",
    decimal: 6,
    min: 0.2,
  },
];

export const getTokenByAddress = (address: string) => {
  return MockToken.find(
    (token) => token.address.toLowerCase() === address.toLowerCase(),
  );
};

export const MinimalForwarderAddress =
  "0xb9DE485aF056e8a97E47753D54Fd67748bd16A78" as `0x${string}`;
export const PaymentGatewayAddress =
  "0x3a8fFa05dcBc71a4d1C3A0A92324d084393f60C9" as `0x${string}`;
