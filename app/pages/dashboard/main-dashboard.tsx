import { Link, useLoaderData } from "react-router";
import type { User } from "../../db/schema";
import type { loader } from ".";

export default function MainDashboard() {
  const { user }: { user: User } = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
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
        <Link to="/logout">Logout</Link>
      </div>
    </div>
  );
}
