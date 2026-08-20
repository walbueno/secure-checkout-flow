// Remove tudo que não for dígito — usado antes de validar ou enviar
export function unmask(value: string): string {
  return value.replace(/\D/g, "");
}

// Aplica máscara visual de CPF: 000.000.000-00
export function maskCPF(value: string): string {
  const digits = unmask(value).slice(0, 11);
  
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

// Aplica máscara visual de CEP: 00000-000
export function maskCEP(value: string): string {
  const digits = unmask(value).slice(0, 8);
  return digits.replace(/(\d{5})(\d)/, "$1-$2");
}

// Sanitiza texto livre contra XSS básico antes de qualquer renderização ou envio
export function sanitizeInput(value: string): string {
  return value
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .trim();
}

// Aplica máscara visual de cartão: 0000 0000 0000 0000
export function maskCardNumber(value: string): string {
  const digits = unmask(value).slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

// Simula tokenização client-side: nunca guarda o número completo em state
// depois desta etapa — só o token e os últimos 4 dígitos (para exibição)
export function tokenizeCard(cardNumber: string): {
  token: string;
  last4: string;
} {
  const digits = unmask(cardNumber);
  const last4 = digits.slice(-4);

  // Em produção real, isso seria uma chamada a um provedor (Stripe, PagSeguro, etc)
  // que devolve um token de fato. Aqui, geramos um token fake só pra ilustrar o fluxo.
  const token = `tok_${crypto.randomUUID()}`;

  return { token, last4 };
}