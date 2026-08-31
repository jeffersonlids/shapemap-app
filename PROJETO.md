# ShapeMap App - Documentação Geral e Arquitetura do Projeto

Este documento é o **guia mestre de referência técnica e operacional** do **ShapeMap App**. Ele contém o mapeamento completo da arquitetura, integrações de pagamento (Asaas e Stripe), sistema de indicação ("Indique e Ganhe"), pop-up de novidades, eventos de rastreamento de anúncios da Meta (Pixel + Conversions API), regras de acesso/paywall e o fluxo de trabalho de deploy.

---

## 🛠️ 1. Stack Tecnológica Completa

1. **Frontend**: React (Vite) + CSS customizado (design moderno, responsivo, dark mode, focado em alta conversão e UX para personal trainers e profissionais de saúde e fitness).
2. **Backend & Banco de Dados**: 
   - **Supabase (PostgreSQL)**: Armazenamento em tempo real de contas de treinadores (`trainers`), alunos (`students`), avaliações físicas (`evaluations`) e controle de indicação.
   - **Vercel Serverless Functions**: Endpoints `/api/` Node.js para processar webhooks, checkouts, bonificações e ativações com segurança.
3. **Gateways de Pagamento**:
   - **Asaas**: Gateway principal para o Brasil (BRL) oferecendo assinaturas mensais recorrentes (R$ 19,90) e plano anual (R$ 179,00 à vista ou em 12x no Cartão).
   - **Stripe**: Gateway para assinaturas internacionais em USD/BRL e gerenciamento de portal do cliente.
4. **Rastreamento de Vendas & Anúncios**:
   - **Meta Ads Pixel (Browser JS)** + **Meta Conversions API (CAPI Server-side)** para atribuição de anúncios do Facebook/Instagram com desduplicação.
5. **Aplicação Web Instalável (PWA)**:
   - Suporte PWA no Android e iOS via `manifest.json` e Service Worker (`sw.js`).

---

## 📂 2. Estrutura de Arquivos e Módulos do Projeto

- **`src/App.jsx`**: Arquivo principal da aplicação React. Contém:
  - Autenticação e cadastro de profissionais.
  - Tela de bloqueio e assinaturas (**`PaywallScreen`**).
  - Dashboard do treinador, cadastro de alunos, anamnese, perimetria, composição corporal, testes de força/flexibilidade e gráficos de evolução.
  - Exportação de laudos e PDFs personalizados com a marca e cor primária do profissional.
  - Card minimalista de indicação (**`Indique e Ganhe 1 Mês Grátis`**) na aba **Perfil**.
  - Modal/Pop-up de anúncio de novidades (**`ReferralAnnouncementModal`**).
  - Captura inteligente de código de indicação (`?ref=...`) na URL e persistência em `sessionStorage` / `localStorage`.
  - Verificação instantânea de retorno de checkout (`/api/verify-stripe-session`).
