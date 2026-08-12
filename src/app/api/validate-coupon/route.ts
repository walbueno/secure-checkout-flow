import { NextRequest, NextResponse } from "next/server";
import { couponSchema } from "@/app/lib/validation/coupon-schema";
import { validateCsrfToken, CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from "@/app/lib/security/csrf";

// Mock de cupons válidos — em produção isso viria de um banco de dados
const VALID_COUPONS: Record<string, number> = {
  BEMVINDO10: 10,
  FRETEGRATIS: 0,
};

export async function POST(request: NextRequest) {

  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME) ?? undefined;

  if (!validateCsrfToken(cookieToken, headerToken)) {
    return NextResponse.json(
      { error: "Token CSRF inválido" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();

    const result = couponSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Cupom inválido",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { code } = result.data;
    const discount = VALID_COUPONS[code];

    if (discount === undefined) {
      return NextResponse.json(
        { error: "Cupom não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      code,
      discountPercent: discount,
    });
  } catch {
    return NextResponse.json(
      { error: "Requisição inválida" },
      { status: 400 }
    );
  }
}