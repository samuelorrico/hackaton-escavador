# Skills do Agente

Skills instalados para o GuardiãoIA. Disponíveis em `.claude/skills/`, `.cursor/skills/` e `.windsurf/skills/`.

## Economizar tokens — usar sempre

| Skill | Comando | O que faz |
|---|---|---|
| `caveman` | `/caveman` | Corta ~75% dos tokens mantendo precisão técnica. **Ativar no início de toda sessão.** |

## Planejamento e specs

| Skill | Trigger | O que faz |
|---|---|---|
| `tlc-spec-driven` | `specify feature [nome]` | Define spec completo antes de codar: requisitos, design, tarefas atômicas com critérios de verificação |
| `technical-design-doc-creator` | `create design doc` | Cria TDD / RFC / doc técnico estruturado — útil para pitch e defesa na banca |

## Frontend

| Skill | Trigger | O que faz |
|---|---|---|
| `react-best-practices` | automático em código React | Padrões de performance, composição e bundle — Vercel Engineering guidelines |
| `frontend-blueprint` | `design [tela]` | Guia estruturado para desenhar novas telas antes de codar |
| `perf-web-optimization` | `optimize performance` | Bundle size, lazy loading, cache — crítico para charts com 5,2M de linhas |

## Diagramas

| Skill | Trigger | O que faz |
|---|---|---|
| `mermaid-studio` | `/mermaid` | Gera diagramas de arquitetura, fluxo, sequência, ERD — útil para tela Metodologia e pitch |

## Segurança e deploy

| Skill | Trigger | O que faz |
|---|---|---|
| `security-best-practices` | `security review` | Review de segurança Python/FastAPI e React/TypeScript |
| `netlify-deploy` | `deploy to netlify` | Deploy do frontend para demo online — aumenta nota em Qualidade Técnica (30pts) |

## Reinstalar (novo membro)

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

## Fluxo recomendado por tarefa

```
Nova feature:
  /caveman → specify feature [nome] → design [tela] → implementar → security review → commit

Novo diagrama:
  /caveman → /mermaid → [descrever o que quer]

Nova tela:
  /caveman → design [tela] → react-best-practices (automático) → optimize performance

Doc técnico / pitch:
  /caveman → create design doc → /mermaid (fluxos)
```
