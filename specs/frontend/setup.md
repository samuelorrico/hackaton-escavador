# Spec: Setup do Frontend

**Este arquivo:** specs/frontend/setup.md
**Workflow obrigatório:** Spec → Test → Code → Review → Commit — ver [specs/WORKFLOW.md](../WORKFLOW.md)

## Critérios de aceite

- [ ] [`frontend/`](../../frontend/) criado com Vite + React + TypeScript
- [ ] Tailwind CSS configurado
- [ ] React Router configurado com todas as rotas
- [ ] Recharts instalado
- [ ] `vitest` configurado e rodando
- [ ] Proxy para API configurado no Vite (localhost:8000 → /api)
- [ ] `npm run dev` sobe em localhost:5173
- [ ] `npm run test` roda sem erro em projeto vazio

## Estrutura

```
frontend/
  src/
    components/
      ui/               componentes genéricos (Badge, Card, Spinner, ErrorMessage)
      charts/           Recharts wrappers reutilizáveis
      layout/           Navbar, Breadcrumb, Layout
    pages/
      DashboardPage.tsx
      CityPage.tsx
      NeighborhoodPage.tsx
      StationPage.tsx
      RadarPage.tsx
      ClassificadorPage.tsx
      GemeoPage.tsx
      MetodologiaPage.tsx
    hooks/              custom hooks de fetch por módulo
    types/              interfaces TypeScript alinhadas com API schemas
    lib/
      api.ts            fetch wrapper com base URL configurável
      utils.ts          formatadores, helpers
    router.tsx          React Router config
    main.tsx
    App.tsx
  __tests__/
  vite.config.ts
  tailwind.config.ts
  tsconfig.json
  package.json
```

## package.json (deps principais)

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.23.0",
    "recharts": "^2.12.0",
    "mermaid": "^10.9.0"
  },
  "devDependencies": {
    "vite": "^5.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.4.0",
    "tailwindcss": "^3.4.0",
    "vitest": "^1.6.0",
    "@testing-library/react": "^15.0.0",
    "@testing-library/jest-dom": "^6.4.0"
  }
}
```

## Paleta de cores por risk_level (Tailwind)

| Nível | Cor | Classe |
|---|---|---|
| baixo | verde | `bg-green-500` |
| médio | amarelo | `bg-yellow-400` |
| alto | laranja | `bg-orange-500` |
| crítico | vermelho | `bg-red-600` |
| normal (anomaly) | cinza | `bg-gray-400` |
| atípico | amarelo | `bg-yellow-400` |
| extremo | vermelho | `bg-red-600` |

## Tasks

- [ ] **T1** `npm create vite@latest frontend -- --template react-ts`
- [ ] **T2** Instalar Tailwind: `npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init`
- [ ] **T3** Instalar dependências: React Router, Recharts, Mermaid, Vitest, Testing Library
- [ ] **T4** Configurar proxy Vite: `/api` → `http://localhost:8000`
- [ ] **T5** Criar estrutura de pastas
- [ ] **T6** Criar `RiskLevelBadge` — componente base reutilizável em todas as telas
- [ ] **T7** Criar `Navbar` com links: Dashboard / Cidades / Radar / Classificador / Gêmeo / Metodologia
- [ ] **T8** Criar [`frontend/src/router.tsx`](../../frontend/src/router.tsx) com todas as rotas registradas
- [ ] **T9** Criar [`frontend/src/lib/api.ts`](../../frontend/src/lib/api.ts) com fetch wrapper e base URL
- [ ] **T10** Confirmar `npm run dev` e `npm run test` funcionam
- [ ] **T11** Commit: `chore(frontend): initial Vite+React+TS+Tailwind setup`

## Dependências

[specs/backend/setup.md](../backend/setup.md) não precisa estar completo — frontend pode ser configurado em paralelo.
Precisa de [specs/backend/api-endpoints.md](../backend/api-endpoints.md) para saber os tipos TypeScript.

## Workflow

```
Spec → Test → Code → Review → Commit
```
1. Ler este spec completo
2. Escrever testes (ver path de testes acima) — rodar: devem falhar
3. Implementar até testes passarem
4. `/caveman-review` — code review
5. `git commit` com mensagem do formato especificado
6. Marcar tasks como ✅ em [specs/MASTER.md](../MASTER.md)
