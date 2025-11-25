//
//  PlacaService.swift
//  Valor Real Car
//
//  Created on 24/11/2025.
//

import Foundation

class PlacaService {
    static let shared = PlacaService()
    
    // URL da API - Altere para o IP da sua máquina quando testar no dispositivo físico
    // Para simulador: localhost funciona
    // Para dispositivo físico: use o IP local da sua rede (ex: 192.168.1.100)
    private let baseURL = "http://localhost:3923/api/placas"
    
    private init() {}
    
    func consultarPlaca(_ placa: String) async throws -> PlacaResponse {
        // Remove espaços e converte para maiúsculo
        let placaFormatada = placa.replacingOccurrences(of: " ", with: "").uppercased()
        
        guard let url = URL(string: "\(baseURL)/\(placaFormatada)") else {
            throw PlacaError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = 30
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw PlacaError.invalidResponse
        }
        
        guard httpResponse.statusCode == 200 else {
            if let errorData = try? JSONDecoder().decode(PlacaResponse.self, from: data) {
                throw PlacaError.apiError(errorData.message ?? errorData.error ?? "Erro desconhecido")
            }
            throw PlacaError.httpError(httpResponse.statusCode)
        }
        
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        
        do {
            let placaResponse = try decoder.decode(PlacaResponse.self, from: data)
            return placaResponse
        } catch {
            print("Erro ao decodificar JSON: \(error)")
            throw PlacaError.decodingError(error.localizedDescription)
        }
    }
}

enum PlacaError: LocalizedError {
    case invalidURL
    case invalidResponse
    case httpError(Int)
    case apiError(String)
    case decodingError(String)
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "URL inválida"
        case .invalidResponse:
            return "Resposta inválida do servidor"
        case .httpError(let code):
            return "Erro HTTP: \(code)"
        case .apiError(let message):
            return message
        case .decodingError(let message):
            return "Erro ao processar dados: \(message)"
        }
    }
}

