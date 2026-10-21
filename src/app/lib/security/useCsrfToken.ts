"use client";

import { useEffect, useState } from "react";

export function useCsrfToken() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/csrf-token", {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Falha ao obter token CSRF: ${response.status}`
          );
        }

        return response.json();
      })
      .then((data: unknown) => {
        if (
          !data ||
          typeof data !== "object" ||
          !("token" in data) ||
          typeof data.token !== "string"
        ) {
          throw new Error("Resposta CSRF inválida");
        }

        if (!controller.signal.aborted) {
          setToken(data.token);
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          console.error("Erro ao carregar token CSRF:", error);
          setToken(null);
        }
      });

    return () => controller.abort();
  }, []);

  return token;
}