import { eq } from "@workspace/db";
import { db, authUsersTable } from "@workspace/db";
import { verifyPassword } from "../lib/passwordCrypto";
import { signAccessToken, hasJwtSecret } from "../lib/authToken";
import { loadAuthenticatedUser } from "./authIdentity.service";

export class AuthLoginService {
  static isLoginAvailable(): boolean {
    return hasJwtSecret();
  }

  static async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string } | { error: "invalid_credentials" } | { error: "login_unconfigured" }> {
    if (!hasJwtSecret()) {
      return { error: "login_unconfigured" };
    }

    const trimmed = email.trim().toLowerCase();
    const [user] = await db.select().from(authUsersTable).where(eq(authUsersTable.email, trimmed));

    if (!user || !user.passwordHash) {
      return { error: "invalid_credentials" };
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return { error: "invalid_credentials" };
    }

    if (!user.isActive) {
      return { error: "invalid_credentials" };
    }

    const accessToken = await signAccessToken(user.id);
    return { accessToken };
  }

  static async me(userId: string) {
    return loadAuthenticatedUser(userId);
  }
}
