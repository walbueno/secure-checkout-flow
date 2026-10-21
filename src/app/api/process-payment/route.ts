import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  validateCsrfToken,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
} from "@/app/lib/security/csrf";

// Aqui NÃO validamos o número do cartão — ele nunca deveria chegar até aqui.
// Validamos o TOKEN gerado no client por tokenizeCard() e os últimos 4 dígitos,
// que servem só para exibição/confirmação, nunca para processar o pagamento de fato.
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
});

const DEMO_ORDER_AMOUNT = 409.7;

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

    const { last4, amount } = result.data;
    if (amount !== DEMO_ORDER_AMOUNT) {
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
      amountCharged: DEMO_ORDER_AMOUNT,
    });
  } catch {
    return NextResponse.json(
      { error: "Requisição inválida" },
      { status: 400 }
    );
  }
}