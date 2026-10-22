import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  validateCsrfToken,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
} from "@/app/lib/security/csrf";

import { calculateDemoTotals } from "@/app/lib/mock-data/demo-pricing";
import { couponSchema } from "@/app/lib/validation/coupon-schema";

// Checkout demonstrativo: não recebe dados reais de cartão.
// Valida apenas o formato do identificador fictício e dos quatro dígitos
// ilustrativos. Nenhuma tokenização ou cobrança real é realizada.
const paymentSchema = z.object({
  token: z
    .string()
    .regex(/^tok_[a-f0-9-]{36}$/, "Token de pagamento inválido"),
  last4: z
    .string()
    .regex(/^\d{4}$/, "Últimos 4 dígitos inválidos"),
  amount: z
    .number()
    .positive("Valor deve ser positivo"),
  couponCode: couponSchema.shape.code.nullish(),
});

export async function POST(request: NextRequest) {

  // Validamos o token CSRF enviado no cookie e no header da requisição.
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

    const result = paymentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Dados de pagamento inválidos",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { last4, amount, couponCode } = result.data;

    const totals = calculateDemoTotals(couponCode ?? null);

    if (!totals) {
      return NextResponse.json(
        { error: "Cupom inválido" },
        { status: 400 }
      );
    }

    if (Math.round(amount * 100) !== totals.totalCents) {
      return NextResponse.json(
        { error: "Valor do pedido não corresponde ao esperado" },
        { status: 400 }
      );
    }

    // Em produção real, aqui aconteceria a chamada ao gateway de pagamento
    // (Stripe, PagSeguro, etc), passando o token — nunca o número do cartão.
    // Neste projeto, apenas simulamos uma resposta de sucesso.
    return NextResponse.json({
      success: true,
      transactionId: `txn_${crypto.randomUUID()}`,
      cardLast4: last4,
      amountCharged: totals.totalCents / 100,
    });
  } catch {
    return NextResponse.json(
      { error: "Requisição inválida" },
      { status: 400 }
    );
  }
}