import test from "node:test";
import assert from "node:assert/strict";

const API_URL = "http://localhost:3000/api/csrf-token";

test("reutiliza um token CSRF válido", async () => {
  // Primeira requisição: solicita um token novo.
  const firstResponse = await fetch(API_URL);

  assert.equal(firstResponse.status, 200);

  const firstData = await firstResponse.json();
  const firstToken = firstData.token;

  assert.match(
    firstToken,
    /^[a-f0-9]{64}\.[a-f0-9]{64}$/
  );

 // Confirma que o servidor emitiu o cookie.
 const setCookie = firstResponse.headers.get("set-cookie");

    assert.ok(setCookie, "API não retornou o cookie CSRF");

    // Extrai o par nome=valor do cookie recebido.
    const cookie = setCookie.split(";")[0];

    // Confirma que o cookie contém o mesmo token do JSON.
    assert.equal(cookie, `csrf_token=${firstToken}`);

    // Segunda requisição: devolve o cookie recebido.
    const secondResponse = await fetch(API_URL, {
    headers: {
        Cookie: cookie,
    },
});

  assert.equal(secondResponse.status, 200);

  const secondData = await secondResponse.json();

  // O endpoint deve reutilizar o mesmo token.
  assert.equal(secondData.token, firstToken);
});


test("substitui cookie CSRF com assinatura inválida", async () => {
  // Simula um token com assinatura falsificada.
  const fakeToken = `${"a".repeat(64)}.${"b".repeat(64)}`;

  // Envia o cookie adulterado para a API.
  const response = await fetch(API_URL, {
    headers: {
      Cookie: `csrf_token=${fakeToken}`,
    },
  });

  // O endpoint deve emitir um novo token.
  assert.equal(response.status, 200);

  const data = await response.json();

  // Verifica o formato do token retornado.
  assert.match(
    data.token,
    /^[a-f0-9]{64}\.[a-f0-9]{64}$/
  );

  // O token falsificado não pode ser reutilizado.
  assert.notEqual(data.token, fakeToken);

  // Verifica se o novo token também foi definido no cookie.
  const setCookie = response.headers.get("set-cookie");

  assert.ok(setCookie);
  assert.ok(
    setCookie.includes(`csrf_token=${data.token}`)
  );
});