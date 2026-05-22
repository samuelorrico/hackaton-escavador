# Ideias para o Hackathon

## Restrição assumida

Este documento considera um critério rígido:

- usar estritamente os dados já disponíveis em `assets/banco_de_dados.db`;
- não depender de scraping, APIs externas ou bases complementares;
- construir a proposta apenas com as variáveis meteorológicas já presentes na tabela `dados`.

## O que existe no banco hoje

A base em `assets/banco_de_dados.db` já é forte o suficiente para sustentar um MVP:

- tabela `dados`;
- cerca de `5,2 milhões` de linhas;
- período de `2000-05-13` até `2021-01-31`;
- `48` estações meteorológicas;
- variáveis de chuva, pressão, radiação, temperatura, umidade e vento.

Isso significa que as melhores ideias são as que extraem inteligência meteorológica diretamente dessa série histórica.

## Estrutura recomendada

Em vez de tratar como `4` ideias separadas, a melhor forma de apresentar é:

- `1 solução principal`;
- `3 módulos inteligentes` dentro dela.

Isso deixa o projeto mais forte, mais coeso e mais fácil de defender no pitch.

## Ideia principal recomendada

### GuardiãoIA Meteorológico

Plataforma de monitoramento e alerta de risco meteorológico usando somente o histórico das estações do banco local.

**Resumo**

O GuardiãoIA Meteorológico aprende o comportamento normal de cada estação e identifica condições anormais associadas a chuva intensa, instabilidade atmosférica e combinação crítica de variáveis. Em vez de depender de um histórico externo de desastres, ele gera um índice de risco meteorológico operacional e concentra tudo em um painel único.

**Por que essa ideia é a mais segura**

- usa 100% o banco já disponível;
- evita a dependência de um target externo que vocês ainda não têm;
- continua usando IA como núcleo;
- permite mostrar código, modelo, API e painel;
- mantém aderência ao tema climático da Bahia.

**Como a IA entra**

- detecção de anomalias por estação;
- clusterização de padrões meteorológicos;
- classificação de faixas de risco com regras derivadas dos próprios dados;
- séries temporais para identificar comportamento fora do normal.

**Saída do sistema**

- score de risco meteorológico de `0 a 100`;
- classificação `baixo`, `médio`, `alto` e `crítico`;
- fatores que mais influenciaram o alerta, como chuva acumulada, queda de pressão e aumento de umidade;
- visualização consolidada por estação.

**MVP**

- leitura do SQLite;
- limpeza e tipagem das colunas;
- criação de acumulados de chuva em 6h, 12h, 24h, 48h e 72h;
- deltas de pressão, temperatura, umidade e vento;
- índice de anomalia por estação;
- classificador de risco;
- comparação entre estações semelhantes;
- API com FastAPI;
- dashboard simples com ranking de risco por estação.

**Frase de pitch**

"O GuardiãoIA Meteorológico transforma o histórico das estações da Bahia em um sistema inteligente de alerta para condições climáticas críticas."

## Módulos do GuardiãoIA

### 1. Radar de Extremos Climáticos

Painel analítico que identifica quais estações estão entrando em padrões extremos com base no histórico delas mesmas.

**Função**

- detectar comportamento fora do padrão;
- ranquear estações mais críticas no momento;
- destacar sinais como chuva intensa, queda de pressão e aumento anormal de umidade.

### 2. Classificador de Risco Meteorológico

Modelo que aprende faixas operacionais a partir do próprio histórico e classifica cada estação em `baixo`, `médio`, `alto` ou `crítico`.

**Função**

- transformar sinais técnicos em decisão simples;
- gerar score de risco;
- facilitar alertas automáticos e leitura rápida da situação.

**Observação importante**

Como estamos limitados ao banco local, esse classificador não prevê diretamente "desastre confirmado". Ele classifica severidade meteorológica com base em padrões do histórico.

### 3. Gêmeo Climático das Estações

Ferramenta que agrupa estações com comportamento semelhante e detecta quando uma delas foge do padrão esperado do seu grupo.

**Função**

- comparar estações parecidas;
- encontrar desvios relevantes;
- reforçar a inteligência do sistema além da análise isolada de cada estação.

### 4. Painel Operacional Unificado

Camada visual que reúne os módulos anteriores em uma única interface.

**Função**

- mostrar risco por estação;
- destacar extremos climáticos;
- comparar estações semelhantes;
- oferecer visão consolidada para monitoramento.

## Qual direção eu recomendo

Se vocês vão trabalhar estritamente com o banco em `assets`, a melhor escolha é apresentar:

`GuardiãoIA Meteorológico como plataforma principal`

Porque ele entrega melhor equilíbrio entre:

- viabilidade técnica;
- aderência ao dado disponível;
- uso real de IA;
- facilidade de demo;
- clareza para o pitch.

## O que muda em relação à ideia anterior

Antes, a proposta mais forte era prever alagamento ou deslizamento com histórico de ocorrências externas.

Com a nova restrição, isso deixa de ser a melhor recomendação, porque:

- o banco local não contém o evento de desastre como target explícito;
- depender de fontes externas quebraria a regra que você acabou de definir;
- um modelo supervisionado de desastre ficaria artificial ou fraco sem rótulo confiável.

Então o caminho mais honesto e forte é:

- prever ou classificar `risco meteorológico`;
- detectar `condições atmosféricas anormais`;
- comparar comportamento entre estações;
- transformar isso em alerta operacional.

## Recorte final recomendado

Se precisarmos ser bem objetivos, o melhor recorte é:

**"Criar uma plataforma inteligente que usa exclusivamente o banco meteorológico local para detectar extremos climáticos, classificar risco e monitorar estações da Bahia em tempo quase real."**

## Estrutura de apresentação para a banca

### Problema

Órgãos públicos reagem tarde a mudanças rápidas nas condições meteorológicas, especialmente quando o volume de dados históricos é grande e difícil de interpretar manualmente.

### Solução

Usar IA sobre o banco meteorológico local para detectar padrões extremos, classificar risco e consolidar alertas automáticos em uma única plataforma.

### Diferencial

- solução 100% baseada em dados reais já disponíveis;
- sem dependência externa;
- escalável para várias estações;
- combina monitoramento, classificação e comparação inteligente;
- pronta para virar serviço contínuo de monitoramento.

### Impacto

- resposta mais rápida;
- melhor priorização operacional;
- leitura mais clara de risco climático;
- apoio à gestão pública baseada em dados.
