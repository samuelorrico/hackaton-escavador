# Planejamento do MVP

## Nome do projeto

`GuardiãoIA Meteorológico`

## Visão do produto

O GuardiãoIA Meteorológico é uma plataforma de monitoramento climático inteligente que usa exclusivamente os dados do banco local `assets/banco_de_dados.db` para detectar extremos meteorológicos, classificar risco e comparar estações da Bahia.

O objetivo do MVP é transformar uma base histórica difícil de interpretar em uma ferramenta visual e operacional, capaz de mostrar rapidamente onde estão os maiores riscos e por quê.

## Problema que o MVP resolve

Hoje, grandes volumes de dados meteorológicos exigem leitura técnica e manual para gerar conclusões úteis. Isso dificulta resposta rápida, priorização e monitoramento contínuo.

O MVP resolve isso ao:

- consolidar dados por estação;
- consolidar visualização por cidade da Bahia;
- permitir leitura por bairros da cidade selecionada;
- destacar comportamentos fora do padrão;
- classificar risco de forma simples;
- mostrar sinais importantes em uma interface única.

## Público-alvo

- Defesa Civil;
- gestão pública;
- equipes técnicas de monitoramento;
- analistas de clima e risco;
- banca do hackathon como prova de aplicabilidade.

## Proposta do MVP

O MVP será uma plataforma web com foco em visualização e análise operacional.

Ela terá quatro motores centrais:

- `Radar de Extremos Climáticos`;
- `Classificador de Risco Meteorológico`;
- `Gêmeo Climático das Estações`;
- `Painel Operacional Unificado`.

## Escopo funcional do MVP

### O que o sistema deve fazer

- ler os dados do banco SQLite local;
- preparar e padronizar os dados meteorológicos;
- organizar a navegação por cidade da Bahia;
- permitir drill-down da cidade para bairros ou regiões internas;
- calcular acumulados de chuva em diferentes janelas;
- calcular deltas e variações de pressão, temperatura, umidade e vento;
- detectar anomalias por estação;
- classificar o risco meteorológico por estação;
- comparar estações com perfis climáticos semelhantes;
- exibir tudo em telas simples e fáceis de demonstrar.

### O que o sistema não precisa fazer no MVP

- prever desastre confirmado com base em ocorrências externas;
- enviar alertas reais por WhatsApp, SMS ou e-mail;
- operar em tempo real com streaming;
- ter autenticação complexa;
- ter app mobile nativo;
- integrar com APIs externas.

### Recorte geográfico do MVP

O produto deve ser apresentado em camadas geográficas:

- visão Bahia;
- visão por cidade;
- visão por bairros ou regiões da cidade selecionada.

Como o banco atual é meteorológico por estação, o MVP pode usar:

- cidade vinculada à estação;
- agrupamento de estações por cidade;
- bairros como regiões monitoradas, zonas de atenção ou recortes internos definidos na interface.

Se não houver mapeamento completo de bairro no dado bruto, a experiência de bairro pode ser tratada no MVP como uma camada de visualização e agrupamento territorial associada à cidade.

## Telas do MVP

### 1. Tela inicial / Dashboard geral

Essa será a tela principal da demo.

**Objetivo**

- mostrar uma visão rápida do cenário geral;
- destacar as estações com maior risco;
- servir como ponto de entrada para as outras análises.

**Elementos**

- título e resumo da plataforma;
- cards com métricas principais;
- mapa ou lista de cidades da Bahia;
- ranking das estações mais críticas;
- gráfico ou tabela com distribuição dos níveis de risco;
- botão ou link para abrir detalhes de uma cidade ou estação.

**Métricas sugeridas**

- total de estações monitoradas;
- quantidade de estações em risco alto ou crítico;
- quantidade de cidades com alerta elevado;
- estação com maior score atual;
- variável mais influente no momento.

### 2. Tela visão por cidade

Tela para entrar em uma cidade específica da Bahia.

**Objetivo**

- transformar a leitura por estação em algo mais compreensível para usuários finais;
- permitir navegação territorial mais intuitiva;
- servir de ponte entre visão macro e visão local.

**Elementos**

- nome da cidade;
- score médio ou dominante da cidade;
- estações relacionadas à cidade;
- indicadores consolidados;
- lista ou mapa das regiões/bairros monitorados;
- acesso ao detalhamento de estação e de bairro.

### 3. Tela de monitoramento por estação

Tela para analisar uma estação específica em profundidade.

**Objetivo**

- explicar o estado atual de uma estação;
- mostrar por que ela recebeu determinado risco;
- facilitar leitura técnica durante a apresentação.

**Elementos**

- nome/código da estação;
- score de risco;
- classificação do risco;
- série recente das variáveis principais;
- acumulados de chuva;
- variações de pressão, temperatura, umidade e vento;
- destaque visual para anomalias detectadas.

### 4. Tela visão por bairro ou região

Tela para aprofundar a análise dentro da cidade selecionada.

**Objetivo**

- mostrar áreas internas mais sensíveis;
- reforçar impacto social e utilidade prática;
- aproximar a plataforma da tomada de decisão local.

**Elementos**

- nome da cidade e do bairro/região;
- score de risco local;
- indicadores resumidos;
- estação ou conjunto de estações de referência;
- visual de tendência e anomalia;
- sinais que explicam o alerta local.

### 5. Tela Radar de Extremos Climáticos

Tela voltada a mostrar comportamento fora do padrão.

