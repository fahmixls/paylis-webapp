import { SiweMessage } from "siwe";
import jwt from "jsonwebtoken";
import { db } from "../db/connection";
import { users, sessions, type User } from "../db/schema";
import { eq, and, gt, sql } from "drizzle-orm";
import crypto from "crypto";

const JWT_SECRET = import.meta.env.VITE_JWT_SECRET;
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// Generate a random nonce
export function generateNonce(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Get or create user
export async function getOrCreateUser(address: string): Promise<User> {
  const normalizedAddress = address.toLowerCase();

  // Try to get existing user
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.address, normalizedAddress))
    .limit(1);

  if (existingUser.length > 0) {
    // Update nonce for existing user
    const nonce = generateNonce();
    const updatedUser = await db
      .update(users)
      .set({
        nonce,
        updatedAt: new Date(),
      })
      .where(eq(users.address, normalizedAddress))
      .returning();

    return updatedUser[0];
  } else {
    // Create new user
    const nonce = generateNonce();
    const newUser = await db
      .insert(users)
      .values({
        address: normalizedAddress,
        nonce,
      })
      .returning();

    return newUser[0];
  }
}

// Verify SIWE signature
export async function verifySiweSignature(
  message: string,
  signature: string,
): Promise<{ success: boolean; address?: string; error?: string }> {
  try {
    const siweMessage = new SiweMessage(message);
    const fields = await siweMessage.verify({ signature });

    if (fields.success) {
      return { success: true, address: siweMessage.address };
    } else {
      return { success: false, error: "Invalid signature" };
    }
  } catch (error) {
    if (error instanceof SyntaxError)
      return { success: false, error: error.message };
    return { success: false };
  }
}

// Create session
export async function createSession(userId: number): Promise<string> {
  const sessionToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  await db.insert(sessions).values({
    userId,
    sessionToken,
    expiresAt,
  });

  return sessionToken;
}

// Verify session
export async function verifySession(
  sessionToken: string,
): Promise<User | null> {
  const result = await db
    .select({
      id: users.id,
      address: users.address,
      nonce: users.nonce,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .innerJoin(sessions, eq(users.id, sessions.userId))
    .where(
      and(
        eq(sessions.sessionToken, sessionToken),
        gt(sessions.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// Delete session
export async function deleteSession(sessionToken: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken));
}

// Clean expired sessions
export async function cleanExpiredSessions(): Promise<void> {
  await db
    .delete(sessions)
    .where(sql`${sessions.expiresAt} < ${new Date().toISOString()}`);
}
