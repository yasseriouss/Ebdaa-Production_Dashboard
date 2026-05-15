import * as jose from "jose";

const textEncoder = new TextEncoder();

export function hasJwtSecret(): boolean {
  const raw = process.env["JWT_SECRET"];
  return Boolean(raw && raw.length >= 16);
}

function requireSecret(): Uint8Array {
  const raw = process.env["JWT_SECRET"];
  if (!raw || raw.length < 16) {
    throw new Error("JWT_SECRET must be set to at least 16 characters when issuing tokens");
  }
  return textEncoder.encode(raw);
}

export async function signAccessToken(userId: string, ttlSeconds = 28800): Promise<string> {
  const secret = requireSecret();
  return new jose.SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(secret);
}

export async function verifyAccessToken(token: string): Promise<{ sub: string }> {
  if (!hasJwtSecret()) {
    throw new Error("JWT not configured");
  }
  const secret = requireSecret();
  const { payload } = await jose.jwtVerify(token, secret, {
    algorithms: ["HS256"],
  });
  const sub = typeof payload.sub === "string" ? payload.sub : null;
  if (!sub) throw new Error("Invalid token payload");
  return { sub };
}
