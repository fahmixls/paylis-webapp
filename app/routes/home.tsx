import { MessagesSquare, Rocket } from "lucide-react";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <>
      <section
        id="main-content"
        className="isolate w-full min-h-[85vh] sm:min-h-[75vh] px-6 flex items-center text-slate-600 overflow-hidden"
        aria-labelledby="hero-heading"
      >
        <div className="-z-50 pattern-bg absolute left-0 top-0 h-full w-full" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-400 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <p className="text-sm italic text-slate-500 mb-3">
            ⚡ Blazing-fast. Widely trusted. Built for modern commerce.
          </p>
          <div className="flex justify-center mb-7 mt-3 items-center">
            <img
              className="rounded-full size-7 -p-2 outline-1"
              alt="IDRX"
              src="/assets/idrx.svg"
            />
            <img
              className="rounded-full size-7 -m-2 outline-1"
              alt="USDC"
              src="/assets/usdc.svg"
            />
            <img
              className="rounded-full size-7 -p-2 outline-1 bg-green-600"
              alt="USDT"
              src="/assets/usdt.svg"
            />
            <img
              className="rounded-full size-7 -m-2 outline-1"
              alt="DAI"
              src="/assets/dai.svg"
            />
          </div>
          <h1
            id="hero-heading"
            className="sm:text-5xl text-3xl font-extrabold sm:tracking-tight leading-tight drop-shadow-md shadow-white"
          >
            Accept <span className="text-yellow-600">Stablecoin</span> Payments
            Instantly <br className="md:inline hidden" />
            <span className="text-wp">Anywhere in the World</span>
          </h1>
          <p className="sm:text-lg text-sm text-slate-600` font-normal leading-7">
            Empower your business with{" "}
            <span className="font-semibold text-slate-800">fast</span>,{" "}
            <span className="font-semibold text-slate-800">secure</span>, and{" "}
            <span className="font-semibold text-slate-800">borderless</span>{" "}
            crypto transactions. No volatility Just{" "}
            <span className="text-yellow-700 font-semibold">
              seamless payments
            </span>{" "}
            simplified.
          </p>
          <div className="flex flex-wrap gap-4 w-full justify-center pt-6">
            <a
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-wp text-white font-semibold shadow hover:bg-blue-700 transition"
            >
              <Rocket className="w-4 h-4" />
              Get Started
            </a>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-wp text-wp font-semibold hover:bg-blue-50 transition"
            >
              <MessagesSquare className="w-4 h-4" />
              Talk to Us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
