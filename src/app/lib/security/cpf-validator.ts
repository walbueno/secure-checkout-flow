// Valida CPF com base nos dígitos verificadores (algoritmo oficial)
export function isValidCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "");

  if (digits.length !== 11) return false;

  // Rejeita sequências repetidas (000.000.000-00, 111.111.111-11, etc)
  // que passariam no cálculo de dígito verificador por coincidência matemática
  if (/^(\d)\1{10}$/.test(digits)) return false;

  const calcDigit = (base: string, factor: number): number => {
    let sum = 0;
    for (const char of base) {
      sum += parseInt(char, 10) * factor;
      factor--;
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstNine = digits.slice(0, 9);
  const digit1 = calcDigit(firstNine, 10);
  const digit2 = calcDigit(firstNine + digit1, 11);

  return digits === firstNine + digit1.toString() + digit2.toString();
}