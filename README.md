# Secure Checkout Flow

Fluxo de checkout demonstrativo desenvolvido com **Next.js, React e TypeScript**, explorando validação de dados, tratamento de informações sensíveis e conceitos de segurança aplicados à experiência de compra.

> **Status:** Projeto demonstrativo. Não realiza processamento real de pagamentos.

---

## 🎯 Objetivo

O projeto foi desenvolvido para explorar como preocupações de segurança podem ser consideradas durante a construção de um fluxo de checkout.

O fluxo simula:

```text
Carrinho
   ↓
Dados do cliente
   ↓
Pagamento
   ↓
Confirmação
```

A proposta é analisar segurança, validação e organização do fluxo sem depender de um gateway de pagamento real.

---

## 🛒 Fluxo de checkout

A aplicação contempla etapas relacionadas a:

* carrinho;
* identificação do cliente;
* simulação de pagamento sem coleta de dados de cartão;
* validação;
* confirmação do pedido.

O fluxo foi estruturado para representar diferentes momentos em que dados precisam ser validados e tratados.

---

## 🔐 Segurança

O projeto explora conceitos como:

### Validação

Utilização do **Zod** para validação estruturada dos dados recebidos pelos formulários.

### Dados sensíveis

O projeto considera a necessidade de evitar exposição desnecessária de informações sensíveis durante o fluxo.

### Simulação de pagamento

O checkout não solicita número do cartão, validade, CVV ou nome impresso no cartão.

A aplicação gera um identificador fictício de pagamento e simula o processamento da transação, sem integração com gateways ou realização de cobranças reais.

O final de cartão `4242`, apresentado na confirmação, é apenas ilustrativo e não corresponde a dados de cartão fornecidos pelo usuário.

### CSRF

O projeto implementa um mecanismo demonstrativo de proteção
contra Cross-Site Request Forgery (CSRF), utilizando tokens
assinados com HMAC-SHA256.

O funcionamento inclui:

- Geração de tokens com valores aleatórios criptograficamente seguros.
- Assinatura utilizando a variável de ambiente `CSRF_SECRET`.
- Armazenamento do token em cookie `HttpOnly` e `SameSite=Strict`.
- Envio do token no cabeçalho `x-csrf-token` das requisições protegidas.
- Validação da assinatura e comparação segura dos tokens no servidor.
- Tratamento de falhas e opção de tentar novamente na interface.

**Limitação conhecida:** os tokens não são vinculados a uma
sessão autenticada. Portanto, essa implementação demonstra
conceitos de proteção CSRF, mas não deve ser considerada uma
solução completa para aplicações de produção.

---

## ⚠️ Importante sobre segurança

Este projeto **não é uma implementação de pagamento em produção**.

Ele não deve ser interpretado como:

* gateway de pagamento;
* sistema PCI-DSS;
* implementação real de tokenização de cartões;
* solução de segurança para pagamentos;
* substituto de uma infraestrutura de pagamento especializada.

Para um sistema real, o processamento de pagamentos deve utilizar provedores especializados e controles de segurança apropriados.

---

## 🏗️ Arquitetura

O projeto utiliza:

* Next.js;
* React;
* TypeScript;
* Zod;
* SCSS Modules.

A aplicação organiza a interface e as regras relacionadas ao fluxo de checkout de forma modular.

---

## 🧠 Decisões técnicas

O projeto explora:

* validação estruturada;
* separação das etapas do checkout;
* tratamento de dados sensíveis;
* componentes reutilizáveis;
* organização de estado;
* conceitos de segurança aplicados ao desenvolvimento.

---

## 📦 Stack

* Next.js
* React
* TypeScript
* Zod
* SCSS Modules

---

## 🚀 Executando localmente

Clone o projeto:

```bash
git clone https://github.com/walbueno/secure-checkout-flow.git
```

Instale as dependências:

```bash
npm install
```

### Configuração da chave CSRF

Antes de iniciar a aplicação, crie um arquivo `.env.local` na raiz do projeto.

Gere uma chave aleatória de 32 bytes (64 caracteres hexadecimais) utilizando o Node.js:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

No arquivo `.env.local`, configure a variável:

```dotenv
CSRF_SECRET=COLE_AQUI_A_CHAVE_GERADA
```

Substitua o texto de exemplo pelo valor gerado no comando anterior.

**Importante:** o arquivo `.env.local` contém informações sensíveis e não deve ser enviado ao GitHub. Cada ambiente deve possuir sua própria chave secreta.


Execute:

```bash
npm run dev
```

---

## 🔄 Possíveis evoluções

Uma implementação real poderia incluir:

* integração com gateway de pagamento;
* backend dedicado;
* autenticação;
* autorização;
* gerenciamento de pedidos;
* observabilidade;
* logs de segurança;
* proteção adicional de APIs;
* testes de segurança;
* integração com ferramentas de análise automatizada.

---

## 💡 O que este projeto demonstra

* desenvolvimento de aplicações web;
* Next.js;
* React;
* TypeScript;
* validação de dados;
* e-commerce;
* segurança aplicada ao desenvolvimento;
* tratamento de dados sensíveis;
* pensamento sobre riscos durante o ciclo de desenvolvimento.

---

## 👨‍💻 Autor

**William Bueno**

Software Engineer · Web Applications · Digital Products

* [GitHub](https://github.com/walbueno)
* [LinkedIn](https://www.linkedin.com/in/walbueno)