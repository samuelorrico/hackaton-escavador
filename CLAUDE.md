# GuardiãoIA Meteorológico — Guia do Agente

## PRIMEIRA AÇÃO DE TODA SESSÃO

**Ler `specs/MASTER.md` antes de qualquer coisa.**

O MASTER tem o status exato do projeto: o que está feito, em andamento e pendente.
Encontrar o primeiro item `⬜ pendente` ou `🔄 em andamento` e iniciar por ele.
Atualizar o status no MASTER a cada task concluída.

## Modo de comunicação padrão

**SEMPRE use caveman mode (full) para economizar tokens.**

Ative no início de toda sessão com `/caveman` ou diga "caveman mode".
Isso corta ~75% dos tokens sem perder precisão técnica.

## Projeto

Plataforma de monitoramento climático inteligente para a Bahia.
Hackathon LIAO / BaIA Week 2026 — tema: resiliência climática.

- **Backend:** Python + FastAPI + pandas + scikit-learn
- **Frontend:** React + TypeScript + Vite + Tailwind + Recharts
- **Dados:** SQLite local (`assets/banco_de_dados.db`) — 5,2M linhas, 48 estações, 2000–2021
- **IA:** anomaly detection, risk classification, clustering por estação
- **Sem APIs externas** — tudo offline no banco local

## Módulos principais

| Módulo | Função |
|---|---|
| Radar de Extremos | Detecta padrões atípicos por estação |
| Classificador de Risco | Score 0–100 → baixo/médio/alto/crítico |
| Gêmeo Climático | Agrupa estações similares, detecta desvios |
| Painel Operacional | Dashboard unificado Bahia→Cidade→Bairro→Estação |

## Skills disponíveis

Todos instalados em `.claude/skills/`. Use conforme tarefa:

| Skill | Quando usar | Comando |
|---|---|---|
| `caveman` | **Sempre** — economiza tokens | `/caveman` |
| `tlc-spec-driven` | Antes de codar qualquer feature | `specify feature [nome]` |
| `react-best-practices` | Ao escrever ou revisar componentes React | automático |
| `frontend-blueprint` | Ao desenhar nova tela ou layout | `design [tela]` |
| `mermaid-studio` | Gerar diagramas (arquitetura, fluxo, pitch) | `/mermaid` |
| `technical-design-doc-creator` | Criar TDD / doc técnico / RFC | `create design doc` |
| `perf-web-optimization` | Charts lentos, bundle pesado | `optimize performance` |
| `security-best-practices` | Review de segurança FastAPI ou React | `security review` |
| `netlify-deploy` | Deploy do frontend para demo | `deploy to netlify` |

## Reinstalar skills (novo membro da equipe)

```bash
npx @tech-leads-club/agent-skills install --skill tlc-spec-driven
npx @tech-leads-club/agent-skills install --skill react-best-practices
npx @tech-leads-club/agent-skills install --skill mermaid-studio
npx @tech-leads-club/agent-skills install --skill frontend-blueprint
npx @tech-leads-club/agent-skills install --skill perf-web-optimization
npx @tech-leads-club/agent-skills install --skill technical-design-doc-creator
npx @tech-leads-club/agent-skills install --skill security-best-practices
npx @tech-leads-club/agent-skills install --skill netlify-deploy
```

## Docs do projeto

- [Ideias](docs/ideias.md)
- [Planejamento](docs/planejamento.md)
- [Arquitetura](docs/arquitetura.md)
- [Dicionário de dados](docs/dicionario.md)
- [Hackathon](docs/hackathon.md)

## Regras

- Não usar APIs externas — só `assets/banco_de_dados.db`
- Python para tudo de dados e IA, TypeScript para frontend
- Não usar Go para backend — scikit-learn/pandas exige Python
- Sempre especificar antes de implementar (`tlc-spec-driven`)
- Demo deve funcionar offline
- **Nunca incluir `Co-Authored-By` de IA em commits** — remover sempre
- **`/security-review` obrigatório ao fechar cada fase** (1.SEC, 2.SEC, 3.SEC, 4.SEC, 5.SEC no MASTER)
