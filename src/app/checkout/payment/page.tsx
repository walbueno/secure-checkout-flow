"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.scss";
import { CheckoutProgress } from "@/app/components/ui/CheckoutProgress";
import { maskCardNumber, tokenizeCard, unmask, sanitizeInput } from "@/app/lib/security/mask";
import { useCsrfToken } from "@/app/lib/security/useCsrfToken";

// Em produção real, o valor viria do carrinho (contexto, query param, etc).
// Aqui, fixo pra simplificar o fluxo de portfólio.
const MOCK_AMOUNT = 409.7;

export default function PaymentPage() {
  const router = useRouter();
  const csrfToken = useCsrfToken();
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ transactionId: string; last4: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const digits = unmask(cardNumber);
    if (digits.length !== 16) {
      setError("Número do cartão inválido");
      return;
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      setError("CVV inválido");
      return;
    }

    const sanitizedCardName = sanitizeInput(cardName);

    // Tokeniza no client — a partir daqui, o número completo do cartão
    // deixa de existir em qualquer state ou variável do componente.
    const { token, last4 } = tokenizeCard(digits);

    setLoading(true);

    if (!csrfToken) {
      setError("Preparando segurança. Tente novamente em instantes.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/process-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken ?? "",
        },
        body: JSON.stringify({ token, last4, amount: MOCK_AMOUNT }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Erro ao processar pagamento");
        return;
      }

      setSuccess({ transactionId: data.transactionId, last4: data.cardLast4 });
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
      // Limpa os campos sensíveis do state, independente do resultado
      setCardNumber("");
      setCvv("");
    }
  }

  if (success) {
    return (
      <main className={styles.container}>
        <h1>Pagamento confirmado</h1>
        <CheckoutProgress current="payment" />
        <p>Transação: {success.transactionId}</p>
        <p>Cartão terminado em {success.last4}</p>
        <button onClick={() => router.push("/")} className={styles.submitButton}>
          Voltar ao início
        </button>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <h1>Pagamento</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="cardNumber">Número do cartão</label>
          <input
            id="cardNumber"
            type="text"
            inputMode="numeric"
            value={maskCardNumber(cardNumber)}
            onChange={(e) => setCardNumber(e.target.value)}
            maxLength={19}
            autoComplete="cc-number"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="cardName">Nome impresso no cartão</label>
          <input
            id="cardName"
            type="text"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            autoComplete="cc-name"
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="expiry">Validade</label>
            <input
              id="expiry"
              type="text"
              placeholder="MM/AA"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              maxLength={5}
              autoComplete="cc-exp"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="cvv">CVV</label>
            <input
              id="cvv"
              type="password"
              inputMode="numeric"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              maxLength={4}
              autoComplete="cc-csc"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push("/checkout/customer-data")}
          className={styles.backButton}
        >
          Voltar
        </button>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" disabled={loading} className={styles.submitButton}>
          {loading ? "Processando..." : "Pagar"}
        </button>
      </form>
    </main>
  );
}