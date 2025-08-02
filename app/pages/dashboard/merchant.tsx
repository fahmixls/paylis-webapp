import { useEffect, useState } from "react";
import { redirect, useLoaderData } from "react-router";
import { LogIn } from "lucide-react";
import Footer from "~/components/derived/Footer";
import { getSessionFromRequest } from "~/lib/session.server";
import { verifySession } from "~/lib/auth.server";
import type { Route } from "./+types";
import { Label } from "@radix-ui/react-label";
import { Input } from "~/components/ui/input";
import { toast } from "sonner";
import { CopyableText } from "~/components/derived/Copyable";
import { db } from "~/db/connection";
import { sql } from "drizzle-orm";
import { merchants, users } from "~/db/schema";
import Header from "~/components/derived/Header";

export async function loader({ request }: Route.LoaderArgs) {
  const sessionToken = getSessionFromRequest(request);
  const user = sessionToken ? await verifySession(sessionToken) : null;

  if (!user) {
    return redirect("/login");
  }

  const dataMerchant = await db.execute(sql`
    select ${merchants.apiKey}
    from ${merchants}
    left join ${users} on ${users.address} = ${user.address}
    where ${merchants.userId} = ${users.id}
    limit 1
  `);

  return { user, key: dataMerchant.rows[0].api_key as string | null };
}

export default function Merchant() {
  const {
    user: { address },
    key: existingKey,
  } = useLoaderData<typeof loader>();

  const [isLoading, setIsLoading] = useState(false);
  const [key, setKey] = useState<string | null>();
  const [data, setData] = useState<{
    email: string;
    name: string;
    website: string;
  }>({
    email: "",
    name: "",
    website: "",
  });

  useEffect(() => {
    if (existingKey) setKey(existingKey);
  }, [existingKey]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(
        `${window.location.origin}/api/merchant/registration`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, ...data }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Submission failed");
      }

      const { key } = await res.json();
      setKey(key);
      toast.success("Merchant registered successfully!");
    } catch (err: any) {
      toast.error(`Registration failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full grid grid-rows-[auto_1fr_auto] min-h-screen">
      <Header />
      <div className="p-6 max-w-md">
        <h1 className="text-2xl font-bold text-wp mb-6">
          {key ? "Merchant" : "Merchant Registration"}
        </h1>
        <p className="text-slate-600">
          Copy API Key and Wallet Address then paste it into plugin setting page
        </p>
        <div className="flex h-full py-12 w-full">
          {key ? (
            <div className="w-full space-y-4">
              <div>
                <Label className="text-muted-foreground text-sm mb-1 block">
                  API Key
                </Label>
                <CopyableText text={key} />
              </div>
              <div>
                <Label className="text-muted-foreground text-sm mb-1 block">
                  Wallet Address
                </Label>
                <CopyableText text={address} />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 w-full">
              <div className="grid w-full gap-3">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  required
                  value={data.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid w-full gap-3">
                <Label htmlFor="name">Business Name</Label>
                <Input
                  id="name"
                  type="text"
                  name="name"
                  required
                  value={data.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid w-full gap-3">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="text"
                  name="website"
                  required
                  value={data.website}
                  onChange={handleInputChange}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full justify-center mt-6 max-w-xs items-center gap-2 rounded-md px-8 py-3 text-base font-semibold shadow transition-all duration-200 ease-in-out
               bg-wp text-white hover:shadow-lg hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wp
               disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <LogIn className="w-5 h-5 animate-pulse" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </form>
          )}
        </div>
        <div className="absolute left-0 bottom-0 w-full flex justify-center">
          <Footer />
        </div>
      </div>
    </div>
  );
}
