import { NextRequest, NextResponse } from "next/server";
import {
  generateCsrfToken,
  validateCsrfToken,
  CSRF_COOKIE_NAME,
} from "@/app/lib/security/csrf";

export async function GET(request: NextRequest) {
  const existingToken =
    request.cookies.get(CSRF_COOKIE_NAME)?.value;

  // Reutiliza o token se sua assinatura ainda for válida.
  if (
    existingToken &&
    validateCsrfToken(existingToken, existingToken)
  ) {
    return NextResponse.json({ token: existingToken });
  }

  // Gera um novo token caso não exista um válido.
  const token = generateCsrfToken();

  const response = NextResponse.json({ token });

  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return response;
}