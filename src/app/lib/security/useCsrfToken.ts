"use client";

import { useCallback, useEffect, useState } from "react";

export function useCsrfToken() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setToken(null);
    setError(null);
    setLoading(true);
    setAttempt((current) => current + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadToken() {
      try {
        const response = await fetch("/api/csrf-token", {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            `Falha ao obter token CSRF: ${response.status}`
          );
        }

        const data: unknown = await response.json();

        if (
          !data ||
          typeof data !== "object" ||
          !("token" in data) ||
          typeof data.token !== "string" ||
          !/^[a-f0-9]{64}\.[a-f0-9]{64}$/.test(data.token)
        ) {
          throw new Error("Resposta CSRF inválida");
        }

        if (!controller.signal.aborted) {
          setToken(data.token);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Erro ao carregar token CSRF:", err);
          setError("Não foi possível preparar a segurança do checkout.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadToken();

    return () => controller.abort();
  }, [attempt]);

  return { token, loading, error, retry };
}