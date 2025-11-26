const mongoose = require('mongoose');

const placaCacheSchema = new mongoose.Schema({
  placa: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    index: true
  },
  dados: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias a partir de agora
    required: true
  }
}, {
  timestamps: true
});

// Índice TTL para remover automaticamente após 30 dias
placaCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('PlacaCache', placaCacheSchema);

