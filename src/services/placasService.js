// Usando node-fetch@2 para evitar problemas com undici do Node.js 18
const fetch = require('node-fetch');
const PlacaCache = require('../models/PlacaCache');

class PlacasService {
  constructor() {
    this.baseUrl = 'https://wdapi2.com.br';
    this.token = process.env.APIPLACAS_TOKEN || '';
  }

  /**
   * Consulta informações de um veículo pela placa
   * @param {string} placa - Placa no formato AAA0X00 ou AAA9999
   * @returns {Promise<Object>} Dados do veículo
   */
  async consultarPlaca(placa) {
    try {
      // Remove espaços e converte para maiúsculo
      const placaFormatada = placa.replace(/\s/g, '').toUpperCase();

      // Valida formato da placa
      if (!this.validarFormatoPlaca(placaFormatada)) {
        throw new Error('Formato de placa inválido. Use o formato AAA0X00 ou AAA9999');
      }

      // Verifica se existe no cache
      try {
        const cache = await PlacaCache.findOne({ placa: placaFormatada });
        if (cache && cache.dados) {
          console.log(`✅ Placa ${placaFormatada} encontrada no cache`);
          return {
            success: true,
            data: cache.dados,
            cached: true
          };
        }
      } catch (cacheError) {
        // Se MongoDB não estiver disponível, continua normalmente
        console.log('Cache não disponível, consultando API...');
      }

      // Se não encontrou no cache, consulta a API
      const url = `${this.baseUrl}/consulta/${placaFormatada}/${this.token}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      // Verifica códigos de status da API
      // A API retorna os dados diretamente quando encontra, ou {success: false} quando não encontra
      if (response.status === 200 && data) {
        // Se a API retornou success: false, retorna erro
        if (data.success === false) {
          return {
            success: false,
            error: 'Placa não encontrada ou inválida',
            message: data.message || 'A placa informada não existe ou não foi encontrada na base de dados',
            statusCode: 404
          };
        }
        
        // Verifica se a placa não foi encontrada (status 404 ou message indicando erro)
        if (data.status === 404 || 
            (data.message && data.message.includes('Nenhum veículo')) ||
            (!data.marca && !data.MARCA && data.status)) {
          return {
            success: false,
            error: 'Placa não encontrada ou inválida',
            message: data.message || 'A placa informada não existe ou não foi encontrada na base de dados',
            statusCode: 404
          };
        }
        
        // Se tem dados do veículo (marca ou MARCA), retorna como sucesso
        if (data.marca || data.MARCA) {
          // Salva no cache para próximas consultas (válido por 30 dias)
          try {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30); // Adiciona 30 dias
            
            await PlacaCache.findOneAndUpdate(
              { placa: placaFormatada },
              { 
                placa: placaFormatada,
                dados: data,
                expiresAt: expiresAt
              },
              { upsert: true, new: true }
            );
            console.log(`💾 Placa ${placaFormatada} salva no cache (expira em 30 dias)`);
          } catch (cacheError) {
            // Se falhar ao salvar no cache, continua normalmente
            console.log('Erro ao salvar no cache:', cacheError.message);
          }

          return {
            success: true,
            data: data,
            cached: false
          };
        }
        
        // Caso contrário, trata como erro
        return {
          success: false,
          error: 'Placa não encontrada ou inválida',
          message: data.message || 'A placa informada não existe ou não foi encontrada na base de dados',
          statusCode: 404
        };
      }

      return {
        success: false,
        error: this.getErrorMessage(response.status),
        statusCode: response.status
      };

    } catch (error) {
      // Erro de conexão ou outro erro
      return {
        success: false,
        error: 'Erro ao consultar placa',
        message: error.message
      };
    }
  }

  /**
   * Consulta o saldo disponível de consultas
   * @returns {Promise<Object>} Informações de saldo
   */
  async consultarSaldo() {
    try {
      const url = `${this.baseUrl}/saldo/${this.token}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      // A API já retorna no formato {success: true, data: {...}}
      if (response.status === 200 && data) {
        return data;
      }

      return {
        success: false,
        error: 'Erro ao consultar saldo',
        statusCode: response.status
      };

    } catch (error) {
      return {
        success: false,
        error: 'Erro ao consultar saldo',
        message: error.message
      };
    }
  }

  /**
   * Valida o formato da placa
   * @param {string} placa - Placa a ser validada
   * @returns {boolean}
   */
  validarFormatoPlaca(placa) {
    // Formato antigo: AAA9999 (3 letras + 4 números)
    // Formato Mercosul: AAA0X00 (3 letras + 1 número + 1 letra + 2 números)
    const formatoAntigo = /^[A-Z]{3}[0-9]{4}$/;
    const formatoMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
    
    return formatoAntigo.test(placa) || formatoMercosul.test(placa);
  }

  /**
   * Retorna mensagem de erro baseada no código de status
   * @param {number} statusCode - Código de status HTTP
   * @returns {string}
   */
  getErrorMessage(statusCode) {
    const messages = {
      400: 'URL incorreta',
      401: 'Placa inválida',
      402: 'Token inválido',
      406: 'Sem resultados',
      429: 'Limite de consultas atingido'
    };

    return messages[statusCode] || 'Erro desconhecido';
  }
}

module.exports = new PlacasService();
