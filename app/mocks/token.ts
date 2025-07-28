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
  "0xf7531AB005b576d71F4d4894EbC674D8Eb7285B9";
export const PaymentGatewayAddress =
  "0x433bE1B59C4562f7fA78210910ed8c406DAf3325";
