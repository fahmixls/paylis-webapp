import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const sql = neon(process.env.VITE_DATABASE_URL!);
const db = drizzle({ client: sql });

export { db };
