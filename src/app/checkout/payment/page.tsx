"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.scss";
import { CheckoutProgress } from "@/app/components/ui/CheckoutProgress";
import { useCsrfToken } from "@/app/lib/security/useCsrfToken";
import { calculateDemoTotals } from "@/app/lib/mock-data/demo-pricing";

export default function PaymentPage() {
  const router = useRouter();
  const {
    token: csrfToken,
    loading: csrfLoading,
    error: csrfError,
    retry: retryCsrf,
  } = useCsrfToken();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{
    transactionId: string;
    last4: string;
    amountCharged: number;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const couponCode = sessionStorage.getItem("demo_checkout_coupon");
    const totals = calculateDemoTotals(couponCode);

    if (!totals) {
      setError("Cupom inválido. Volte ao carrinho e aplique novamente.");
      return;
    }

    // Identificador fictício para demonstração.
    // Não representa um cartão tokenizado por um provedor.
    const token = `tok_${crypto.randomUUID()}`;
    const last4 = "4242";

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
        body: JSON.stringify({
          token,
          last4,
          amount: totals.totalCents / 100,
          couponCode,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Erro ao processar pagamento");
        return;
      }

      sessionStorage.removeItem("demo_checkout_coupon");

      setSuccess({
        transactionId: data.transactionId,
        last4: data.cardLast4,
        amountCharged: data.amountCharged,
      });
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className={styles.container}>
        <h1>Simulação concluída</h1>
        <CheckoutProgress current="payment" />
        <p>Identificador da transação fictícia: {success.transactionId}</p>
        <p>
          Valor da simulação:{" "}
          {success.amountCharged.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </p>
        <button onClick={() => router.push("/")} className={styles.submitButton}>
          Voltar ao início
        </button>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <h1>Simulação de pagamento</h1>
      <p>
        Este checkout é uma demonstração.
        Nenhum dado de cartão é solicitado e nenhuma cobrança será realizada.
      </p>

      {csrfLoading && (
        <p role="status">
          Preparando segurança do checkout...
        </p>
      )}

      {csrfError && (
        <div role="alert">
          <p className={styles.error}>{csrfError}</p>

          <button
            type="button"
            onClick={retryCsrf}
            disabled={csrfLoading}
          >
            Tentar novamente
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <button
          type="button"
          onClick={() => router.push("/checkout/customer-data")}
          className={styles.backButton}
        >
          Voltar
        </button>

        {error && <p className={styles.error}>{error}</p>}

        <button
          type="submit"
          disabled={loading || csrfLoading || !csrfToken}
          className={styles.submitButton}
        >
          {loading ? "Simulando..." : "Simular pagamento"}
        </button>

      </form>
    </main>
  );
}