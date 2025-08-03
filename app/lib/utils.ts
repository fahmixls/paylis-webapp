import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { type Address } from "viem";
import { MockToken } from "./constants";

export const getTokenByAddress = (address: string) => {
  return MockToken.find(
    (token) => token.address.toLowerCase() === address.toLowerCase()
  );
};

export const calculateFees = (amount: number, token: Address) => {
  const tokenData = getTokenByAddress(token);
  const fee = Number(tokenData?.flat) + (Number(amount) * 100) / 10_000;
  const total = Number(amount) + fee;

  return {
    fee,
    total,
  };
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address: string | Address, start = 6, end = 4) {
  if (!address) return "";
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function maskApiKey(
  key: string,
  visibleStart = 4,
  visibleEnd = 4
): string {
  if (typeof key !== "string") return "***";
  if (key.length <= visibleStart + visibleEnd) return "***";

  const maskedLength = key.length - visibleStart - visibleEnd;
  return (
    key.slice(0, visibleStart) +
    "*".repeat(maskedLength) +
    key.slice(key.length - visibleEnd)
  );
}
