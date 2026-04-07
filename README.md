# FocusTrack

### Sistema pessoal de gerenciamento de metas semanais e finanças.

## Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Prisma** + **PostgreSQL**
- **Server Actions**

## Quick Start

```bash
# 1. Subir banco
docker compose up -d

# 2. Aplicar migrations
npx prisma migrate dev --name init

# 3. Rodar dev
npm run dev
```

## Estrutura do Projeto

```
app/
├── page.tsx              # Dashboard (Server Component)
├── tasks/actions/        # Server Actions de tarefas
├── finances/actions/      # Server Actions de finanças
└── generated/prisma/     # Prisma Client

components/
├── ui/                   # Button, Card, Input
├── tasks/                # TaskList (Client Component)
└── finances/             # FinancesOverview (Client Component)

lib/
├── prisma.ts             # Cliente Prisma singleton
└── utils.ts              # Helpers

prisma/
└── schema.prisma          # Models: Task, Transaction, Category, SavingsGoal
```

## Conceitos Chave

### Server Components vs Client Components
- **Server** (`app/page.tsx`): Roda no servidor, acesso direto ao banco
- **Client** (`"use client"`): Interatividade no navegador (React hooks)

### Server Actions
Funções `"use server"` que rodam no servidor e podem ser chamadas pelo cliente.

### Prisma
ORM que gera um cliente tipado baseado no schema do banco.