- **`api/`**:
  - `create-asaas-checkout.js`: Gera os links de pagamento de mensalidade ou plano anual no Asaas com parâmetros customizados por modalidade.
  - `asaas-webhook.js`: Recebe notificações de pagamentos, ativações e cancelamentos do Asaas e aciona o processador de indicação.
  - `create-checkout-session.js`: Criação de sessões de checkout no Stripe com metadados vinculados (`trainerId`).
  - `create-portal-session.js`: Gera link para o portal de autogerenciamento da assinatura no Stripe.
  - `stripe-webhook.js`: Webhook da Stripe que gerencia o ciclo de vida da assinatura (`checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `checkout.session.expired`) e dispara conversão Meta CAPI.
  - `verify-stripe-session.js`: Endpoint de ativação instantânea (0 segundos) que valida a sessão paga direto na Stripe assim que o cliente retorna ao app.
  - `referral-reward.js`: Motor centralizado de recompensa do "Indique e Ganhe" que prorroga faturas no Asaas, Stripe e Supabase.
- **`public/`**:
  - `/br`, `/es`, `/en`: Páginas de vendas estáticas (VSL) otimizadas para anúncios por região.
  - `manifest.json` e `sw.js`: Configurações de PWA para permitir a instalação do ShapeMap como aplicativo no celular.

---

## 🎁 3. Sistema de Indicação ("Indique e Ganhe 1 Mês Grátis")

### 3.1. Visão Geral e Regras de Negócio
- Todo profissional cadastrado possui um link exclusivo de indicação (`https://shapemapapp.com/?ref=TRAINER_ID`).
- Para cada amigo que criar conta por esse link e assinar qualquer plano no ShapeMap, o indicador ganha **+1 Mês Grátis (+30 dias)** adicionado automaticamente à sua assinatura.
- **Sem Limite de Indicações**: O indicador pode acumular múltiplos meses gratuitos.

### 3.2. Estrutura do Banco de Dados (Tabela `trainers` no Supabase)
- **`referred_by`** (`TEXT`): Guarda o ID ou código do treinador que fez a indicação.
- **`referral_rewarded`** (`BOOLEAN`, padrão `FALSE`): Marca se a conta indicada já gerou o bônus para quem a indicou.
- **`referral_code`** (`TEXT`): Código amigável de indicação do profissional.

### 3.3. Motor de Bonificação (`api/referral-reward.js`)
Quando qualquer pagamento do primeiro mês de um novo assinante é confirmado (via Asaas ou Stripe):
1. **Verificação de Elegibilidade & Trava Antifraude**:
   - O novo assinante precisa ter `referred_by` preenchido.
   - `referral_rewarded` deve ser `FALSE` (garante que renovações futuras de meses seguintes **não** gerem bônus indevidos).
   - Bloqueio automático de autoindicação (`referred_by === newSubscriber.id`).
2. **Cálculo da Nova Validade**:
   - `baseDate = current_period_end > now ? current_period_end : now`
   - `newPeriodEnd = baseDate + 30 dias`
3. **Prorrogação no Gateway de Pagamento do Indicador**:
   - **Se o indicador usa Asaas**:
     - Atualiza o vencimento da assinatura (`nextDueDate`) na API do Asaas para a nova data.
     - Atualiza qualquer cobrança pendente gerada no Asaas para a nova data de vencimento.
   - **Se o indicador usa Stripe**:
     - Estende o ciclo de faturamento na API do Stripe via `trial_end: trialEndUnix` com `proration_behavior: 'none'`.
4. **Atualização no Supabase**:
   - Atualiza o `current_period_end` do indicador com a nova data.
   - Marca `referral_rewarded = TRUE` na conta do novo assinante.

### 3.4. Interface Visual no Perfil
- Localizado logo abaixo da foto do profissional na aba **Perfil**.
- Design 100% em vetores SVG (`IcGift`, `IcCopy`, `IcCheck`), com título **`INDIQUE E GANHE 1 MÊS GRÁTIS`**, link exclusivo com cópia em 1 clique e botão oficial para compartilhar no WhatsApp.

---

## 📢 4. Pop-up de Anúncio de Novidades (`ReferralAnnouncementModal`)

- **Objetivo**: Apresentar o Programa de Indicação para todos os profissionais ao entrarem no aplicativo.
- **Exibição Única Inteligente**:
  - Aparece suavemente no primeiro acesso do usuário autenticado.
  - Ao clicar em *"Copiar Meu Link Agora"*, *"Ver Depois"* ou fechar no *"X"*, grava `localStorage.setItem("shapemap_referral_popup_v1", "seen")`, garantindo que **nunca mais reapareça para aquele usuário**.
- **Visual & Copy**:
  - 100% SVG em vetor (sem emojis), com efeito de brilho e cores personalizadas do usuário.
  - 3 passos claros e abrangentes (1 - Pegue seu link em "Perfil", 2 - Compartilhe com seu amigo, 3 - Ganhe +1 mês grátis para cada novo assinante).
  - Botão principal que copia o link e redireciona direto para a aba **Perfil**.
  - Suporte completo a **PT, ES e EN**.

---

## 💳 5. Arquitetura de Checkouts e Pagamentos

### 🇧🇷 5.1. Integração com Asaas (Brasil - BRL)

#### A) Plano Mensal (Recorrente)
- **Valor**: R$ 19,90 / mês.
- **Configuração na API (`api/create-asaas-checkout.js`)**:
  - `name`: `'ShapeMap - Plano Mensal'`, `description`: `'ShapeMap - Plano Mensal'`.
  - `chargeType: 'RECURRENT'`, `subscriptionCycle: 'MONTHLY'`, `billingType: 'UNDEFINED'`, `notificationDisabled: true`, `externalReference: `${trainerId}:monthly``.
- **Fluxo do Primeiro Cadastro**: Redirecionamento automático para o checkout mensal na criação de nova conta (`just_signed_up === 'true'`).

#### B) Plano Anual (2 Etapas Inteligentes)
- **Valor**: R$ 179,00 à vista ou em 12x de R$ 14,92 no cartão (25% de desconto).
- **Fluxo de Cadastro via Landing Page (`?register=true&plan=anual`)**:
  - Quando um novo cliente se cadastra vindo pelo botão do Plano Anual da página de vendas, o app **não faz redirecionamento cego** para checkout misto.
  - Ele abre diretamente a **Etapa 2 do Paywall** para o cliente escolher com 1 clique a forma de pagamento desejada:
    1. **💳 Cartão de Crédito (12x de R$ 14,92)**: `name`: `'ShapeMap - Plano Anual'`, `chargeType: 'INSTALLMENT'`, `maxInstallmentCount: 12`, `billingType: 'CREDIT_CARD'`, `externalReference: `${trainerId}:annual_card``.
    2. **⚡ Pix ou Boleto à Vista (R$ 179,00)**: `name`: `'ShapeMap - Plano Anual'`, `chargeType: 'DETACHED'`, `billingType: 'BOLETO'`, `externalReference: `${trainerId}:annual_pix``.

#### C) Desativação de Notificações Nativas do Asaas (`notificationDisabled: true`)
- Links de pagamento e perfis de clientes são gerados com `notificationDisabled: true`, evitando que o Asaas envie notificações automáticas por e-mail/SMS/WhatsApp, permitindo que as automações próprias do ShapeMap gerenciem 100% da régua de comunicação.

#### D) Webhook do Asaas (`api/asaas-webhook.js`)
- Identificação estrita por `trainerId` (via `externalReference`), com busca segura por `asaas_customer_id`.
- Grava **+365 dias** para assinaturas anuais e **+30 dias** para mensais.
- Dispara `processReferralReward(supabase, trainerId)` e evento de conversão Meta CAPI no `PAYMENT_RECEIVED` / `PAYMENT_CONFIRMED`.
- **Autocancelamento por Inadimplência (`PAYMENT_OVERDUE`)**: Ao receber notificação de fatura vencida sem pagamento, o webhook dispara ordem de cancelamento da assinatura no Asaas (`DELETE /v3/subscriptions/{id}`). O Asaas automaticamente cancela a assinatura e **exclui/apaga todas as cobranças futuras que haviam sido pré-agendadas (mês seguinte)**, impedindo acúmulo indevido de cobranças e notificações para clientes que pararam de pagar. No Supabase, o status é atualizado para `inactive`.

---

### 🌐 5.2. Integração com Stripe (Internacional - USD / BRL)

#### A) Regras de Identificação e Segurança
- **Identificação Estrita por IDs Imutáveis**: O webhook e as APIs de verificação utilizam **exclusivamente `trainerId` (UUID)** (via metadados da sessão), `stripe_customer_id` e `subscription_id`. Nenhuma busca depende de e-mails mutáveis, prevenindo inconsistências caso o cliente troque de e-mail.
- **Ativação Instantânea (`api/verify-stripe-session.js`)**: Ao retornar do checkout com `?success=true&session_id=...`, o app valida e ativa a assinatura no Supabase em **0 segundos**, fornecendo redundância fail-proof aos webhooks.

#### B) Ciclo de Vida no Webhook (`api/stripe-webhook.js`)
- **`checkout.session.completed`**: Ativa assinatura (`subscription_status = 'active'`), grava `stripe_customer_id`, `subscription_id`, `current_period_end` e aciona `processReferralReward`.
- **`customer.subscription.updated`**: Atualiza status em tempo real (`active`, `past_due`, `unpaid`) e datas de renovação. Possui trava para não sobrescrever assinaturas ativas por eventos de assinaturas abandonadas.
- **`customer.subscription.deleted`**: Atualiza status para **`canceled`**.
- **`checkout.session.expired`**: Grava o telefone do lead no Supabase para recuperação comercial.

---

## 📊 6. Rastreamento de Vendas & Meta Ads (Pixel + Conversions API)

- **Client-Side (Meta Pixel `fbq`)**:
  - `PageView`: Páginas de vendas e app.
  - `CompleteRegistration`: Disparado na criação de conta.
  - `InitiateCheckout`: Disparado ao clicar em botões de assinatura no Paywall.
  - `Purchase`: Disparado no retorno com `?success=true` com valor, moeda e `sessionId` para desduplicação.
- **Server-Side (Meta CAPI)**:
  - Disparado diretamente pelos webhooks do **Asaas** e **Stripe** com dados criptografados em SHA-256 (`em`, `ph`, `fn`, `ln`), garantindo 100% de atribuição de vendas mesmo com bloqueadores de anúncios (AdBlock) ou navegadores com restrição de cookies.

---

## 🔐 7. Regras de Acesso e Paywall por Data (`current_period_end`)

- O acesso ao painel do ShapeMap é controlado pelas variáveis `subscription_status` e `current_period_end` no Supabase:
  - **Status `active` / `trialing` + Data no Futuro** ➔ Acesso liberado.
  - **Data no Passado (Vencida) ou Status Inativo/Cancelado** ➔ Acesso bloqueado com exibição automática da `PaywallScreen`.

## 🛡️ 8. Arquitetura de Segurança e Blindagem de APIs

1. **Autenticação Obrigatória JWT em Ações Sensíveis**:
   - Endpoints de ação (`api/cancel-asaas-subscription.js`, `api/create-portal-session.js`, `api/update-stripe-email.js`) exigem cabeçalho `Authorization: Bearer <TOKEN>` criptográfico emitido pelo Supabase.
   - Chamadas não autorizadas ou com tokens forjados são rejeitadas com **`401 - Unauthorized`**.
2. **Proteção Antissequestro e IDOR (Insecure Direct Object Reference)**:
   - Toda rota valida se o `user.id` do token coincide estritamente com o `trainerId` ou o proprietário do `customerId` registrado no banco de dados.
3. **Ambiente Limpo de Produção**:
   - Endpoints de teste abertos foram removidos.
   - Chaves secretas mestras (`ASAAS_API_KEY`, `STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) permanecem 100% isoladas no servidor Vercel.

---

## 🔄 9. Fluxo de Trabalho Git e Deploy na Vercel

1. **Branch de Testes (`staging`)**:
   - URL de Preview: `nixshape-app-git-staging-nixshape.vercel.app`.
   - Comandos:
     ```bash
     git add .
     git commit -m "feat/fix: sua mensagem"
     git push origin staging
     ```

2. **Branch de Produção Oficial (`main`)**:
   - Domínio Oficial: `https://shapemapapp.com`.
   - Comandos:
     ```bash
     git checkout main
     git merge staging
     git push origin main
     git checkout staging
     ```

---

> **Nota para IAs e Desenvolvedores**: Este arquivo representa a **única fonte da verdade** da arquitetura do **ShapeMap App**. Sempre que realizar alterações estruturais relevantes no projeto, mantenha este documento atualizado.
