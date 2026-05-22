# Arquitetura e Stack

## Objetivo deste documento

Este documento define a direção arquitetural do `GuardiãoIA Meteorológico` para o hackathon, equilibrando:

- velocidade de entrega;
- qualidade técnica;
- boa demo;
- facilidade de evolução depois do MVP.

## Decisão principal de produto

A melhor forma de entregar o MVP é como uma `aplicação web responsiva`.

## Por que web é a melhor escolha agora

- mais rápida de desenvolver no hackathon;
- funciona bem em notebook e celular;
- evita manter duas codebases;
- facilita a demo presencial;
- permite evoluir depois para PWA ou app mobile.

## O que não recomendo para o MVP inicial

- app mobile nativo separado;
- desktop app com Electron;
- desktop app com Tauri;
- backend inteiro em Node se a parte central for dados e IA;
- duas frentes independentes, web e mobile, ao mesmo tempo.

## Decisão por camada

### Frontend

Recomendação:

- `TypeScript`
- `React`
- `Vite`
- `Tailwind CSS`
- `Recharts` ou `ECharts`

**Por que essa escolha**

- TypeScript melhora organização e manutenção;
- React acelera construção da interface;
- Vite é mais rápido para começar no hackathon;
- Tailwind ajuda a entregar interface boa sem perder tempo;
- bibliotecas de gráfico resolvem bem dashboard e séries temporais.

### Backend

Recomendação:

- `Python`
- `FastAPI`

**Por que essa escolha**

- Python é mais forte para ETL, análise e IA;
- integra melhor com `pandas`, `numpy`, `scikit-learn` e `xgboost`;
- FastAPI é simples, rápida e ótima para expor endpoints do MVP;
- facilita separar interface de processamento.

### Dados

Recomendação:

- `SQLite` como base de origem;
- camada intermediária em `pandas`;
- possibilidade de gerar tabelas derivadas para consumo do front.

**Por que essa escolha**

- o projeto já nasce em cima do banco local;
- SQLite simplifica demo offline;
- pandas acelera limpeza, transformação e feature engineering.

### IA e análise

Recomendação:

- `pandas`
- `numpy`
- `scikit-learn`
- `xgboost` se necessário
- `joblib` para persistir modelos e artefatos

**Uso por módulo**

- Radar de Extremos: detecção de anomalias;
- Classificador de Risco: score e classificação;
- Gêmeo Climático: clusterização e similaridade entre estações.

## Arquitetura recomendada

### Modelo geral

- `Frontend web` consome dados e insights pela API;
- `Backend FastAPI` lê o banco, processa features e entrega resultados;
- `Camada de IA` calcula risco, anomalia e agrupamentos;
- `SQLite` permanece como fonte local principal.

## Fluxo da aplicação

1. o backend lê o banco local;
2. normaliza e trata os dados;
3. gera features derivadas;
4. calcula score de risco, anomalias e grupos climáticos;
5. expõe isso em endpoints;
6. o frontend mostra Bahia, cidade, bairro/região e estação.

## Estrutura territorial do produto

Mesmo com o banco centrado em estações, a experiência do produto deve ser:

- visão geral da Bahia;
- entrada por cidade;
- aprofundamento por bairro ou região;
- detalhamento técnico por estação.

No MVP, isso pode ser resolvido assim:

- estação mapeada para cidade;
- cidade agregando uma ou mais estações;
- bairro tratado como recorte visual, zona monitorada ou região operacional da cidade.

## Stack final recomendada

### Opção mais equilibrada para o hackathon

- Frontend: `React + TypeScript + Vite + Tailwind`
- Backend: `Python + FastAPI`
- Dados: `SQLite + pandas`
- IA: `scikit-learn` e, se necessário, `xgboost`
- Visualização: `Recharts` ou `ECharts`

## Por que não usar tudo em TypeScript

TypeScript é excelente no frontend e até pode funcionar no backend, mas para esse projeto ele perde para Python no núcleo de dados e IA.

O ideal aqui é usar a melhor linguagem para cada nicho:

- `TypeScript` para interface e experiência do usuário;
- `Python` para processamento, análise e inteligência climática.

## Organização sugerida do projeto

### Estrutura macro

- `frontend/`
- `backend/`
- `docs/`
- `assets/`

### Responsabilidade de cada parte

- `frontend/`: telas, gráficos, navegação por Bahia, cidade, bairro e estação;
- `backend/`: leitura do banco, cálculo de métricas, endpoints e IA;
- `docs/`: produto, planejamento e arquitetura;
- `assets/`: base de dados e arquivos auxiliares.

## Possível evolução após o MVP

- transformar em PWA;
- criar app mobile com React Native;
- integrar alertas por WhatsApp;
- adicionar mapas mais ricos;
- incorporar novas bases territoriais.

## Decisão final recomendada

Se a equipe quiser uma decisão objetiva agora, eu recomendo fechar assim:

- produto: `aplicação web responsiva`;
- frontend: `React + TypeScript`;
- backend: `FastAPI + Python`;
- dados: `SQLite`;
- IA: `pandas + scikit-learn`, com `xgboost` se necessário.

Essa combinação é a que melhor equilibra velocidade, robustez técnica e chance real de entregar uma demo forte no hackathon.
