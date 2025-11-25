# 🚗 Valor Real Car - App iOS

App iOS para consulta de placas de veículos e valor médio de venda, integrado com o sistema de API.

## 📋 Funcionalidades

✅ Consulta de veículos por placa  
✅ Informações completas do veículo  
✅ Valor médio de venda (baseado em FIPE)  
✅ Estatísticas de preços (média, mediana, mínimo, máximo)  
✅ Interface moderna com SwiftUI  
✅ Tela de splash animada  

## 🚀 Como Usar no Xcode

### 1. Criar Projeto no Xcode

1. Abra o **Xcode**
2. **File > New > Project**
3. Escolha **iOS > App**
4. Configure:
   - **Product Name:** `ValorRealCar`
   - **Interface:** `SwiftUI` ⚠️ **IMPORTANTE**
   - **Language:** `Swift`
5. Salve na pasta `APP/`
6. Clique em **Create**

### 2. Adicionar Arquivos

1. **Delete** os arquivos padrão criados (`ValorRealCarApp.swift`, `ContentView.swift`)
2. **Botão direito** na pasta do projeto → **"Add Files to ValorRealCar..."**
3. Selecione a pasta `ValorRealCar/ValorRealCar/` (com todos os arquivos)
4. Marque:
   - ✅ **Copy items if needed**
   - ✅ **Create groups**
   - ✅ **Add to targets: ValorRealCar**
5. Clique em **Add**

### 3. Configurar URL da API

1. Abra `Services/PlacaService.swift`
2. A URL já está configurada para `localhost:3923`
3. **Para dispositivo físico:** Altere para o IP da sua máquina:
   ```swift
   private let baseURL = "http://192.168.1.XXX:3923/api/placas"
   ```

### 4. Iniciar a API

No terminal:
```bash
cd /Users/guilhermeaugustosantos/Documents/Cursor/valorreal
npm start
```

### 5. Executar o App

1. Selecione um simulador (ex: iPhone 15)
2. Pressione **⌘ + R**

## 📁 Estrutura

```
APP/
└── ValorRealCar/
    └── ValorRealCar/
        ├── App.swift
        ├── Models/
        │   └── PlacaResponse.swift
        ├── Services/
        │   └── PlacaService.swift (conecta com API)
        ├── Views/
        │   ├── ContentView.swift
        │   ├── ConsultaView.swift
        │   ├── ResultadoView.swift
        │   └── SplashView.swift
        └── Resources/
            └── Info.plist
```

## 🔌 Integração com API

O app consome a API que está em:
- **URL:** `http://localhost:3923/api/placas/:placa`
- **Endpoint:** `GET /api/placas/:placa`

A API retorna:
- Informações do veículo
- Valor médio de venda (FIPE)
- Estatísticas de preços

## ⚠️ Importante

- A API deve estar rodando antes de usar o app
- Para simulador: `localhost` funciona
- Para dispositivo físico: use o IP local da rede

## 🎯 Testando

1. Digite uma placa (ex: `NWG9990`)
2. Clique no botão de busca
3. Veja as informações e o valor médio!

