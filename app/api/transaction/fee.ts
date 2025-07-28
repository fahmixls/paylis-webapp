import { feeMapping } from "~/mocks/fee";
import type { Route } from "./+types/fee";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const url = new URL(request.url);
    const token_address = url.searchParams.get("token") as string;
    const amount = Number(url.searchParams.get("amount"));
    if (!amount || !token_address) {
      return Response.json({
        status: 400,
        message: "amount and token address cannot be empty",
      });
    }
    const { flat, percentage } = feeMapping[token_address];
    const calculateFee = Math.floor((percentage * amount) / 10_000) + flat;
    return Response.json({
      total: (amount + calculateFee).toFixed(2),
      fee: calculateFee.toFixed(2),
    });
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