**Objetivo**

- identificar quais estações estão entrando em condições incomuns;
- tornar a detecção de anomalia algo visual e fácil de entender.

**Elementos**

- lista/ranking de estações com maior índice de anomalia;
- indicador do tipo de extremo detectado;
- gráficos comparando valor atual vs comportamento histórico;
- filtros por estação ou por nível de risco.

### 6. Tela Classificador de Risco

Tela dedicada ao módulo de classificação.

**Objetivo**

- traduzir os sinais meteorológicos em categorias simples;
- demonstrar a lógica central do produto.

**Elementos**

- score numérico de risco;
- faixa de risco: baixo, médio, alto ou crítico;
- principais fatores que puxaram o score;
- visual simples para mostrar evolução do risco.

### 7. Tela Gêmeo Climático

Tela para comparar uma estação com outras de perfil semelhante.

**Objetivo**

- mostrar inteligência adicional do sistema;
- reforçar inovação e diferenciação do projeto.

**Elementos**

- estação selecionada;
- grupo de estações semelhantes;
- comparação de comportamento médio;
- alerta quando a estação fugir do padrão do grupo.

### 8. Tela Metodologia / Como funciona

Tela simples para ajudar no pitch e na defesa técnica.

**Objetivo**

- explicar para a banca como a plataforma funciona;
- deixar a arquitetura do raciocínio clara sem entrar demais em código.

**Elementos**

- fluxo dos dados;
- resumo do banco utilizado;
- etapas de processamento;
- módulos de IA usados;
- explicação do score de risco.

## Funcionalidades por módulo

### Painel Operacional Unificado

- consolidar visão geral;
- consolidar leitura por Bahia, cidade e bairro/região;
- mostrar ranking de risco;
- permitir navegação entre módulos;
- oferecer visão rápida para tomada de decisão.

### Radar de Extremos Climáticos

- detectar padrões atípicos;
- mostrar anomalias por estação;
- destacar mudanças bruscas nas variáveis.

### Classificador de Risco Meteorológico

- transformar variáveis meteorológicas em score;
- classificar severidade operacional;
- exibir os principais fatores de decisão.

### Gêmeo Climático das Estações

- agrupar estações semelhantes;
- comparar comportamento atual com grupo de referência;
- detectar desvios relevantes.

## Jornada de uso da demo

Durante a apresentação, a navegação ideal pode ser:

1. abrir o dashboard geral;
2. mostrar as cidades mais críticas;
3. entrar em uma cidade específica;
4. abrir uma região ou bairro;
5. entrar em uma estação específica;
6. explicar o score e os fatores de risco;
7. abrir o radar de extremos;
8. abrir o gêmeo climático;
9. encerrar com a visão de impacto e escalabilidade.

## Dados e indicadores do MVP

### Entradas principais

- estação;
- data;
- hora;
- precipitação;
- pressão atmosférica;
- radiação global;
- temperatura;
- umidade relativa;
- vento.

### Features derivadas

- acumulado de chuva em 6h;
- acumulado de chuva em 12h;
- acumulado de chuva em 24h;
- acumulado de chuva em 48h;
- acumulado de chuva em 72h;
- delta de pressão;
- delta de temperatura;
- delta de umidade;
- delta de vento;
- médias móveis;
- desvio em relação ao histórico da própria estação.

### Saídas do sistema

- score de risco de `0 a 100`;
- nível de risco;
- índice de anomalia;
- grupo climático semelhante;
- visão agregada por cidade;
- visão local por bairro ou região;
- explicação resumida do alerta.

## Regras de negócio do MVP

- cada estação deve poder ser analisada individualmente;
- cada cidade deve poder ser analisada como agrupamento de estações;
- cada cidade deve permitir visão interna por bairros ou regiões;
- o score deve ser interpretável;
- o sistema deve priorizar clareza visual;
- a análise deve usar apenas dados do banco local;
- o MVP deve ser demonstrável mesmo sem internet.

## Escopo técnico mínimo viável

Para o MVP ficar de pé, precisamos entregar:

- ingestão dos dados do SQLite;
- limpeza e tipagem;
- criação de features;
- lógica de score/anomalia/classificação;
- API ou camada de serviço local;
- interface web para visualização.

## Escopo ideal se sobrar tempo

- filtros mais refinados por período e estação;
- mapa mais completo por cidade e bairro;
- gráficos mais bonitos e interativos;
- explicabilidade visual mais rica;
- simulação de alerta;
- exportação simples de relatório.

## Priorização de entrega

### Prioridade 1

- dashboard geral;
- visão por cidade;
- cálculo de features;
- score de risco;
- ranking por estação.

### Prioridade 2

- visão por bairro ou região;
- detalhe por estação;
- radar de extremos;
- classificação por faixas.

### Prioridade 3

- gêmeo climático;
- tela de metodologia;
- refinamentos visuais.

## Critério de sucesso do MVP

O MVP estará bom para o hackathon se conseguirmos demonstrar que:

- usamos IA de forma central;
- usamos dados reais da Bahia;
- o sistema gera leitura clara de risco;
- a interface ajuda a transformar dado em ação;
- o projeto parece produto e não apenas notebook solto.

## Frase-resumo do escopo

O GuardiãoIA Meteorológico será um painel inteligente de monitoramento climático que usa o banco local para detectar extremos, classificar risco e comparar estações da Bahia em uma interface única e demonstrável.
