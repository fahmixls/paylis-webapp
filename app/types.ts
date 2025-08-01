import type { Address } from "viem";

// types.ts
export interface SplitPayment {
  from: Address;
  to: Address;
  token: Address;
  total: bigint;
  fee: bigint;
  nonce: bigint;
  deadline: bigint; // seconds since epoch
}

export interface SplitPaymentWithSig {
  splitPayment: SplitPayment;
  signature: Address;
}

export type TokenType = {
  address: Address;
  name: string;
  symbol: string;
  icon: string;
  decimal: number;
  min: number;
  flat: number;
};
