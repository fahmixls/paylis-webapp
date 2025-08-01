import PaymentForwarderAbi from "~/abi/PaymentForwarder.json";
import ERC20Abi from "~/abi/ERC20.json";
import { type Address, type TypedDataDomain } from "viem";
import type { TokenType } from "~/types";
import { liskSepolia } from "viem/chains";

export const MockToken: Array<TokenType> = [
  {
    address: "0xcA0A2cE00d5b6Dd22C65731D8F64939537595D01",
    name: "Mock IDRX",
    symbol: "IDRX",
    icon: "/assets/idrx.svg",
    decimal: 2,
    min: 2000,
    flat: 1000,
  },
  {
    address: "0x0A218c6a23Ede0395474e9d875c7fE2BF859Cf10",
    name: "Mock USDC",
    symbol: "USDC",
    icon: "/assets/usdc.svg",
    decimal: 6,
    min: 0.2,
    flat: 0.1,
  },
];
export const PAYMENT_FORWARDER_ABI = PaymentForwarderAbi;
export const ERC20_ABI = ERC20Abi;
export const MAX_UINT256 = BigInt(
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
);
export const PAYMENT_FORWARDER_ADDRESS =
  "0x65653f7fD8ac409D3C812294eC2FfE8CF5e98a7f" as Address;
export const domain: TypedDataDomain = {
  name: "PaymentMetaTx",
  version: "1",
  chainId: liskSepolia.id,
  verifyingContract: PAYMENT_FORWARDER_ADDRESS,
};
export const splitPaymentTypes = {
  SplitPayment: [
    { name: "from", type: "address" },
    { name: "to", type: "address" },
    { name: "token", type: "address" },
    { name: "total", type: "uint256" },
    { name: "fee", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
} as const;
