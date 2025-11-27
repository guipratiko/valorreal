// Usando node-fetch@2 para evitar problemas com undici do Node.js 18
const fetch = require('node-fetch');
const cheerio = require('cheerio');

class PrecoService {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    this.seletoresOLX = [
      '[data-ds-component="DS-AdCard-Text"]',
      '[class*="price"]',
      '[class*="preco"]',
      '[class*="Price"]',
      '[class*="Preco"]',
      '.olx-text',
      '[data-testid*="price"]',
      '[data-testid*="preco"]'
    ];
    this.seletoresWebmotors = [
      '[class*="Price"]',
      '[class*="price"]',
      '[class*="Preco"]',
      '[class*="preco"]',
      '[data-testid*="price"]',
      '[data-testid*="preco"]',
      '.price',
      '.preco',
      '[itemprop="price"]'
    ];
  }

  /**
   * Busca preços no OLX
   * @param {Object} dadosVeiculo - Dados do veículo (marca, modelo, ano)
   * @returns {Promise<Array>} Array de preços encontrados
   */
  async buscarPrecosOLX(dadosVeiculo) {
    try {
      const precos = [];
      const precosEncontrados = new Set(); // Evita duplicatas
      const { marca, modelo, ano, termosBusca } = this.prepararDadosBusca(dadosVeiculo);
      const urlsPrioritarias = this.gerarURLsOLX(marca, modelo, ano);

      for (const url of urlsPrioritarias) {
        if (!url || precos.length >= 20) break;
        await this.coletarPrecosDeURL({
          url,
          site: 'OLX',
          seletores: this.seletoresOLX,
          seletorLinks: 'a[href*="/autos-e-pecas/carros-vans-e-utilitarios"]'
        }, precos, precosEncontrados);

        if (precos.length >= 5) {
          break;
        }
      }

      // Fallback para busca textual se o slug não encontrou resultados
      if (precos.length < 5 && termosBusca.length > 0) {
        const consultas = this.gerarConsultasTexto(termosBusca, ano);
        for (const consulta of consultas) {
          if (precos.length >= 15) break; // evita muitas requisições
          const urlBusca = `https://www.olx.com.br/brasil?q=${encodeURIComponent(consulta)}`;
          await this.coletarPrecosDeURL({
            url: urlBusca,
            site: 'OLX/busca',
            seletores: this.seletoresOLX,
            seletorLinks: 'a[href*="/autos-e-pecas/carros-vans-e-utilitarios"]'
          }, precos, precosEncontrados);

          if (precos.length >= 5) {
            break;
          }
        }
      }

      return precos.slice(0, 20); // Limita a 20 resultados

    } catch (error) {
      console.error('Erro ao buscar preços no OLX:', error.message);
      return [];
    }
  }

  /**
   * Busca preços no Webmotors
   * @param {Object} dadosVeiculo - Dados do veículo (marca, modelo, ano)
   * @returns {Promise<Array>} Array de preços encontrados
   */
  async buscarPrecosWebmotors(dadosVeiculo) {
    try {
      const precos = [];
      const precosEncontrados = new Set(); // Evita duplicatas
      const { marca, modelo, ano, termosBusca } = this.prepararDadosBusca(dadosVeiculo);
      const urlsPrioritarias = this.gerarURLsWebmotors(marca, modelo, ano);

      for (const url of urlsPrioritarias) {
        if (!url || precos.length >= 20) break;
        await this.coletarPrecosDeURL({
          url,
          site: 'Webmotors',
          seletores: this.seletoresWebmotors,
          seletorLinks: '[class*="card"]'
        }, precos, precosEncontrados);

        if (precos.length >= 5) {
          break;
        }
      }

      // Fallback para busca textual no Webmotors (oq = query)
      if (precos.length < 5 && termosBusca.length > 0) {
        const consultas = this.gerarConsultasTexto(termosBusca, ano);
        for (const consulta of consultas) {
          if (precos.length >= 15) break;
          const urlBusca = `https://www.webmotors.com.br/carros?oq=${encodeURIComponent(consulta)}`;
          await this.coletarPrecosDeURL({
            url: urlBusca,
            site: 'Webmotors/busca',
            seletores: this.seletoresWebmotors,
            seletorLinks: '[class*="card"]'
          }, precos, precosEncontrados);

          if (precos.length >= 5) {
            break;
          }
        }
      }

      return precos.slice(0, 20); // Limita a 20 resultados

    } catch (error) {
      console.error('Erro ao buscar preços no Webmotors:', error.message);
      return [];
    }
  }

  /**
   * Busca preços em ambos os sites e calcula a média
   * @param {Object} dadosVeiculo - Dados do veículo
   * @returns {Promise<Object>} Objeto com preços e estatísticas
   */
  async buscarPrecosMedio(dadosVeiculo) {
    try {
      // Busca em paralelo nos dois sites
      const [precosOLX, precosWebmotors] = await Promise.all([
        this.buscarPrecosOLX(dadosVeiculo),
        this.buscarPrecosWebmotors(dadosVeiculo)
      ]);

      const todosPrecos = [...precosOLX, ...precosWebmotors];

      // Se não encontrou preços, tenta usar dados da FIPE
      if (todosPrecos.length === 0) {
        const precosFIPE = this.extrairPrecosFIPE(dadosVeiculo);
        
        if (precosFIPE.length > 0) {
          const estatisticas = this.calcularEstatisticas(precosFIPE);
          return {
            success: true,
            fonte: 'FIPE',
            precos: {
              olx: [],
              webmotors: [],
              fipe: precosFIPE,
              todos: precosFIPE
            },
            estatisticas: estatisticas
          };
        }
        
        return {
          success: false,
          message: 'Nenhum preço encontrado',
          precos: {
            olx: [],
            webmotors: [],
            todos: []
          },
          estatisticas: null
        };
      }

      // Remove outliers (valores muito diferentes da média)
      const precosFiltrados = this.removerOutliers(todosPrecos);

      const estatisticas = this.calcularEstatisticas(precosFiltrados);

      // Adiciona também os valores da FIPE se disponíveis
      const precosFIPE = this.extrairPrecosFIPE(dadosVeiculo);
      const todosPrecosComFIPE = [...precosFiltrados, ...precosFIPE];
      
      return {
        success: true,
        fonte: 'OLX/Webmotors',
        precos: {
          olx: precosOLX,
          webmotors: precosWebmotors,
          fipe: precosFIPE,
          todos: todosPrecosComFIPE.length > precosFiltrados.length ? todosPrecosComFIPE : precosFiltrados
        },
        estatisticas: todosPrecosComFIPE.length > precosFiltrados.length 
          ? this.calcularEstatisticas(todosPrecosComFIPE)
          : estatisticas
      };

    } catch (error) {
      console.error('Erro ao buscar preços médio:', error.message);
      return {
        success: false,
        message: 'Erro ao buscar preços',
        error: error.message
      };
    }
  }

  /**
   * Extrai preços da FIPE dos dados do veículo
   * @param {Object} dadosVeiculo - Dados do veículo
   * @returns {Array<number>} Array de preços da FIPE
   */
  extrairPrecosFIPE(dadosVeiculo) {
    const precos = [];
    
    try {
      if (dadosVeiculo.fipe && dadosVeiculo.fipe.dados && Array.isArray(dadosVeiculo.fipe.dados)) {
        dadosVeiculo.fipe.dados.forEach(item => {
          if (item.texto_valor) {
            // Extrai o preço do formato "R$ 159.713,00"
            const preco = this.extrairPreco(item.texto_valor);
            if (preco > 0) {
              precos.push(preco);
            }
          }
        });
      }
    } catch (error) {
      console.error('Erro ao extrair preços FIPE:', error);
    }
    
    return precos;
  }

  /**
   * Prepara e normaliza dados para as consultas
   */
  prepararDadosBusca(dadosVeiculo) {
    const marca = (dadosVeiculo.MARCA || dadosVeiculo.marca || '').trim();
    const modeloPrincipal = (dadosVeiculo.MODELO || dadosVeiculo.modelo || '').trim();
    const ano = (dadosVeiculo.ano || dadosVeiculo.anoModelo || dadosVeiculo.extra?.ano_modelo || '')
      .toString()
      .trim();

    const termosExtras = [
      `${marca} ${modeloPrincipal}`.trim(),
      dadosVeiculo.SUBMODELO,
      dadosVeiculo.submodelo,
      dadosVeiculo.versao,
      dadosVeiculo.VERSAO,
      dadosVeiculo.extra?.modelo,
      dadosVeiculo.extra?.grupo,
      dadosVeiculo.extra?.linha
    ];

    const termosBusca = Array.from(new Set(
      termosExtras
        .map((termo) => this.normalizarTermo(termo))
        .filter(Boolean)
    ));

    return {
      marca,
      modelo: modeloPrincipal || termosExtras.find(Boolean) || '',
      ano,
      termosBusca
    };
  }

  normalizarTermo(termo = '') {
    if (!termo) return '';
    return termo
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  slugify(texto = '') {
    const normalizado = this.normalizarTermo(texto);
    return normalizado ? normalizado.toLowerCase().replace(/\s+/g, '-') : '';
  }

  gerarConsultasTexto(termosBusca, ano) {
    const consultas = new Set();
    const anoValido = ano && ano.length >= 4 ? ano : '';

    termosBusca.forEach((termo) => {
      if (!termo) return;
      consultas.add(termo);
      if (anoValido) {
        consultas.add(`${termo} ${anoValido}`);
      }
    });

    return Array.from(consultas).slice(0, 5); // Limita a 5 consultas para evitar abuso
  }

  gerarURLsOLX(marca, modelo, ano) {
    const urls = new Set();
    const marcaSlug = this.slugify(marca);
    const modeloSlug = this.slugify(modelo);

    if (marcaSlug && modeloSlug && ano) {
      urls.add(`https://www.olx.com.br/autos-e-pecas/carros-vans-e-utilitarios/${marcaSlug}/${modeloSlug}/${ano}`);
    }
    if (marcaSlug && modeloSlug) {
      urls.add(`https://www.olx.com.br/autos-e-pecas/carros-vans-e-utilitarios/${marcaSlug}/${modeloSlug}`);
    }
    if (marcaSlug) {
      urls.add(`https://www.olx.com.br/autos-e-pecas/carros-vans-e-utilitarios/${marcaSlug}`);
    }

    return Array.from(urls);
  }

  gerarURLsWebmotors(marca, modelo, ano) {
    const urls = new Set();
    const marcaSlug = this.slugify(marca);
    const modeloSlug = this.slugify(modelo);

    if (marcaSlug && modeloSlug && ano) {
      urls.add(`https://www.webmotors.com.br/carros/${marcaSlug}/${modeloSlug}?ano=${ano}`);
    }
    if (marcaSlug && modeloSlug) {
      urls.add(`https://www.webmotors.com.br/carros/${marcaSlug}/${modeloSlug}`);
    }
    if (marcaSlug) {
      urls.add(`https://www.webmotors.com.br/carros/${marcaSlug}`);
    }

    return Array.from(urls);
  }

  async coletarPrecosDeURL(config, precos, precosEncontrados) {
    const { url, site = 'Site', seletores = [], seletorLinks } = config;
    if (!url) return;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`[${site}] Resposta ${response.status} ao acessar ${url}`);
        return;
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      const totalAntes = precos.length;

      this.extrairPrecosSeletores($, seletores, precos, precosEncontrados);

      if (precos.length - totalAntes < 3) {
        this.extrairPrecosPorRegex(html, precos, precosEncontrados);
      }

      if (seletorLinks && precos.length - totalAntes < 3) {
        this.extrairPrecosEmLinks($, seletorLinks, precos, precosEncontrados);
      }

      const novos = precos.length - totalAntes;
      console.log(`[${site}] ${url} => +${novos} preços (total ${precos.length})`);

    } catch (error) {
      console.warn(`[${site}] Falha ao coletar preços de ${url}: ${error.message}`);
    }
  }

  extrairPrecosSeletores($, seletores, precos, precosEncontrados) {
    seletores.forEach((seletor) => {
      $(seletor).each((_, element) => {
        try {
          const precoTexto = $(element).text().trim();
          const preco = this.extrairPreco(precoTexto);
          this.adicionarPreco(preco, precos, precosEncontrados);
        } catch {
          // Ignora erros individuais
        }
      });
    });
  }

  extrairPrecosPorRegex(html, precos, precosEncontrados) {
    if (!html) return;
    const regexPreco = /R\$\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/gi;
    const matches = html.match(regexPreco);

    if (!matches) return;

    matches.forEach((match) => {
      const preco = this.extrairPreco(match);
      this.adicionarPreco(preco, precos, precosEncontrados);
    });
  }

  extrairPrecosEmLinks($, seletorLinks, precos, precosEncontrados) {
    $(seletorLinks).each((_, element) => {
      try {
        const precoTexto = $(element).text();
        const preco = this.extrairPreco(precoTexto);
        this.adicionarPreco(preco, precos, precosEncontrados);
      } catch {
        // Ignora erros individuais
      }
    });
  }

  adicionarPreco(preco, precos, precosEncontrados) {
    if (preco > 0 && preco < 1000000 && !precosEncontrados.has(preco)) {
      precos.push(preco);
      precosEncontrados.add(preco);
    }
  }

  /**
   * Extrai preço de um texto
   * @param {string} texto - Texto contendo o preço
   * @returns {number} Preço extraído
   */
  extrairPreco(texto) {
    if (!texto) return 0;

    // Remove caracteres não numéricos exceto vírgula e ponto
    const precoLimpo = texto
      .replace(/[^\d,.]/g, '')
      .replace(/\./g, '') // Remove pontos (milhares)
      .replace(',', '.'); // Converte vírgula para ponto

    const preco = parseFloat(precoLimpo);
    
    // Valida se é um preço razoável (entre R$ 1.000 e R$ 1.000.000)
    if (isNaN(preco) || preco < 1000 || preco > 1000000) {
      return 0;
    }

    return preco;
  }

  /**
   * Remove outliers usando método IQR (Interquartile Range)
   * @param {Array<number>} precos - Array de preços
   * @returns {Array<number>} Preços sem outliers
   */
  removerOutliers(precos) {
    if (precos.length < 4) return precos;

    const sorted = [...precos].sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);
    
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;
    
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    return precos.filter(preco => preco >= lowerBound && preco <= upperBound);
  }

  /**
   * Calcula estatísticas dos preços
   * @param {Array<number>} precos - Array de preços
   * @returns {Object} Estatísticas
   */
  calcularEstatisticas(precos) {
    if (precos.length === 0) {
      return null;
    }

    const soma = precos.reduce((acc, preco) => acc + preco, 0);
    const media = soma / precos.length;
    
    const sorted = [...precos].sort((a, b) => a - b);
    const mediana = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

    const min = Math.min(...precos);
    const max = Math.max(...precos);

    // Desvio padrão
    const variacao = precos.reduce((acc, preco) => acc + Math.pow(preco - media, 2), 0);
    const desvioPadrao = Math.sqrt(variacao / precos.length);

    return {
      quantidade: precos.length,
      media: Math.round(media * 100) / 100,
      mediana: Math.round(mediana * 100) / 100,
      minimo: min,
      maximo: max,
      desvioPadrao: Math.round(desvioPadrao * 100) / 100
    };
  }
}

module.exports = new PrecoService();

