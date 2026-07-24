# ShapeMap App - Visão Geral do Projeto

Este documento serve como um guia de referência rápida para agentes de IA entenderem a arquitetura do projeto e o fluxo de trabalho ao iniciar novas tarefas ou conversas.

---

## 🛠️ Stack Tecnológica

1. **Frontend**: React (Vite) + CSS customizado (visual moderno, dark mode, responsivo).
2. **Backend/Banco de Dados**: Supabase (PostgreSQL) para armazenamento de dados dos treinadores, alunos e avaliações.
3. **Serviços de Terceiros**:
   - **Stripe**: Cobrança de assinaturas recorrentes (BRL para `/br`, USD para `/es` e `/en`).
   - **Meta Ads Conversions API**: Eventos de pixel disparados no checkout via servidor.
4. **Deploy**: Hospedado na Vercel (com rotas serverless na pasta `/api`).

---

## 📂 Estrutura de Arquivos Principal

- [src/App.jsx](file:///c:/Users/jeffe/Desktop/Avalia%C3%A7%C3%A3o%20F%C3%ADsica/App/src/App.jsx): Contém todo o fluxo da aplicação React (telas do profissional, dashboard, cadastros, criação de avaliações físicas, histórico, etc.).
- [api/](file:///c:/Users/jeffe/Desktop/Avalia%C3%A7%C3%A3o%20F%C3%ADsica/App/api/):
  - [create-checkout-session.js](file:///c:/Users/jeffe/Desktop/Avalia%C3%A7%C3%A3o%20F%C3%ADsica/App/api/create-checkout-session.js): Criação de sessões de assinatura no Stripe (BRL/USD).
  - [stripe-webhook.js](file:///c:/Users/jeffe/Desktop/Avalia%C3%A7%C3%A3o%20F%C3%ADsica/App/api/stripe-webhook.js): Recebe eventos de checkout finalizado, atualizações e cancelamento de assinaturas. Possui trava de segurança para evitar que cancelamentos de assinaturas antigas/abandonadas sobrescrevam assinaturas ativas novas.
- [public/](file:///c:/Users/jeffe/Desktop/Avalia%C3%A7%C3%A3o%20F%C3%ADsica/App/public/):
  - `/br`, `/es`, `/en`: Pastas das páginas de vendas/VSL estáticas localizadas em cada idioma.
  - [manifest.json](file:///c:/Users/jeffe/Desktop/Avalia%C3%A7%C3%A3o%20F%C3%ADsica/App/public/manifest.json) e [sw.js](file:///c:/Users/jeffe/Desktop/Avalia%C3%A7%C3%A3o%20F%C3%ADsica/App/public/sw.js): Configurações PWA que tornam o site instalável no Android/iOS (Chrome/Safari).

---

## 🔄 Fluxo de Desenvolvimento e Deploy

1. **Branch de Testes (`staging`)**:
   - Todo o desenvolvimento deve começar na branch `staging`.
   - Para testar na Vercel (gerar link de Preview/Teste), execute: `npx vercel --yes` (sem o parâmetro `--prod`).
2. **Branch de Produção (`main`)**:
   - Após validação e aprovação do cliente, faça o merge da branch `staging` para a `main`.
   - Para publicar em produção oficial (`shapemapapp.com`), execute: `npx vercel --prod --yes`.

---

## 🔒 Diretrizes para Próximos Desenvolvedores/Agentes

- **Preservar Lógica Existente**: Ao modificar telas em `App.jsx`, mantenha intactos os fluxos de tradução (`lang === "en" || lang === "es"`), os cálculos físicos de IMC, gordura e TMB, e as travas de segurança de assinatura.
- **Validações Atuais**: 
  - O campo de Altura possui um aviso permanente em vermelho sutil instruindo o formato em centímetros (`Use centímetro (ex: 172 em vez de 1,72)`).
  - O modal de instalação de PWA no primeiro login foi desativado; a orientação está integrada ao onboarding.
