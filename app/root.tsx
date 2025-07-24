import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  type MetaFunction,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { Providers } from "./providers";
import HeaderSection from "./components/derived/Header";
import { ArrowLeft } from "lucide-react";

export const meta: MetaFunction = () => [
  { name: "apple-mobile-web-app-title", content: "Paylis" },
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
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Providers>
          <main className="w-full max-w-screen-sm relative mx-auto min-h-screen bg-slate-50 shadow-md">
            <HeaderSection />
            <div className="w-full h-full p-3">{children}</div>
          </main>
        </Providers>
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
        className="inline-flex mt-7 items-center gap-2 px-6 py-3 rounded-lg bg-wp text-white font-semibold shadow hover:bg-blue-700 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Homepage
      </a>
    </main>
  );
}
