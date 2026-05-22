# Scripts de Dados

## Objetivo

Esta pasta concentra scripts utilitários para preparação de dados do projeto.

## Script atual

### `csv_to_sqlite.go`

Converte um arquivo CSV grande para SQLite com foco em:

- leitura em streaming;
- baixo uso de memória;
- criação automática da tabela;
- inserção em lotes;
- progresso durante importação.

## Quando usar

Use esse script quando:

- o CSV bruto chegar novamente;
- o banco precisar ser recriado;
- vocês quiserem trocar nome de tabela ou caminho do banco;
- precisarem repetir a etapa de ingestão em outra máquina.

## Comando recomendado

```bash
go run scripts/data/csv_to_sqlite.go -src assets/banco_de_dados.csv -db assets/banco_de_dados.db -table dados
```

## Exemplos úteis

Importação padrão:

```bash
go run scripts/data/csv_to_sqlite.go assets/banco_de_dados.csv
```

Importação com lote maior:

```bash
go run scripts/data/csv_to_sqlite.go -src assets/banco_de_dados.csv -db assets/banco_de_dados.db -table dados -batch-size 10000 -progress-every 200000
```

## Convenção sugerida de arquivos

### Entrada bruta

- `assets/banco_de_dados.csv`

### Saída processada

- `assets/banco_de_dados.db`

## Flags disponíveis

- `-csv`, `-src`, `-path`: caminho do CSV
- `-db`: caminho do banco SQLite de saída
- `-table`: nome da tabela
- `-batch-size`: quantidade de linhas por lote
- `-progress-every`: intervalo de progresso em linhas
- `-overwrite`: recria a tabela antes de importar

## Observações práticas

- o script usa `sqlite3`, então a ferramenta precisa estar instalada;
- a tabela padrão gerada é `dados`;
- os nomes das colunas são sanitizados automaticamente;
- campos são importados como `TEXT`, e a tipagem pode ser tratada depois na camada analítica.
