import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";

import {
  generateCsrfToken,
  validateCsrfToken,
} from "../src/app/lib/security/csrf.ts";

// Chave temporária utilizada somente neste teste.
process.env.CSRF_SECRET = randomBytes(32).toString("hex");

test("gera um token HMAC válido", () => {
  const token = generateCsrfToken();

  assert.match(token, /^[a-f0-9]{64}\.[a-f0-9]{64}$/);

  assert.equal(validateCsrfToken(token, token), true);
});

// Verifica se a função de validação rejeita tokens com assinatura HMAC falsificada
test("rejeita token com assinatura HMAC falsificada", () => {
  const fakeToken = "a".repeat(64) + "." + "b".repeat(64);

  const result = validateCsrfToken(fakeToken, fakeToken);

  assert.equal(result, false);
});

// Verifica se a função de validação rejeita tokens CSRF ausentes
test("rejeita tokens CSRF ausentes", () => {
  const validToken = generateCsrfToken();

  // Cookie ausente
  assert.equal(
    validateCsrfToken(undefined, validToken),
    false
  );

  // Cabeçalho ausente
  assert.equal(
    validateCsrfToken(validToken, undefined),
    false
  );

  // Ambos ausentes
  assert.equal(
    validateCsrfToken(undefined, undefined),
    false
  );
});

// Verifica se a função de validação rejeita tokens CSRF diferentes, mesmo que ambos sejam assinados corretamente
test("rejeita tokens CSRF diferentes, mesmo com assinaturas válidas", () => {
  const cookieToken = generateCsrfToken();
  const headerToken = generateCsrfToken();

  assert.notEqual(cookieToken, headerToken);

  const result = validateCsrfToken(
    cookieToken,
    headerToken
  );

  assert.equal(result, false);
});

// Verifica se a geração falha quando CSRF_SECRET está ausente
test("não gera tokens quando a chave secreta está ausente", () => {
  const originalSecret = process.env.CSRF_SECRET;

  try {
    // Simula um ambiente sem a chave secreta
    delete process.env.CSRF_SECRET;

    assert.throws(
      () => generateCsrfToken(),
      /CSRF_SECRET ausente ou inválida/
    );
  } finally {
    // Restaura a configuração para os outros testes
    if (originalSecret === undefined) {
      delete process.env.CSRF_SECRET;
    } else {
      process.env.CSRF_SECRET = originalSecret;
    }
  }
});

// Verifica se a geração falha quando CSRF_SECRET tem formato inválido.
test("não gera tokens quando a chave secreta é inválida", () => {
  const originalSecret = process.env.CSRF_SECRET;

  try {
    // Simula uma chave com formato incorreto
    process.env.CSRF_SECRET = "chave-invalida";

    assert.throws(
      () => generateCsrfToken(),
      /CSRF_SECRET ausente ou inválida/
    );
  } finally {
    // Restaura a configuração original
    if (originalSecret === undefined) {
      delete process.env.CSRF_SECRET;
    } else {
      process.env.CSRF_SECRET = originalSecret;
    }
  }
});

// Verifica se a função de validação rejeita tokens CSRF legítimos após alteração do conteúdo
test("rejeita token legítimo após alteração do conteúdo", () => {
  const validToken = generateCsrfToken();

  const [nonce, signature] = validToken.split(".");

  // Modifica um caractere do token original.
  const changedFirstChar = nonce[0] === "a" ? "b" : "a";
  const alteredNonce = changedFirstChar + nonce.slice(1);

  // Mantém a assinatura original.
  const alteredToken = `${alteredNonce}.${signature}`;

  assert.equal(
    validateCsrfToken(alteredToken, alteredToken),
    false
  );
});