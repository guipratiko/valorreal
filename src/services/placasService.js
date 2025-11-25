const axios = require('axios');

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

      const url = `${this.baseUrl}/consulta/${placaFormatada}/${this.token}`;
      
      const response = await axios.get(url);
      
      // Verifica códigos de status da API
      // A API retorna os dados diretamente quando encontra, ou {success: false} quando não encontra
      if (response.status === 200 && response.data) {
        // Se a API retornou success: false, retorna erro
        if (response.data.success === false) {
          return {
            success: false,
            error: 'Placa não encontrada ou inválida',
            message: response.data.message || 'A placa informada não existe ou não foi encontrada na base de dados',
            statusCode: 404
          };
        }
        
        // Verifica se a placa não foi encontrada (status 404 ou message indicando erro)
        if (response.data.status === 404 || 
            (response.data.message && response.data.message.includes('Nenhum veículo')) ||
            (!response.data.marca && !response.data.MARCA && response.data.status)) {
          return {
            success: false,
            error: 'Placa não encontrada ou inválida',
            message: response.data.message || 'A placa informada não existe ou não foi encontrada na base de dados',
            statusCode: 404
          };
        }
        
        // Se tem dados do veículo (marca ou MARCA), retorna como sucesso
        if (response.data.marca || response.data.MARCA) {
          return {
            success: true,
            data: response.data
          };
        }
        
        // Caso contrário, trata como erro
        return {
          success: false,
          error: 'Placa não encontrada ou inválida',
          message: response.data.message || 'A placa informada não existe ou não foi encontrada na base de dados',
          statusCode: 404
        };
      }

      return {
        success: false,
        error: this.getErrorMessage(response.status),
        statusCode: response.status
      };

    } catch (error) {
      if (error.response) {
        // Erro retornado pela API
        const statusCode = error.response.status;
        const responseData = error.response.data;
        
        // Verifica se a resposta já tem success: false
        if (responseData && responseData.success === false) {
          return {
            success: false,
            error: 'Placa não encontrada ou inválida',
            message: responseData.message || 'A placa informada não existe ou não foi encontrada na base de dados',
            statusCode: statusCode === 401 ? 404 : statusCode
          };
        }
        
        return {
          success: false,
          error: this.getErrorMessage(statusCode),
          statusCode: statusCode,
          message: responseData?.message || error.message
        };
      }

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
      
      const response = await axios.get(url);
      
      // A API já retorna no formato {success: true, data: {...}}
      if (response.status === 200 && response.data) {
        return response.data;
      }

      return {
        success: false,
        error: 'Erro ao consultar saldo',
        statusCode: response.status
      };

    } catch (error) {
      if (error.response) {
        return {
          success: false,
          error: 'Erro ao consultar saldo',
          statusCode: error.response.status,
          message: error.response.data?.message || error.message
        };
      }

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

