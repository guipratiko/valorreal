const placasService = require('../services/placasService');
const precoService = require('../services/precoService');

class PlacasController {
  /**
   * Consulta informações de um veículo pela placa
   */
  async consultarPlaca(req, res) {
    try {
      const { placa } = req.params;

      if (!placa) {
        return res.status(400).json({
          success: false,
          error: 'Placa é obrigatória'
        });
      }

      const resultado = await placasService.consultarPlaca(placa);

      // Se resultado tem success: false, retorna erro
      if (resultado && resultado.success === false) {
        const statusCode = resultado.statusCode || 404;
        return res.status(statusCode).json({
          success: false,
          error: resultado.error || 'Placa não encontrada',
          message: resultado.message || 'A placa informada não existe ou não foi encontrada na base de dados'
        });
      }

      // Se resultado já tem success: true, busca preços e adiciona ao resultado
      if (resultado && resultado.success && resultado.data) {
        try {
          // Verifica se tem dados mínimos para buscar preços
          const temDadosMinimos = (resultado.data.MARCA || resultado.data.marca) && 
                                  (resultado.data.MODELO || resultado.data.modelo) && 
                                  (resultado.data.ano || resultado.data.anoModelo);
          
          if (temDadosMinimos) {
            console.log(`🔍 Buscando preços para placa ${req.params.placa}...`);
            // Busca preços médios no OLX e Webmotors
            const precosMedio = await precoService.buscarPrecosMedio(resultado.data);
            
            // Adiciona informações de preços ao resultado
            resultado.data.precosMedio = precosMedio;
            
            if (precosMedio.success) {
              console.log(`✅ Preços encontrados para placa ${req.params.placa}: ${precosMedio.fonte || 'N/A'}`);
            } else {
              console.log(`⚠️  Nenhum preço encontrado para placa ${req.params.placa}: ${precosMedio.message || 'N/A'}`);
            }
          } else {
            console.log(`⚠️  Dados insuficientes para buscar preços da placa ${req.params.placa}`);
            resultado.data.precosMedio = {
              success: false,
              message: 'Dados insuficientes para buscar preços (faltam marca, modelo ou ano)',
              precos: {
                olx: [],
                webmotors: [],
                fipe: [],
                todos: []
              },
              estatisticas: null
            };
          }
        } catch (error) {
          console.error(`❌ Erro ao buscar preços médio para placa ${req.params.placa}:`, error);
          // Continua mesmo se a busca de preços falhar
          resultado.data.precosMedio = {
            success: false,
            message: 'Erro ao buscar preços médio',
            error: error.message,
            precos: {
              olx: [],
              webmotors: [],
              fipe: [],
              todos: []
            },
            estatisticas: null
          };
        }

        return res.status(200).json(resultado);
      }

      // Caso não tenha success definido, trata como erro
      const statusCode = resultado?.statusCode === 402 ? 401 : 
                        resultado?.statusCode === 401 ? 404 :
                        resultado?.statusCode === 429 ? 429 :
                        resultado?.statusCode === 406 ? 404 : 
                        resultado?.statusCode || 400;

      return res.status(statusCode).json({
        success: false,
        error: resultado?.error || 'Erro ao consultar placa',
        message: resultado?.message || 'Não foi possível consultar a placa'
      });

    } catch (error) {
      console.error('Erro ao consultar placa:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  /**
   * Busca preços médios de um veículo
   */
  async buscarPrecos(req, res) {
    try {
      const { marca, modelo, ano } = req.query;

      if (!marca || !modelo || !ano) {
        return res.status(400).json({
          success: false,
          error: 'Parâmetros obrigatórios: marca, modelo e ano'
        });
      }

      const dadosVeiculo = { marca, modelo, ano };
      const precoService = require('../services/precoService');
      const resultado = await precoService.buscarPrecosMedio(dadosVeiculo);

      if (resultado.success) {
        return res.status(200).json({
          success: true,
          ...resultado
        });
      }

      return res.status(200).json({
        success: false,
        ...resultado
      });

    } catch (error) {
      console.error('Erro ao buscar preços:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  /**
   * Consulta o saldo disponível de consultas
   */
  async consultarSaldo(req, res) {
    try {
      const resultado = await placasService.consultarSaldo();

      // Se resultado já tem success, retorna diretamente (resposta da API)
      if (resultado && resultado.success) {
        return res.status(200).json(resultado);
      }

      return res.status(resultado.statusCode || 500).json({
        success: false,
        error: resultado.error,
        message: resultado.message
      });

    } catch (error) {
      console.error('Erro ao consultar saldo:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
}

module.exports = new PlacasController();

