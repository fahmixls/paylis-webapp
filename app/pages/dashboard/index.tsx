import { Link, redirect, useLoaderData, useNavigate } from "react-router";
import Footer from "~/components/derived/Footer";
import Header from "~/components/derived/Header";
import type { Route } from "./+types";
import { getSessionFromRequest } from "~/lib/session.server";
import { verifySession } from "~/lib/auth.server";
import type { User } from "~/db/schema";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";

export async function loader({ request }: Route.LoaderArgs) {
  const sessionToken = getSessionFromRequest(request);
  const user = sessionToken ? await verifySession(sessionToken) : null;

  if (!user) {
    return redirect("/login");
  }

  return { user };
}

export default function Dashboard() {
  const { user }: { user: User } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const id = toast("Logging out...", {
      description: "Please wait while we log you out.",
      icon: <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />,
      duration: Infinity,
    });

    await new Promise((res) => setTimeout(res, 1000));

    navigate("/logout");
  };
  return (
    <div className="w-full h-full min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <h1>Dashboard</h1>
        <p>Welcome to your dashboard!</p>

        <div
          style={{
            background: "#f5f5f5",
            padding: "1rem",
            borderRadius: "4px",
            marginBottom: "1rem",
          }}
        >
          <h3>Your Account</h3>
          <p>
            <strong>Address:</strong> {user.address}
          </p>
          <p>
            <strong>Member since:</strong>{" "}
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
          <p>
            <strong>Last updated:</strong>{" "}
            {new Date(user.updatedAt).toLocaleDateString()}
          </p>
        </div>

        <div>
          <Link to="/" style={{ marginRight: "1rem" }}>
            Home
          </Link>
          <Button type="button" variant="link" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
