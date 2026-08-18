# ShapeMap App - Documentação Geral e Arquitetura do Projeto

Este documento é o **guia mestre de referência técnica e operacional** do **ShapeMap App**. Ele contém o mapeamento completo da arquitetura, integrações de pagamento (Asaas e Stripe), eventos de rastreamento de anúncios da Meta (Pixel + Conversions API), regras de acesso/paywall e o fluxo de trabalho de deploy.

---

## 🛠️ 1. Stack Tecnológica Completa

1. **Frontend**: React (Vite) + CSS customizado (design moderno, responsivo, dark mode, focado em alta conversão e UX para personal trainers).
2. **Backend & Banco de Dados**: 
   - **Supabase (PostgreSQL)**: Armazenamento em tempo real de contas de treinadores (`trainers`), alunos (`students`) e avaliações físicas (`evaluations`).
   - **Vercel Serverless Functions**: Endpoints `/api/` Node.js para processar webhooks e chamadas de checkout com segurança.
3. **Gateways de Pagamento**:
   - **Asaas**: Gateway principal para o Brasil (BRL) oferecendo assinaturas mensais recorrentes e plano anual em 2 etapas (Cartão 12x sem juros ou Pix/Boleto à vista).
   - **Stripe**: Gateway para assinaturas internacionais em USD/BRL e gerenciamento de portal do cliente.
4. **Rastreamento de Vendas & Anúncios**:
   - **Meta Ads Pixel (Browser JS)** + **Meta Conversions API (CAPI Server-side)** para atribuição de anúncios do Facebook/Instagram com desduplicação.
5. **Aplicação Web Instalável (PWA)**:
   - Suporte PWA no Android e iOS via `manifest.json` e Service Worker (`sw.js`).

---

## 📂 2. Estrutura de Arquivos e Módulos do Projeto

