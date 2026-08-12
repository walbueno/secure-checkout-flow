import { NextRequest, NextResponse } from "next/server";
import { customerSchema } from "@/app/lib/validation/customer-schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Revalida com o MESMO schema usado no client — nunca confia
    // que os dados já chegaram validados
    const result = customerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Aqui entraria a lógica real (salvar em sessão, banco, etc)
    // Neste projeto, apenas confirmamos que passou na validação
    return NextResponse.json({
      success: true,
      message: "Dados validados com sucesso",
    });
  } catch {
    return NextResponse.json(
      { error: "Requisição inválida" },
      { status: 400 }
    );
  }
}