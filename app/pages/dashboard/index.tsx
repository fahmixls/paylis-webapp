import { redirect } from "react-router";
import Footer from "~/components/derived/Footer";
import Header from "~/components/derived/Header";
import type { Route } from "./+types";
import { getSessionFromRequest } from "~/lib/session.server";
import { verifySession } from "~/lib/auth.server";
import MainDashboard from "./main-dashboard";

export async function loader({ request }: Route.LoaderArgs) {
  const sessionToken = getSessionFromRequest(request);
  const user = sessionToken ? await verifySession(sessionToken) : null;

  if (!user) {
    return redirect("/login");
  }

  return { user };
}

export default function Dashboard() {
  return (
    <div className="w-full h-full">
      <Header />
      <MainDashboard />
      <Footer />
    </div>
  );
}
