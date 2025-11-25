//
//  ResultadoView.swift
//  Valor Real Car
//
//  Created on 24/11/2025.
//

import SwiftUI

struct ResultadoView: View {
    let veiculo: VeiculoData
    
    var body: some View {
        VStack(spacing: 20) {
            // Card Principal - Informações do Veículo
            VStack(alignment: .leading, spacing: 15) {
                HStack {
                    if let logoURL = veiculo.logo, let url = URL(string: logoURL) {
                        AsyncImage(url: url) { image in
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                        } placeholder: {
                            ProgressView()
                        }
                        .frame(width: 60, height: 60)
                    }
                    
                    VStack(alignment: .leading, spacing: 4) {
                        Text(veiculo.marcaFormatada)
                            .font(.title2)
                            .fontWeight(.bold)
                        
                        Text(veiculo.modeloFormatado)
                            .font(.headline)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                }
                
                Divider()
                
                // Informações básicas
                VStack(spacing: 12) {
                    InfoRow(label: "Ano", value: veiculo.ano ?? "N/A")
                    InfoRow(label: "Cor", value: veiculo.cor ?? "N/A")
                    InfoRow(label: "UF", value: veiculo.uf ?? "N/A")
                    InfoRow(label: "Município", value: veiculo.municipio ?? "N/A")
                    InfoRow(label: "Situação", value: veiculo.situacao ?? "N/A")
                    
                    if let combustivel = veiculo.extra?.combustivel, !combustivel.isEmpty {
                        InfoRow(label: "Combustível", value: combustivel)
                    }
                    
                    if let tipo = veiculo.extra?.tipo_veiculo, !tipo.isEmpty {
                        InfoRow(label: "Tipo", value: tipo)
                    }
                }
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(15)
            .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
            
            // Card de Valor Médio
            if let precosMedio = veiculo.precosMedio, precosMedio.success,
               let estatisticas = precosMedio.estatisticas,
               let media = estatisticas.media {
                
                VStack(alignment: .leading, spacing: 15) {
                    HStack {
                        Image(systemName: "dollarsign.circle.fill")
                            .font(.title2)
                            .foregroundColor(.green)
                        
                        Text("Valor Médio de Venda")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        Spacer()
                        
                        if let fonte = precosMedio.fonte {
                            Text(fonte)
                                .font(.caption)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color.blue.opacity(0.2))
                                .cornerRadius(8)
                        }
                    }
                    
                    Divider()
                    
                    // Valor principal
                    VStack(alignment: .leading, spacing: 8) {
                        Text("R$ \(formatCurrency(media))")
                            .font(.system(size: 32, weight: .bold))
                            .foregroundColor(.green)
                        
                        if let quantidade = estatisticas.quantidade {
                            Text("Baseado em \(quantidade) valores")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    // Estatísticas detalhadas
                    VStack(spacing: 10) {
                        if let mediana = estatisticas.mediana {
                            StatRow(label: "Mediana", value: formatCurrency(mediana))
                        }
                        
                        HStack(spacing: 20) {
                            if let minimo = estatisticas.minimo {
                                StatRow(label: "Mínimo", value: formatCurrency(minimo))
                            }
                            
                            if let maximo = estatisticas.maximo {
                                StatRow(label: "Máximo", value: formatCurrency(maximo))
                            }
                        }
                    }
                    .padding(.top, 8)
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(15)
                .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
            }
            
            // Informações adicionais (Restrições)
            if let extra = veiculo.extra {
                VStack(alignment: .leading, spacing: 12) {
                    Text("Restrições")
                        .font(.headline)
                        .fontWeight(.semibold)
                    
                    if let restricao1 = extra.restricao_1, !restricao1.isEmpty, restricao1 != "SEM RESTRICAO" {
                        RestricaoRow(text: restricao1)
                    }
                    if let restricao2 = extra.restricao_2, !restricao2.isEmpty, restricao2 != "SEM RESTRICAO" {
                        RestricaoRow(text: restricao2)
                    }
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(15)
                .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
            }
        }
        .padding(.horizontal)
    }
    
    private func formatCurrency(_ value: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.locale = Locale(identifier: "pt_BR")
        formatter.maximumFractionDigits = 0
        return formatter.string(from: NSNumber(value: value)) ?? "R$ 0"
    }
}

struct InfoRow: View {
    let label: String
    let value: String
    
    var body: some View {
        HStack {
            Text(label)
                .foregroundColor(.secondary)
            Spacer()
            Text(value)
                .fontWeight(.medium)
        }
    }
}

struct StatRow: View {
    let label: String
    let value: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
            Text(value)
                .font(.headline)
        }
    }
}

struct RestricaoRow: View {
    let text: String
    
    var body: some View {
        HStack {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundColor(.orange)
            Text(text)
                .font(.subheadline)
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    ScrollView {
        ResultadoView(veiculo: VeiculoData(
            MARCA: "VW",
            marca: nil,
            MODELO: "GOL 1.0",
            modelo: nil,
            SUBMODELO: "GOL",
            VERSAO: "1.0",
            ano: "2010",
            anoModelo: "2011",
            cor: "PRETA",
            situacao: "Sem restrição",
            uf: "GO",
            municipio: "Goiânia",
            placa: "NWG9990",
            placa_alternativa: "NWG9J90",
            origem: "NACIONAL",
            logo: nil,
            mensagemRetorno: nil,
            extra: nil,
            fipe: nil,
            precosMedio: PrecosMedio(
                success: true,
                fonte: "FIPE",
                message: nil,
                precos: nil,
                estatisticas: Estatisticas(
                    quantidade: 7,
                    media: 31851.43,
                    mediana: 29691.00,
                    minimo: 25499.00,
                    maximo: 46504.00,
                    desvioPadrao: nil
                )
            )
        ))
    }
    .background(Color(.systemGroupedBackground))
}

