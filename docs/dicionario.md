# Dicionário de Dados

## Objetivo do documento

Este documento organiza as variáveis meteorológicas usadas no projeto `GuardiãoIA Meteorológico` e define como elas serão interpretadas dentro do MVP.

Ele serve como referência para:

- leitura da base;
- padronização de nomes;
- criação de features;
- modelagem de risco;
- construção das telas e indicadores.

## Contexto da base

A base utilizada no projeto é meteorológica e está centrada em `estações`.

Isso significa que:

- a menor unidade observável do dado é a estação;
- cidade e bairro/região serão camadas derivadas de agrupamento;
- as análises do MVP partem do comportamento temporal de cada estação.

## Estrutura lógica das variáveis

As colunas podem ser entendidas em quatro grupos:

### 1. Identificação

Variáveis usadas para identificar origem e localização da leitura.

### 2. Tempo

Variáveis usadas para ordenar, agrupar e construir séries temporais.

### 3. Clima bruto

Variáveis meteorológicas medidas diretamente.

### 4. Indicadores derivados

Variáveis calculadas a partir das leituras originais para alimentar o classificador, o radar de extremos e o score de risco.

## Colunas principais do projeto

| Tipo | Coluna original | Nome lógico sugerido | Descrição | Unidade | Prioridade no MVP |
|---|---|---|---|---|---|
| Identificação | `ESTACAO` | `station_id` | Código da estação meteorológica | ID | Alta |
| Tempo | `DATA / HORA` | `timestamp` | Registro temporal da medição em UTC | Data/Hora | Alta |
| Clima bruto | `PRECIPITACAO TOTAL` | `rain_1h_mm` | Chuva acumulada na última hora | `mm` | Alta |
| Clima bruto | `PRESSAO ATMOSFERICA` | `pressure_mb` | Pressão atmosférica observada | `mB` | Alta |
| Clima bruto | `RADIACAO GLOBAL` | `solar_radiation_wm2` | Intensidade de radiação solar | `W/m²` | Média |
| Clima bruto | `TEMPERATURA DO AR` | `air_temp_c` | Temperatura ambiente do ar | `°C` | Alta |
| Clima bruto | `UMIDADE RELATIVA` | `humidity_pct` | Umidade relativa do ar | `%` | Alta |
| Clima bruto | `VENTO (RAJADA)` | `wind_gust_ms` | Rajada máxima de vento | `m/s` | Alta |

## Descrição por coluna

### `ESTACAO`

**Função**

- identificar a origem da leitura;
- separar análises por estação;
- servir de base para agrupar por cidade e bairro/região.

**Uso no projeto**

- agrupamento;
- filtros;
- telas por estação;
- gêmeo climático.

### `DATA / HORA`

**Função**

- ordenar cronologicamente as medições;
- permitir janelas móveis e tendências;
- construir séries por estação.

**Uso no projeto**

- agregações temporais;
- acumulados;
- deltas;
- análises históricas.

### `PRECIPITACAO TOTAL`

**Função**

- medir chuva horária;
- compor o principal sinal de risco climático no MVP.

**Uso no projeto**

- acumulado de chuva;
- score de risco;
- detecção de extremos;
- comparação entre períodos.

### `PRESSAO ATMOSFERICA`

**Função**

- indicar estabilidade ou instabilidade atmosférica.

**Uso no projeto**

- deltas de pressão;
- sinais de mudança brusca;
- apoio ao classificador de risco.

### `RADIACAO GLOBAL`

**Função**

- complementar a leitura ambiental e climática.

**Uso no projeto**

- variável de apoio;
- possível enriquecimento do modelo;
- análise complementar em telas.

### `TEMPERATURA DO AR`

**Função**

- medir comportamento térmico do ambiente.

**Uso no projeto**

- deltas de temperatura;
- padrões meteorológicos;
- apoio ao radar de extremos.

### `UMIDADE RELATIVA`

**Função**

- indicar saturação do ar e condição atmosférica.

**Uso no projeto**

- score de risco;
- leitura de condição crítica;
- correlação com chuva e instabilidade.

### `VENTO (RAJADA)`

**Função**

- indicar intensidade máxima de vento no período.

**Uso no projeto**

- apoio à detecção de extremos;
- reforço do contexto meteorológico;
- análise de instabilidade.

## Prioridade das variáveis no MVP

### Prioridade alta

- `ESTACAO`
- `DATA / HORA`
- `PRECIPITACAO TOTAL`
- `PRESSAO ATMOSFERICA`
- `TEMPERATURA DO AR`
- `UMIDADE RELATIVA`
- `VENTO (RAJADA)`

### Prioridade média

- `RADIACAO GLOBAL`

## Indicadores derivados planejados

As variáveis brutas alimentarão os seguintes indicadores:

### Acumulados de chuva

- `rain_6h_mm`
- `rain_12h_mm`
- `rain_24h_mm`
- `rain_48h_mm`
- `rain_72h_mm`

### Variações e deltas

- `pressure_delta`
- `temp_delta`
- `humidity_delta`
- `wind_delta`

### Estatísticas móveis

- médias móveis;
- máximos recentes;
- mínimos recentes;
- desvio em relação ao histórico da estação.

### Indicadores de IA

- `anomaly_score`
- `risk_score`
- `risk_level`
- `climate_cluster`

## Relação com os módulos do produto

### Painel Operacional

Usa:

- score de risco;
- nível de risco;
- agregação por cidade e bairro/região.

### Radar de Extremos Climáticos

Usa:

- acumulados de chuva;
- deltas;
- anomalias;
- comparação com histórico da estação.

### Classificador de Risco

Usa:

- chuva;
- pressão;
- temperatura;
- umidade;
- vento;
- features derivadas.

### Gêmeo Climático

Usa:

- padrões médios por estação;
- agrupamento por similaridade;
- comparação entre estações parecidas.

## Regras práticas de tratamento

Antes de usar os dados no modelo ou nas telas, o pipeline deve:

- padronizar nomes de colunas;
- converter tipos numéricos;
- combinar corretamente data e hora;
- ordenar por estação e tempo;
- tratar valores ausentes;
- validar consistência temporal.

## Observações importantes

- os nomes reais no banco podem ser mais longos do que os nomes lógicos usados aqui;
- algumas colunas podem estar armazenadas como texto;
- o dado territorial por bairro pode não existir diretamente na base;
- bairro/região pode precisar ser representado como camada derivada da estação e da cidade.

## Convenção recomendada para implementação

Na camada de código, vale usar nomes internos curtos e previsíveis, por exemplo:

- `station_id`
- `timestamp`
- `rain_1h_mm`
- `pressure_mb`
- `air_temp_c`
- `humidity_pct`
- `wind_gust_ms`
- `risk_score`
- `risk_level`

Isso facilita:

- leitura do código;
- manutenção;
- criação de APIs;
- integração entre backend e frontend.
