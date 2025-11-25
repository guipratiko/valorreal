//
//  PlacaResponse.swift
//  Valor Real Car
//
//  Created on 24/11/2025.
//

import Foundation

struct PlacaResponse: Codable {
    let success: Bool
    let data: VeiculoData?
    let error: String?
    let message: String?
}

struct VeiculoData: Codable {
    let MARCA: String?
    let marca: String?
    let MODELO: String?
    let modelo: String?
    let SUBMODELO: String?
    let VERSAO: String?
    let ano: String?
    let anoModelo: String?
    let cor: String?
    let situacao: String?
    let uf: String?
    let municipio: String?
    let placa: String?
    let placa_alternativa: String?
    let origem: String?
    let logo: String?
    let mensagemRetorno: String?
    let extra: ExtraData?
    let fipe: FipeData?
    let precosMedio: PrecosMedio?
    
    var marcaFormatada: String {
        return MARCA ?? marca ?? "N/A"
    }
    
    var modeloFormatado: String {
        return MODELO ?? modelo ?? "N/A"
    }
}

struct ExtraData: Codable {
    let combustivel: String?
    let cilindradas: String?
    let tipo_veiculo: String?
    let segmento: String?
    let sub_segmento: String?
    let situacao_veiculo: String?
    let restricao_1: String?
    let restricao_2: String?
    let restricao_3: String?
    let restricao_4: String?
}

struct FipeData: Codable {
    let dados: [FipeItem]?
}

struct FipeItem: Codable {
    let ano_modelo: String?
    let codigo_fipe: String?
    let texto_marca: String?
    let texto_modelo: String?
    let texto_valor: String?
    let combustivel: String?
    let mes_referencia: String?
}

struct PrecosMedio: Codable {
    let success: Bool
    let fonte: String?
    let message: String?
    let precos: PrecosData?
    let estatisticas: Estatisticas?
}

struct PrecosData: Codable {
    let olx: [Double]?
    let webmotors: [Double]?
    let fipe: [Double]?
    let todos: [Double]?
}

struct Estatisticas: Codable {
    let quantidade: Int?
    let media: Double?
    let mediana: Double?
    let minimo: Double?
    let maximo: Double?
    let desvioPadrao: Double?
}

