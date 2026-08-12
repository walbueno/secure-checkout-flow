
# Secure Checkout Flow
 
Um fluxo de checkout de e-commerce (carrinho → dados do cliente → pagamento → confirmação) construído para demonstrar, na prática, princípios de segurança aplicados ao front-end: validação em profundidade, sanitização de dados, tokenização client-side e proteção contra CSRF.
 
Este é um projeto de portfólio. Não processa pagamentos reais e não deve ser usado em produção sem uma integração real com um gateway de pagamento (Stripe, PagSeguro, etc).
 
## Stack
 
- **Next.js** (App Router) + **TypeScript**
- **SCSS Modules** para estilos escopados por componente
- **Zod** para validação de schema, compartilhada entre client e server
## Fluxo
 
1. **Carrinho** — resumo de itens e aplicação de cupom de desconto
2. **Dados do cliente** — nome, e-mail, CPF (com validação de dígito verificador) e endereço
3. **Pagamento** — cartão de crédito, tokenizado no client antes de qualquer envio
4. **Confirmação** — exibe o ID da transação simulada e os últimos 4 dígitos do cartão
## Decisões de segurança
 
### Validação em duas camadas (client + server)
 
Todo formulário é validado no client (Zod) antes do envio, **e revalidado no server** dentro da API route correspondente, usando o **mesmo schema**. A validação no client existe para dar feedback rápido ao usuário. Ela pode ser burlada por qualquer pessoa com DevTools ou uma ferramenta como Postman, então o servidor nunca confia que os dados já chegaram limpos. Reaproveitar o mesmo arquivo de schema nos dois lados evita que client e server fiquem dessincronizados (single source of truth).
 
### Validação real de CPF
 
O CPF não é validado apenas por formato (11 dígitos). O projeto implementa o algoritmo de dígito verificador oficial, incluindo a rejeição de sequências repetidas (`00000000000`, `11111111111`, etc), que passariam no cálculo por coincidência matemática se essa checagem não existisse.
 
### Sanitização de inputs
 
Todo campo de texto livre (nome, endereço, nome no cartão) passa por sanitização básica contra XSS antes de ser processado ou enviado como camada complementar à validação de schema, não substituta dela.
 
### Mascaramento visual vs. dado real
 
Campos como CPF e número de cartão são exibidos mascarados (`000.000.000-00`, `0000 0000 0000 0000`) apenas para leitura: o valor armazenado no state e enviado para validação é sempre o dado "limpo" (sem máscara), evitando que a formatação visual vaze para a lógica de negócio.
 
### Tokenização client-side de cartão
 
O número completo do cartão nunca é enviado ao servidor. Ele é "tokenizado" no client (simulação de um fluxo real de gateway, como Stripe ou PagSeguro) logo após a submissão. A partir desse ponto, apenas um token e os últimos 4 dígitos (para exibição) seguem para a API. O campo de CVV usa `type="password"` para nunca aparecer em texto puro na tela, e os campos sensíveis (`cardNumber`, `cvv`) são limpos do state do React imediatamente após o envio, independente do resultado.
 
### Proteção CSRF (double-submit cookie)
 
Cada sessão recebe um token CSRF via cookie `httpOnly` (`sameSite: strict`). O client busca esse mesmo valor por uma rota dedicada e o reenvia manualmente em um header (`x-csrf-token`) em toda requisição sensível. O servidor só processa a requisição se o valor do cookie e do header baterem. Como o cookie é `httpOnly`, um atacante em outro domínio não consegue lê-lo nem forjar o header correto. Isso funciona como uma camada extra de defesa em profundidade, complementar (não substituta) à proteção nativa que `sameSite: strict` já oferece nos navegadores modernos.
 
## Rodando localmente
 
```bash
npm install
npm run dev
```
 
Acesse `http://localhost:3000` — o redirecionamento leva direto para o carrinho.
 
### Dados de teste
 
- **CPF válido:** `111.444.777-35` (CPF de teste comumente usado em documentação)
- **Cupom válido:** `BEMVINDO10` (10% de desconto) ou `FRETEGRATIS`
- **Cartão:** qualquer sequência de 16 dígitos (ex: `4111 1111 1111 1111`), CVV de 3 dígitos, validade futura
## O que este projeto não cobre
 
Por ser um projeto de portfólio focado em front-end, propositalmente ficam fora do escopo: integração real com gateway de pagamento, persistência em banco de dados, autenticação de usuário e conformidade PCI-DSS completa (que exigiria infraestrutura de backend dedicada).
 
## Autor
 
William Bueno — Arquiteto Front-End especializado em segurança aplicada a e-commerce.
[LinkedIn](https://linkedin.com/in/walbueno) · [GitHub](https://github.com/walbueno) · [Site](https://www.williambueno.com.br)