"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mockCartItems } from "@/app/lib/mock-data/cart-items";
import { couponSchema } from "@/app/lib/validation/coupon-schema";
import styles from "./page.module.scss";
import { CheckoutProgress } from "../components/ui/CheckoutProgress";
import { useCsrfToken } from "../lib/security/useCsrfToken";

export default function CartPage() {
  const router = useRouter();
  const {
    token: csrfToken,
    loading: csrfLoading,
    error: csrfError,
    retry: retryCsrf,
  } = useCsrfToken();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const subtotal = mockCartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total = discount ? subtotal * (1 - discount / 100) : subtotal;

  async function handleApplyCoupon() {
    setError(null);

    // Validação client-side primeiro — evita chamada desnecessária à API
    const parsed = couponSchema.safeParse({ code: couponCode });
    if (!parsed.success) {
      setError(parsed.error.flatten().fieldErrors.code?.[0] ?? "Cupom inválido");
      return;
    }

    if (!csrfToken) {
      setError("Preparando segurança. Tente novamente em instantes.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/validate-coupon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken ?? "",
        },
        body: JSON.stringify(parsed.data),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Erro ao validar cupom");
        return;
      }

      setDiscount(data.discountPercent);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.container}>
      <h1>Carrinho</h1>
      <CheckoutProgress current="cart" />
      {csrfLoading && (
        <p role="status">Preparando segurança do checkout...</p>
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

      <ul className={styles.itemList}>
        {mockCartItems.map((item) => (
          <li key={item.id} className={styles.item}>
            <span>{item.name}</span>
            <span>{item.quantity}x R$ {item.price.toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <div className={styles.couponRow}>
        <input
          type="text"
          placeholder="Código do cupom"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          className={styles.input}
        />
        <button onClick={handleApplyCoupon} disabled={loading || csrfLoading || !csrfToken}>
          {loading ? "Validando..." : "Aplicar"}
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {discount !== null && (
        <p className={styles.success}>Cupom aplicado: {discount}% de desconto</p>
      )}

      <div className={styles.summary}>
        <span>Total</span>
        <strong>R$ {total.toFixed(2)}</strong>
      </div>

      <button
        className={styles.continueButton}
        onClick={() => router.push("/checkout/customer-data")}
      >
        Continuar
      </button>
    </main>
  );
}