# API de Consulta de Placas

API Node.js para consulta de informações de veículos através da API Placas (apiplacas.com.br).

## 🚀 Funcionalidades

- Consulta de informações de veículos por placa
- **Busca automática de preços médios no OLX e Webmotors**
- Cálculo de estatísticas de preços (média, mediana, mínimo, máximo)
- Verificação de saldo disponível de consultas
- Validação de formato de placa (antigo e Mercosul)
- Tratamento de erros completo
- Documentação de endpoints

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn
- Token da API Placas (obtido em https://apiplacas.com.br)

## 🔧 Instalação

1. Clone o repositório ou navegue até a pasta do projeto

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Edite o arquivo `.env` e adicione seu token:
```
APIPLACAS_TOKEN=seu_token_aqui
PORT=3923
```

## 🏃 Como executar

### Modo desenvolvimento (com nodemon):
```bash
npm run dev
```

### Modo produção:
```bash
npm start
```

O servidor estará disponível em `http://localhost:3923`

## 📡 Endpoints

### 1. Consultar Placa
Consulta informações de um veículo pela placa.

**GET** `/api/placas/:placa`

**Parâmetros:**
- `placa` (path parameter): Placa do veículo no formato AAA0X00 ou AAA9999

**Exemplo de requisição:**
```bash
GET http://localhost:3923/api/placas/ABC1234
```

**Exemplo de resposta (sucesso):**
```json
{
  "success": true,
  "data": {
    "MARCA": "VW",
    "MODELO": "SANTANA CG",
    "SUBMODELO": "SANTANA",
    "VERSAO": "CG",
    "ano": "1986",
    "anoModelo": "1986",
    "chassi": "*****46344",
    "codigoSituacao": "0",
    "cor": "VERMELHA",
    "data": "24/11/2025 14:43:13",
    "marca": "VW",
    "modelo": "SANTANA CG",
    "marcaModelo": "VW/SANTANA CG",
    "municipio": "Lobato",
    "origem": "NACIONAL",
    "placa": "ABC1234",
    "placa_alternativa": "ABC1C34",
    "situacao": "Roubo/Furto",
    "uf": "PR",
    "logo": "https://apiplacas.com.br/logos/logosMarcas/vw.png",
    "mensagemRetorno": "Sem erros.",
    "extra": {
      "ano_fabricacao": "1986",
      "combustivel": "Alcool",
      "modelo": "SANTANA CG",
      "placa": "ABC1234",
      "situacao_veiculo": "S",
      "segmento": "Auto",
      "sub_segmento": "AU - SEDAN MEDIO",
      ...
    },
    "fipe": {
      "dados": [
        {
          "ano_modelo": "1986",
          "codigo_fipe": "005062-8",
          "texto_marca": "VW - VolksWagen",
          "texto_modelo": "Santana CLi /CL /C 1.8/2.0 /SU 2.0 2p/4p",
          "texto_valor": "R$ 3.891,00",
          ...
        }
      ]
    },
    "precosMedio": {
      "success": true,
      "precos": {
        "olx": [15000, 18000, 20000],
        "webmotors": [16000, 19000, 21000],
        "todos": [15000, 16000, 18000, 19000, 20000, 21000]
      },
      "estatisticas": {
        "quantidade": 6,
        "media": 18166.67,
        "mediana": 18500,
        "minimo": 15000,
        "maximo": 21000,
        "desvioPadrao": 2081.67
      }
    }
  }
}
```

**Exemplo de resposta (erro):**
```json
{
  "success": false,
  "error": "Placa inválida",
  "message": "..."
}
```

### 2. Buscar Preços Médios
Busca preços médios de um veículo no OLX e Webmotors e calcula estatísticas.

**GET** `/api/placas/precos/buscar`

**Parâmetros (query):**
- `marca` (obrigatório): Marca do veículo (ex: VW, FORD)
- `modelo` (obrigatório): Modelo do veículo (ex: SANTANA CG, KA)
- `ano` (obrigatório): Ano do veículo (ex: 1986)

**Exemplo de requisição:**
```bash
GET http://localhost:3923/api/placas/precos/buscar?marca=VW&modelo=SANTANA%20CG&ano=1986
```

**Exemplo de resposta (sucesso):**
```json
{
  "success": true,
  "precos": {
    "olx": [15000, 18000, 20000],
    "webmotors": [16000, 19000, 21000],
    "todos": [15000, 16000, 18000, 19000, 20000, 21000]
  },
  "estatisticas": {
    "quantidade": 6,
    "media": 18166.67,
    "mediana": 18500,
    "minimo": 15000,
    "maximo": 21000,
    "desvioPadrao": 2081.67
  }
}
```

**Exemplo de resposta (sem resultados):**
```json
{
  "success": false,
  "message": "Nenhum preço encontrado",
  "precos": {
    "olx": [],
    "webmotors": [],
    "todos": []
  },
  "estatisticas": null
}
```

### 3. Consultar Saldo
Verifica o saldo disponível de consultas.

**GET** `/api/placas/saldo/consultar`

**Exemplo de requisição:**
```bash
GET http://localhost:3923/api/placas/saldo/consultar
```

**Exemplo de resposta:**
```json
{
  "success": true,
  "data": {
    "saldo": 100,
    "limite": 1000
  }
}
```

### 4. Health Check
Verifica se a API está funcionando.

**GET** `/health`

**Exemplo de resposta:**
```json
{
  "status": "OK",
  "message": "API de consulta de placas está funcionando",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🔒 Códigos de Status

A API retorna os seguintes códigos de status:

- **200**: Consulta realizada com sucesso
- **400**: URL incorreta ou placa inválida
- **401**: Token inválido
- **404**: Sem resultados encontrados
- **429**: Limite de consultas atingido
- **500**: Erro interno do servidor

## 📝 Formatos de Placa Suportados

- **Formato Antigo**: AAA9999 (3 letras + 4 números)
  - Exemplo: ABC1234

- **Formato Mercosul**: AAA0X00 (3 letras + 1 número + 1 letra + 2 números)
  - Exemplo: ABC1D23

## 🛠️ Estrutura do Projeto

```
valorreal/
├── src/
│   ├── controllers/
│   │   └── placasController.js
│   ├── routes/
│   │   └── placasRoutes.js
│   └── services/
│       └── placasService.js
├── .env
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## 📚 Tecnologias Utilizadas

- **Express.js**: Framework web para Node.js
- **Axios**: Cliente HTTP para fazer requisições
- **Cheerio**: Biblioteca para parsing HTML (web scraping)
- **dotenv**: Gerenciamento de variáveis de ambiente
- **CORS**: Middleware para habilitar CORS

## ⚠️ Observações

- O campo "extra" pode não estar disponível em todas as consultas
- Os valores da Tabela FIPE podem não ser retornados em algumas situações
- É necessário ter créditos disponíveis na sua conta da API Placas
- **Busca de Preços**: A busca de preços utiliza web scraping nos sites OLX e Webmotors. Os resultados podem variar dependendo da disponibilidade de anúncios e podem ser afetados por mudanças na estrutura dos sites
- A busca de preços é executada automaticamente ao consultar uma placa, mas pode ser feita separadamente usando o endpoint `/api/placas/precos/buscar`
- Os preços são filtrados para remover outliers (valores muito diferentes da média) antes do cálculo das estatísticas

## 📄 Licença

ISC

# valorreal
# valorreal
