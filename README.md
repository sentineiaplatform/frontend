# SentineIA Frontend

Aplicação web da plataforma SentineIA para gestão de denúncias e compliance.

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4 + shadcn/ui
- React Router
- React Hook Form + Zod

## Requisitos

- Node.js 20+
- npm 10+

## Configuração local

1. Entre na pasta do frontend:

```bash
cd frontend
```

2. Instale dependências:

```bash
npm install
```

3. Configure variáveis de ambiente:

```bash
cp .env.example .env
```

> A variável principal é `VITE_API_BASE_URL` (por padrão: `http://localhost:8080`).

4. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Aplicação disponível em `http://localhost:5173`.

## Scripts disponíveis

- `npm run dev`: inicia ambiente de desenvolvimento (HMR)
- `npm run build`: valida TypeScript e gera build de produção
- `npm run lint`: executa ESLint
- `npm run preview`: serve localmente a build gerada

## Estrutura principal

```text
src/
  components/     # componentes reutilizáveis (ui, dialogs, auth, etc.)
  contexts/       # providers globais (ex.: autenticação)
  layouts/        # estruturas de layout (dashboard e áreas internas)
  lib/            # utilitários e integrações base
  pages/          # páginas e fluxos de negócio
  services/       # serviços HTTP e regras de acesso a API
```

## Rotas principais

- `/`: landing page institucional
- `/login`: autenticação
- `/cadastro`: cadastro de usuário
- `/recuperar-senha` e `/redefinir-senha`: recuperação de acesso
- `/app/*`: área autenticada (painel, denúncias, dados mestres, configurações)

## Integração com backend

- O frontend consome a API definida em `VITE_API_BASE_URL`.
- Se a variável não estiver definida, usa `http://localhost:8080`.
- Garanta que o backend esteja em execução antes de testar login e fluxos autenticados.

## Convenções rápidas

- Prefira componentes existentes em `src/components/ui`.
- Mantenha textos e labels em português (pt-BR).
- Antes de abrir PR, rode:

```bash
npm run lint
npm run build
```
