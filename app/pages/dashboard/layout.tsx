import { Outlet, redirect } from "react-router";
import Footer from "~/components/derived/Footer";
import Header from "~/components/derived/Header";
import type { Route } from "./+types";
import { getSessionFromRequest } from "~/lib/session.server";
import { verifySession } from "~/lib/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  const sessionToken = getSessionFromRequest(request);
  const user = sessionToken ? await verifySession(sessionToken) : null;

  if (!user) {
    return redirect("/login");
  }

  return { user };
}

export default function Layout() {
  return (
    <div className="w-full h-full">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
