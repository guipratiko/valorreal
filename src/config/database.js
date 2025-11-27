const mongoose = require('mongoose');

let isConnected = false;
let connectionAttempted = false;

const connectDB = async () => {
  if (isConnected) {
    return true;
  }

  if (connectionAttempted) {
    return false;
  }

  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.warn('⚠️  MONGODB_URI não configurado no .env');
      console.log('Variáveis de ambiente disponíveis:', Object.keys(process.env).filter(k => k.includes('MONGO')));
      return false;
    }

    // Log da URL (sem mostrar a senha completa por segurança)
    const uriForLog = mongoURI.replace(/:[^:@]+@/, ':****@');
    console.log(`🔌 Tentando conectar ao MongoDB: ${uriForLog}`);

    connectionAttempted = true;
    
    // Configurações de conexão com timeout maior
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 segundos
      socketTimeoutMS: 45000, // 45 segundos
      connectTimeoutMS: 10000, // 10 segundos
      bufferMaxEntries: 0, // Desabilita buffering para evitar timeouts
      bufferCommands: false, // Desabilita buffering de comandos
    });

    // Event listeners para monitorar a conexão
    mongoose.connection.on('error', (err) => {
      console.error('❌ Erro na conexão MongoDB:', err.message);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB desconectado');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconectado');
      isConnected = true;
    });

    isConnected = true;
    console.log('✅ MongoDB conectado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar MongoDB:', error.message);
    isConnected = false;
    connectionAttempted = false;
    // Não lança erro para não quebrar a aplicação se MongoDB estiver offline
    return false;
  }
};

const disconnectDB = async () => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('MongoDB desconectado');
  }
};

module.exports = { connectDB, disconnectDB };