- **[`src/App.jsx`](file:///c:/Users/jeffe/Desktop/Avalia%C3%A7%C3%A3o%20F%C3%ADsica/App/src/App.jsx)**: Arquivo principal da aplicação React. Contém a lógica completa do aplicativo:
  - Autenticação e cadastro de profissionais.
  - Tela de bloqueio e assinaturas (**`PaywallScreen`**).
  - Dashboard do treinador, cadastro de alunos, anamnese, perimetria, composição corporal, testes de força/flexibilidade e gráficos de evolução.
  - Exportação de laudos e PDFs personalizados com a marca do personal.
- **[`api/`](file:///c:/Users/jeffe/Desktop/Avalia%C3%A7%C3%A3o%20F%C3%ADsica/App/api/)**:
  - [`create-asaas-checkout.js`](file:///c:/Users/jeffe/Desktop/Avalia%C3%A7%C3%A3o%20F%C3%ADsica/App/api/create-asaas-checkout.js): Gera os links de pagamento de mensalidade ou plano anual no Asaas com parâmetros customizados por modalidade.
  - [`asaas-webhook.js`](file:///c:/Users/jeffe/Desktop/Avalia%C3%A7%C3%A3o%20F%C3%ADsica/App/api/asaas-webhook.js): Recebe notificações instantâneas de pagamentos, ativações e inadimplências do Asaas.
  - [`create-checkout-session.js`](file:///c:/Users/jeffe/Desktop/Avalia%C3%A7%C3%A3o%20F%C3%ADsica/App/api/create-checkout-session.js): Criação de sessões de checkout no Stripe.
  - [`create-portal-session.js`](file:///c:/Users/jeffe/Desktop/Avalia%C3%A7%C3%A3o%20F%C3%ADsica/App/api/create-portal-session.js): Gera link para o portal de autogerenciamento da assinatura no Stripe.
  - [`stripe-webhook.js`](file:///c:/Users/jeffe/Desktop/Avalia%C3%A7%C3%A3o%20F%C3%ADsica/App/api/stripe-webhook.js): Processa eventos de assinatura e cancelamento do Stripe com disparo de eventos no Meta Conversions API (CAPI).
- **[`public/`](file:///c:/Users/jeffe/Desktop/Avalia%C3%A7%C3%A3o%20F%C3%ADsica/App/public/)**:
  - `/br`, `/es`, `/en`: Páginas de vendas estáticas (VSL) otimizadas para anúncios por região.
  - `manifest.json` e `sw.js`: Configurações de PWA para permitir a instalação do ShapeMap como aplicativo no celular.

---

## 💳 3. Arquitetura de Checkouts e Pagamentos

### 🇧🇷 3.1. Integração com Asaas (Público Brasileiro - BRL)

O sistema possui uma estrutura dedicada para o público brasileiro com duas opções de contratação:

#### A) Plano Mensal (Recorrente)
- **Valor**: R$ 19,90 / mês.
- **Configuração na API (`api/create-asaas-checkout.js`)**:
  - `name`: `'ShapeMap - Plano Mensal'` (sem campo de descrição adicional para manter o checkout limpo).
  - `chargeType`: `'RECURRENT'` | `subscriptionCycle`: `'MONTHLY'`.
  - `billingType`: `'UNDEFINED'` (permite escolha entre Pix ou Cartão).
  - `externalReference`: `${trainerId}:monthly`.
- **Fluxo do Primeiro Cadastro**: Assim que um novo profissional se cadastra no ShapeMap (`just_signed_up === 'true'`), o app o redireciona automaticamente para o checkout do **Plano Mensal (R$ 19,90/mês)**.

#### B) Plano Anual (2 Etapas Inteligentes)
- **Valor**: R$ 179,00 à vista ou em 12x de R$ 14,92 no cartão (economia de 25%).
- **Fluxo na Tela (`PaywallScreen`)**:
  - **Passo 1**: O personal seleciona "Plano Anual" e clica no botão **"Assinar Plano Anual"**.
  - **Passo 2**: É apresentada a tela de escolha da forma de pagamento:
    1. **💳 Cartão de Crédito (12x de R$ 14,92)**:
       - Configuração Asaas: `chargeType: 'INSTALLMENT'`, `maxInstallmentCount: 12`, `billingType: 'CREDIT_CARD'`, `value: 179.00`, `externalReference: `${trainerId}:annual_card``.
       - Botão: **"Assinar no Cartão"**.
       - Bloqueia totalmente Boleto ou Pix, exibindo exclusivamente o parcelamento em 12x no Cartão.
    2. **⚡ Pix ou Boleto (Pagamento Único)**:
       - Configuração Asaas: `chargeType: 'DETACHED'`, `billingType: 'BOLETO'`, `value: 179.00`, `externalReference: `${trainerId}:annual_pix``.
       - Botão: **"Assinar no Pix"**.
       - Exibe exclusivamente Boleto ou Pix à vista no valor integral de R$ 179,00.

#### C) Webhook do Asaas (`api/asaas-webhook.js`)
- **Etiqueta de Referência (`externalReference`)**: O identificador do pedido carrega a tag do plano (`trainerId:planType`).
- **Cálculo da Validade (`current_period_end`)**:
  - Se a tag contiver `annual` ou a transação for do plano anual: grava a expiração para **+365 dias (1 ano completo no futuro)**.
  - Se a transação for do plano mensal: grava a expiração para **+30 dias**.
  - *Vantagem da etiqueta*: Mesmo que você faça uma baixa manual por confirmação em dinheiro no painel do Asaas, o webhook reconhece a etiqueta `annual` e grava **1 ano de acesso** com 100% de precisão.
- **Tratamento de Inadimplência**: Ao receber eventos como `PAYMENT_OVERDUE`, `PAYMENT_DELETED` ou `SUBSCRIPTION_DELETED`, o webhook inativa a assinatura no Asaas e define `subscription_status = 'inactive'` no Supabase, bloqueando a conta no ShapeMap.

---

### 🌐 3.2. Integração com Stripe (Internacional - USD / BRL)

Para usuários de fora do Brasil (ou que acessam via idiomas `/es` e `/en`):
- **Criação da Sessão (`api/create-checkout-session.js`)**: Inicia o checkout hospedado do Stripe.
- **Portal do Cliente (`api/create-portal-session.js`)**: Permite que o treinador altere dados do cartão ou cancele a assinatura diretamente.
- **Webhook do Stripe (`api/stripe-webhook.js`)**:
  - Escuta `checkout.session.completed`, `customer.subscription.updated` e `customer.subscription.deleted`.
  - **Trava de Segurança Contra Eventos Obsoletos**: Verifica o timestamp do evento no Stripe para impedir que notificações de cancelamento antigas sobrescrevam uma assinatura recém-ativada.

---

## 📊 4. Rastreamento de Vendas & Meta Ads (Facebook Pixel + Conversions API)

O ShapeMap está equipado com **rastreamento híbrido de conversões da Meta (Pixel no Navegador + Conversions API no Servidor)** com desduplicação de eventos:

1. **Client-Side (Meta Pixel `fbq`)**:
   - **`PageView`**: Disparado nas páginas estáticas de VSL (`/br`, `/es`, `/en`) e no aplicativo (`index.html`).
   - **`CompleteRegistration`**: Disparado imediatamente após a criação bem-sucedida de uma nova conta de treinador ([src/App.jsx](file:///c:/Users/jeffe/Desktop/Avalia%C3%A7%C3%A3o%20F%C3%ADsica/App/src/App.jsx#L2985)).
   - **`InitiateCheckout`**: Disparado ao clicar em qualquer botão de assinar no Paywall ([src/App.jsx](file:///c:/Users/jeffe/Desktop/Avalia%C3%A7%C3%A3o%20F%C3%ADsica/App/src/App.jsx#L7684)).
   - **`Purchase`**: Disparado quando o cliente retorna do checkout para a aplicação com os parâmetros `?success=true&value=...&currency=...` ([src/App.jsx](file:///c:/Users/jeffe/Desktop/Avalia%C3%A7%C3%A3o%20F%C3%ADsica/App/src/App.jsx#L9844)). O evento envia o valor exato, moeda (`BRL` ou `USD`) e o `sessionId` para desduplicação.

2. **Server-Side (Meta Conversions API - CAPI)**:
   - Implementado diretamente nos webhooks dos dois gateways de pagamento:
     - **Asaas Webhook ([`api/asaas-webhook.js`](file:///c:/Users/jeffe/Desktop/Avalia%C3%A7%C3%A3o%20F%C3%ADsica/App/api/asaas-webhook.js))**: Ao confirmar qualquer pagamento (Pix, Cartão 12x ou Boleto), o servidor dispara instantaneamente o evento `Purchase` para a Graph API v19.0 da Meta com o valor da compra, e-mail, telefone e nome criptografados em SHA-256 (`em`, `ph`, `fn`, `ln`).
     - **Stripe Webhook ([`api/stripe-webhook.js`](file:///c:/Users/jeffe/Desktop/Avalia%C3%A7%C3%A3o%20F%C3%ADsica/App/api/stripe-webhook.js#L57))**: Dispara a Conversions API para compras internacionais.
   - **Vantagem Vital**: Garante 100% de marcação de vendas nas campanhas do Meta Ads (Facebook/Instagram), mesmo quando o cliente compra por **Pix no Asaas** e fecha a aba do navegador sem clicar em voltar para o site, ou utiliza bloqueadores de anúncios (AdBlock) e navegador Safari (iOS) com restrições de privacidade.

---

## 🔐 5. Regras de Acesso, Paywall e Validação por Data (`current_period_end`)

- **Interface do Paywall (`PaywallScreen`)**:
  - Design limpo e proporcional (`Card` com `maxWidth: 420` e `padding: 28`).
  - Proporções originais preservadas com logo ShapeMap e subtítulo *"Plataforma de Avaliação Física"*.
  - Botões objetivos com micro-textos claros ("Assinar Plano Mensal", "Assinar Plano Anual", "Assinar no Cartão", "Assinar no Pix").

- **Validação de Expiração por Data**:
  - O acesso ao painel do ShapeMap é controlado pelas variáveis `subscription_status` e `current_period_end` no Supabase:
    ```javascript
    let access = false;
    if (status === "active") {
      if (periodEndStr) {
        const periodEnd = new Date(periodEndStr);
        if (periodEnd > new Date()) {
          access = true;
        }
      } else {
        access = true;
      }
    }
    ```
  - **Status `active` + Data no Futuro (ex: 2027)** ➔ Acesso liberado!
  - **Status `active` + Data no Passado (Vencida)** ➔ Acesso bloqueado automaticamente e exibição da tela de Paywall para renovação do plano.

---

## 📱 6. PWA e Páginas Estáticas de Vendas (VSL)

1. **PWA (Progressive Web App)**:
   - Configurado através do `manifest.json` e `sw.js` em `/public`.
   - Permite que personal trainers instalem o ShapeMap na tela inicial do iPhone ou Android como um aplicativo nativo.
2. **VSLs Multilingues**:
   - `/public/br`: Página de vendas em Português focada no público brasileiro.
   - `/public/es`: Página de vendas em Espanhol.
   - `/public/en`: Página de vendas em Inglês.

---

## 🔄 7. Fluxo de Trabalho Git e Deploy na Vercel

O projeto adota o fluxo de deploy automatizado de 2 ambientes:

### 🟡 1. Branch de Desenvolvimento & Testes (`staging`)
- Todas as alterações, novas telas e correções devem ser desenvolvidas e testadas primeiro na branch `staging`.
- O deploy automático gera a URL de Preview na Vercel (`nixshape-app-git-staging-nixshape.vercel.app`).
- **Comandos de publicação em Staging**:
  ```bash
  git add .
  git commit -m "sua mensagem"
  git push origin staging
  ```

### 🟢 2. Branch de Produção (`main`)
- Após validação e aprovação do cliente na branch `staging`, faz-se o merge para a branch `main`.
- O deploy automático da Vercel compila e publica no domínio oficial de produção (`shapemapapp.com`).
- **Comandos de sincronização e publicação em Produção**:
  ```bash
  git checkout main
  git merge staging
  git push origin main
  git checkout staging
  ```

---

> **Nota para IAs e Desenvolvedores**: Este arquivo representa a fonte da verdade da arquitetura do **ShapeMap App**. Sempre que realizar alterações estruturais relevantes no projeto, mantenha este documento atualizado.
