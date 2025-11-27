require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, disconnectDB } = require('./src/config/database');
const placasRoutes = require('./src/routes/placasRoutes');

const app = express();
const PORT = process.env.PORT || 3923;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API de consulta de placas está funcionando',
    timestamp: new Date().toISOString()
  });
});

// Rotas da API
app.use('/api/placas', placasRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'API de Consulta de Placas',
    version: '1.0.0',
    endpoints: {
      consultarPlaca: 'GET /api/placas/:placa',
      buscarPrecos: 'GET /api/placas/precos/buscar?marca=XXX&modelo=XXX&ano=XXXX',
      consultarSaldo: 'GET /api/placas/saldo/consultar',
      health: 'GET /health'
    }
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    message: err.message
  });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada'
  });
});

// Variável para armazenar a instância do servidor
let server;

// Tratamento de sinais para encerramento gracioso
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} recebido. Encerrando servidor graciosamente...`);
  
  if (server) {
    await new Promise((resolve) => {
      server.close(() => {
        console.log('Servidor HTTP encerrado');
        resolve();
      });
    });
  }
  
  await disconnectDB();
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada não tratada:', reason);
});

// Conecta ao MongoDB antes de iniciar o servidor
connectDB().then((connected) => {
  if (!connected) {
    console.warn('⚠️  MongoDB não conectado. A API funcionará sem cache.');
  }
}).catch(console.error);

// Inicia o servidor
server = app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 API disponível em http://localhost:${PORT}`);
  console.log(`🔍 Exemplo: http://localhost:${PORT}/api/placas/ABC1234`);
  
  // Verifica se o token está configurado
  if (!process.env.APIPLACAS_TOKEN) {
    console.warn('⚠️  AVISO: APIPLACAS_TOKEN não configurado no .env');
  }
  
  // Verifica se MongoDB está configurado
  if (!process.env.MONGODB_URI) {
    console.warn('⚠️  AVISO: MONGODB_URI não configurado no .env');
  }
});

module.exports = app;
