import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
  type MetaFunction,
} from "react-router";
import { Toaster } from "~/components/ui/sonner";
import type { Route } from "./+types/root";
import "./app.css";
import { Providers } from "./providers";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

declare global {
  interface BigInt {
    toJSON(): Number;
  }
}

BigInt.prototype.toJSON = function () {
  return Number(this);
};

export const meta: MetaFunction = () => [
  { name: "apple-mobile-web-app-title", content: "Paylis" },
  { title: "Paylis – Stablecoin Payment Gateway on Lisk" },
  {
    name: "description",
    content:
      "Paylis is a fast, secure, and user-friendly payment gateway that enables stablecoin transactions on the Lisk network.",
  },
];

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:ital,wght@0,200..800;1,200..800&display=swap",
  },
  {
    rel: "icon",
    type: "image/png",
    href: "/favicon-96x96.png",
    sizes: "96x96",
  },
  {
    rel: "icon",
    type: "image/svg+xml",
    href: "/favicon.svg",
  },
  {
    rel: "shortcut icon",
    href: "/favicon.ico",
  },
  {
    rel: "apple-touch-icon",
    sizes: "180x180",
    href: "/apple-touch-icon.png",
  },
  {
    rel: "manifest",
    href: "/site.webmanifest",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="-z-50 pattern-bg absolute left-0 top-0 h-full w-full" />
        <Providers>
          <main className="w-full max-w-screen-sm relative mx-auto min-h-screen bg-slate-50 shadow-md">
            {isLoading && <GlobalSpinner />}
            {children}
          </main>
        </Providers>
        <Toaster richColors position="top-center" />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="w-full max-w-screen-sm mx-auto py-16 text-center min-h-screen">
      <h1 className="mb-7 text-7xl tracking-tight font-extrabold text-primary-600">
        {message}
      </h1>
      <p className="mb-4 text-2xl tracking-tight font-bold text-gray-600">
        {details}
      </p>
      {stack && (
        <pre className="mb-7 text-lg font-light text-gray-500">
          <code>{stack}</code>
        </pre>
      )}
      <a
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-wp text-white font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-200 ease-in-out"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Homepage
      </a>
    </main>
  );
}

function GlobalSpinner() {
  toast.dismiss();
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "4px",
        backgroundColor: "#4f46e5",
        animation: "loading-bar 1.2s infinite",
        zIndex: 9999,
      }}
    />
  );
}
