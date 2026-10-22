import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

const BASE_URL = "http://localhost:3000";

async function simulatePayment(amount, couponCode = null) {
  // Obtém um token CSRF válido e seu cookie.
  const csrfResponse = await fetch(
    `${BASE_URL}/api/csrf-token`
  );

  assert.equal(csrfResponse.status, 200);

  const { token: csrfToken } = await csrfResponse.json();
  const setCookie = csrfResponse.headers.get("set-cookie");

  assert.ok(setCookie, "Cookie CSRF não recebido");

  // Envia uma simulação com os dados informados pelo teste.
  return fetch(`${BASE_URL}/api/process-payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-csrf-token": csrfToken,
      Cookie: setCookie.split(";")[0],
    },
    body: JSON.stringify({
      token: `tok_${randomUUID()}`,
      last4: "4242",
      amount,
      couponCode,
    }),
  });
}

test("aceita o valor original sem cupom", async () => {
  const response = await simulatePayment(409.7);

  assert.equal(response.status, 200);

  const data = await response.json();

  assert.equal(data.success, true);
  assert.equal(data.amountCharged, 409.7);
});

test("aceita o desconto BEMVINDO10", async () => {
  const response = await simulatePayment(
    368.73,
    "BEMVINDO10"
  );

  assert.equal(response.status, 200);

  const data = await response.json();

  assert.equal(data.success, true);
  assert.equal(data.amountCharged, 368.73);
});

test("rejeita valor adulterado", async () => {
  const response = await simulatePayment(0.01);

  assert.equal(response.status, 400);

  const data = await response.json();

  assert.equal(
    data.error,
    "Valor do pedido não corresponde ao esperado"
  );
});

test("rejeita cupom desconhecido", async () => {
  const response = await simulatePayment(
    409.7,
    "CUPOMFALSO"
  );

  assert.equal(response.status, 400);

  const data = await response.json();

  assert.equal(data.error, "Cupom inválido");
});