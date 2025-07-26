import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";
import { redirect } from "react-router";
import type { Route } from "./+types/login";
import { Loader2, LogIn, RefreshCcw } from "lucide-react";
import ConnectButtonCustom from "~/components/derived/ConnectButtonCustom";
import Footer from "~/components/derived/Footer";
import { getSessionFromRequest } from "~/lib/session.server";
import { verifySession } from "~/lib/auth.server";
import { toast } from "sonner";

export async function loader({ request }: Route.LoaderArgs) {
  const sessionToken = getSessionFromRequest(request);
  const user = sessionToken ? await verifySession(sessionToken) : null;

  if (user) {
    return redirect("/dashboard");
  }

  return {};
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const message = formData.get("message") as string;
  const signature = formData.get("signature") as string;

  if (!message || !signature) {
    return { error: "Message and signature are required" };
  }

  const response = await fetch(new URL("/api/auth/verify", request.url), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, signature }),
  });

  if (response.ok) {
    const setCookieHeader = response.headers.get("Set-Cookie");
    if (setCookieHeader) {
      return redirect("/dashboard", {
        headers: { "Set-Cookie": setCookieHeader },
      });
    }
  }

  const result = await response.json();
  return { error: result.error || "Authentication failed" };
}

export default function AuthLogin() {
  const { address, isConnected } = useAccount();
  const { signMessage } = useSignMessage();
  const { disconnect } = useDisconnect();

  const [nonce, setNonce] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Fetch nonce silently after wallet connects
  const fetchNonce = async () => {
    try {
      const response = await fetch("/api/auth/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });

      const data = await response.json();
      setNonce(data.nonce);
      setCurrentStep(2);
    } catch {
      setError("Failed to fetch nonce");
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchNonce();
    }
  }, [isConnected, address]);

  const handleSignIn = async () => {
    if (!address || !nonce) return;

    setIsLoading(true);
    setError("");
    toast("Logging in", {
      description: "Logging into your account with Ethereum...",
      icon: <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />,
      duration: Infinity,
    });
    try {
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in with Ethereum to the app.",
        uri: window.location.origin,
        version: "1",
        chainId: 1,
        nonce,
      });

      const messageString = message.prepareMessage();

      signMessage(
        { message: messageString },
        {
          onSuccess: async (signature) => {
            const response = await fetch("/api/auth/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ message: messageString, signature }),
            });

            if (response.ok) {
              window.location.href = "/dashboard";
            } else {
              const result = await response.json();
              setError(result.error || "Authentication failed");
            }
          },
          onError: (error) => setError(error.message),
        },
      );
    } catch {
      setError("Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletChange = () => {
    disconnect();
    setCurrentStep(1);
    setNonce("");
    setError("");
  };

  const StepIndicator = ({ step, title }: { step: number; title: string }) => (
    <div className="flex items-center space-x-2">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
          currentStep >= step ? "bg-wp text-white" : "bg-gray-200 text-gray-500"
        }`}
      >
        {step}
      </div>
      <span
        className={`text-sm ${
          currentStep >= step ? "text-wp" : "text-gray-400"
        }`}
      >
        {title}
      </span>
    </div>
  );

  return (
    <div className="max-w-lg h-[64vh] mx-auto px-6 py-12 text-center font-sans">
      <div className="flex justify-between max-w-sm mx-auto mb-8">
        <StepIndicator step={1} title="Connect Wallet" />
        <StepIndicator step={2} title="Sign In" />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4 text-left">
          {error}
        </div>
      )}
      <div className="flex h-full items-center justify-center">
        <div>
          <h1 className="text-2xl font-bold text-wp mb-6">
            Sign In with Ethereum
          </h1>
          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-gray-600 sr-only">
                Step 1: Connect your wallet
              </p>
              <ConnectButtonCustom />
            </div>
          )}

          {currentStep === 2 && isConnected && nonce && (
            <div className="flex flex-col mt-8 items-center gap-4">
              <p className="text-wp sr-only">
                ✅ Wallet connected:{" "}
                <code className="bg-gray-100 px-2 py-1 rounded">{address}</code>
              </p>

              <button
                onClick={handleSignIn}
                disabled={isLoading}
                className="inline-flex w-full justify-center max-w-xs items-center gap-2 rounded-md px-8 py-3 text-base font-semibold shadow transition-all duration-200 ease-in-out
               bg-wp text-white hover:shadow-lg hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wp
               disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <LogIn className="w-5 h-5 animate-pulse" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </button>

              <button
                onClick={handleWalletChange}
                className="inline-flex justify-center items-center w-full max-w-xs gap-2 rounded-md px-8 py-3 text-base font-semibold border transition-all duration-200 ease-in-out
               border-wp text-wp hover:bg-wp/10 hover:shadow-md hover:scale-[1.01]
               focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wp"
              >
                <RefreshCcw className="w-5 h-5" />
                Switch Wallet
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="absolute left-0 bottom-0 w-full flex justify-center">
        <Footer />
      </div>
    </div>
  );
}
