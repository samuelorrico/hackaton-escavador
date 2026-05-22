# Assets

## Objetivo

Esta pasta guarda arquivos de dados usados no projeto.

## Convenção atual

- `banco_de_dados.csv`: arquivo bruto de entrada
- `banco_de_dados.db`: banco SQLite gerado a partir do CSV

## Fluxo esperado

1. colocar ou atualizar o CSV em `assets/`
2. executar o importador em `scripts/data/csv_to_sqlite.go`
3. usar o SQLite gerado no restante do projeto

## Comando de referência

```bash
go run scripts/data/csv_to_sqlite.go -src assets/banco_de_dados.csv -db assets/banco_de_dados.db -table dados
```
