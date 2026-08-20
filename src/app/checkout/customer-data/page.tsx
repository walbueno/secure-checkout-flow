"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { customerSchema, type CustomerData } from "@/app/lib/validation/customer-schema";
import { maskCPF, maskCEP, unmask, sanitizeInput } from "@/app/lib/security/mask";
import styles from "./page.module.scss";
import { CheckoutProgress } from "@/app/components/ui/CheckoutProgress";
import { useCsrfToken } from "@/app/lib/security/useCsrfToken";

type FormState = {
  name: string;
  email: string;
  cpf: string;
  address: {
    zipCode: string;
    street: string;
    number: string;
    city: string;
    state: string;
  };
};

const initialState: FormState = {
  name: "",
  email: "",
  cpf: "",
  address: { zipCode: "", street: "", number: "", city: "", state: "" },
};

export default function CustomerDataPage() {
  const router = useRouter();
  const csrfToken = useCsrfToken();
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function updateField(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateAddressField(field: keyof FormState["address"], value: string) {
    setForm((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    // Monta o payload com dados "limpos" (sem máscara) para validar
    const payload: CustomerData = {
      name: sanitizeInput(form.name),
      email: form.email.trim(),
      cpf: unmask(form.cpf),
      address: {
        zipCode: unmask(form.address.zipCode),
        street: sanitizeInput(form.address.street),
        number: sanitizeInput(form.address.number),
        city: sanitizeInput(form.address.city),
        state: form.address.state.toUpperCase(),
      },
    };

    // Validação client-side primeiro
    const parsed = customerSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const flatErrors: Record<string, string> = {};
      Object.entries(fieldErrors).forEach(([key, messages]) => {
        if (messages?.[0]) flatErrors[key] = messages[0];
      });
      setErrors(flatErrors);
      return;
    }

    setLoading(true);

    if (!csrfToken) {
      setErrors({ form: "Preparando segurança. Tente novamente em instantes." });
      return;
    }

    try {
      const response = await fetch("/api/validate-customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken ?? "",
        },
        body: JSON.stringify(parsed.data),
      });
      const data = await response.json();

      if (!response.ok) {
        setErrors({ form: data.error ?? "Erro ao validar dados" });
        return;
      }

      router.push("/checkout/payment");
    } catch {
      setErrors({ form: "Erro de conexão. Tente novamente." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.container}>
      <h1>Dados do cliente</h1>
      <CheckoutProgress current="customer-data" />

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="name">Nome completo</label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
          />
          {errors.name && <span className={styles.error}>{errors.name}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
          />
          {errors.email && <span className={styles.error}>{errors.email}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="cpf">CPF</label>
          <input
            id="cpf"
            type="text"
            inputMode="numeric"
            value={maskCPF(form.cpf)}
            onChange={(e) => updateField("cpf", e.target.value)}
            maxLength={14}
          />
          {errors.cpf && <span className={styles.error}>{errors.cpf}</span>}
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="zipCode">CEP</label>
            <input
              id="zipCode"
              type="text"
              inputMode="numeric"
              value={maskCEP(form.address.zipCode)}
              onChange={(e) => updateAddressField("zipCode", e.target.value)}
              maxLength={9}
            />
            {errors["address.zipCode"] && (
              <span className={styles.error}>{errors["address.zipCode"]}</span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="state">Estado</label>
            <input
              id="state"
              type="text"
              value={form.address.state}
              onChange={(e) => updateAddressField("state", e.target.value)}
              maxLength={2}
            />
            {errors["address.state"] && (
              <span className={styles.error}>{errors["address.state"]}</span>
            )}
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="street">Endereço</label>
          <input
            id="street"
            type="text"
            value={form.address.street}
            onChange={(e) => updateAddressField("street", e.target.value)}
          />
          {errors["address.street"] && (
            <span className={styles.error}>{errors["address.street"]}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="number">Número</label>
          <input
            id="number"
            type="text"
            value={form.address.number}
            onChange={(e) => updateAddressField("number", e.target.value)}
          />
          {errors["address.number"] && (
            <span className={styles.error}>{errors["address.number"]}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="city">Cidade</label>
          <input
            id="city"
            type="text"
            value={form.address.city}
            onChange={(e) => updateAddressField("city", e.target.value)}
          />
          {errors["address.city"] && (
            <span className={styles.error}>{errors["address.city"]}</span>
          )}
        </div>

        <button
          type="button"
          onClick={() => router.push("/cart")}
          className={styles.backButton}
        >
          Voltar ao carrinho
        </button>

        {errors.form && <p className={styles.error}>{errors.form}</p>}

        <button type="submit" disabled={loading} className={styles.submitButton}>
          {loading ? "Validando..." : "Continuar para pagamento"}
        </button>
      </form>
    </main>
  );
}