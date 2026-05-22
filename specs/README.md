# Specs

**Este arquivo:** specs/README.md
**Workflow obrigatório:** Spec → Test → Code → Review → Commit — ver [specs/WORKFLOW.md](WORKFLOW.md)

Especificações de features do GuardiãoIA Meteorológico.

**Regra:** criar spec aqui antes de qualquer implementação.

## Como criar uma spec

```
specify feature [nome da feature]
```

A skill `tlc-spec-driven` guia o processo completo.

## Workflow

Ver [WORKFLOW.md](WORKFLOW.md) — ciclo completo: Spec → Test → Code → Review → Commit.

## Organização

```
specs/
  radar/          Radar de Extremos Climáticos
  classificador/  Classificador de Risco Meteorológico
  gemeo/          Gêmeo Climático das Estações
  frontend/       Telas e componentes do painel
  backend/        Pipeline de dados e endpoints
```

## Workflow

```
Spec → Test → Code → Review → Commit
```
1. Ler este spec completo
2. Escrever testes (ver path de testes acima) — rodar: devem falhar
3. Implementar até testes passarem
4. `/caveman-review` — code review
5. `git commit` com mensagem do formato especificado
6. Marcar tasks como ✅ em [specs/MASTER.md](MASTER.md)
