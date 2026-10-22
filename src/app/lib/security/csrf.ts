import {
  randomBytes,
  createHmac,
  timingSafeEqual,
} from "node:crypto";

export const CSRF_COOKIE_NAME = "csrf_token";
export const CSRF_HEADER_NAME = "x-csrf-token";

function getCsrfSecret(): Buffer {
  const secret = process.env.CSRF_SECRET;

  if (!secret || !/^[a-f0-9]{64}$/.test(secret)) {
    throw new Error("CSRF_SECRET ausente ou inválida");
  }

  return Buffer.from(secret, "hex");
}

export function generateCsrfToken(): string {
  const nonce = randomBytes(32).toString("hex");

  const signature = createHmac("sha256", getCsrfSecret())
    .update(nonce)
    .digest("hex");

  return `${nonce}.${signature}`;
}

export function validateCsrfToken(
  cookieToken: string | undefined,
  headerToken: string | undefined
): boolean {
  if (!cookieToken || !headerToken) {
    return false;
  }

  const tokenPattern = /^[a-f0-9]{64}\.[a-f0-9]{64}$/;

  if (
    !tokenPattern.test(cookieToken) ||
    !tokenPattern.test(headerToken)
  ) {
    return false;
  }

  const cookieBuffer = Buffer.from(cookieToken);
  const headerBuffer = Buffer.from(headerToken);

  if (!timingSafeEqual(cookieBuffer, headerBuffer)) {
    return false;
  }

  const [nonce, signature] = cookieToken.split(".");

  const expectedSignature = createHmac(
    "sha256",
    getCsrfSecret()
  )
    .update(nonce)
    .digest();

  return timingSafeEqual(
    Buffer.from(signature, "hex"),
    expectedSignature
  );
}
