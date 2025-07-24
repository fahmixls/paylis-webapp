import { Card, CardHeader, CardTitle } from "~/components/ui/card";

const balances = [
  {
    name: "IDRX",
    logo: "/assets/idrx.svg",
    balance: "2,500.00",
  },
  {
    name: "USDC",
    logo: "/assets/usdc.svg",
    balance: "1,200.00",
  },
  {
    name: "USDT",
    logo: "/assets/usdt.svg",
    balance: "950.00",
  },
  {
    name: "DAI",
    logo: "/assets/dai.svg",
    balance: "740.00",
  },
];

function TokenCard({
  logo,
  name,
  balance,
}: {
  logo: string;
  name: string;
  balance: string;
}) {
  return (
    <Card className="w-64 shrink-0">
      <CardHeader className="flex flex-row items-center gap-4">
        <img src={logo} alt={`${name} logo`} className="size-11" />
        <div>
          <CardTitle className="text-base text-wp/80">{name}</CardTitle>
          <p className="text-xl font-mono tracking-tighter text-wp font-bold">
            {balance}
          </p>
        </div>
      </CardHeader>
    </Card>
  );
}

export default function SummarySection() {
  return (
    <section className="p-6">
      <div className="mb-6">
        <h2 className="text-4xl tracking-tighter font-semibold font-mono text-slate-700 mb-1">
          4,890.00 USD
        </h2>
        <p className="text-slate-500 mb-3">Total Balance</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {balances.map((token) => (
          <TokenCard key={token.name} {...token} />
        ))}
      </div>
    </section>
  );
}
