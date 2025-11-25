//
//  ConsultaView.swift
//  Valor Real Car
//
//  Created on 24/11/2025.
//

import SwiftUI

class ConsultaViewModel: ObservableObject {
    @Published var placa: String = ""
    @Published var veiculo: VeiculoData?
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    @Published var showError: Bool = false
    
    func consultarPlaca() {
        guard !placa.isEmpty else {
            errorMessage = "Por favor, digite uma placa"
            showError = true
            return
        }
        
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                let response = try await PlacaService.shared.consultarPlaca(placa)
                
                await MainActor.run {
                    isLoading = false
                    
                    if response.success, let data = response.data {
                        self.veiculo = data
                    } else {
                        self.errorMessage = response.message ?? response.error ?? "Placa não encontrada"
                        self.showError = true
                    }
                }
            } catch {
                await MainActor.run {
                    isLoading = false
                    errorMessage = error.localizedDescription
                    showError = true
                }
            }
        }
    }
}

struct ConsultaView: View {
    @ObservedObject var viewModel: ConsultaViewModel
    @FocusState private var isPlacaFocused: Bool
    
    var body: some View {
        ZStack {
            Color(.systemGroupedBackground)
                .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 20) {
                    // Header
                    VStack(spacing: 10) {
                        Image(systemName: "car.fill")
                            .font(.system(size: 60))
                            .foregroundColor(.blue)
                        
                        Text("Valor Real Car")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                        
                        Text("Consulte o valor médio de venda do seu veículo")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.top, 40)
                    .padding(.bottom, 20)
                    
                    // Campo de entrada
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Placa do Veículo")
                            .font(.headline)
                            .foregroundColor(.primary)
                        
                        HStack {
                            TextField("Ex: ABC1234", text: $viewModel.placa)
                                .textFieldStyle(.roundedBorder)
                                .font(.title2)
                                .textInputAutocapitalization(.characters)
                                .autocorrectionDisabled()
                                .focused($isPlacaFocused)
                                .onSubmit {
                                    viewModel.consultarPlaca()
                                }
                            
                            Button(action: {
                                viewModel.consultarPlaca()
                            }) {
                                if viewModel.isLoading {
                                    ProgressView()
                                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                } else {
                                    Image(systemName: "magnifyingglass")
                                        .font(.title2)
                                        .foregroundColor(.white)
                                }
                            }
                            .frame(width: 50, height: 50)
                            .background(viewModel.isLoading ? Color.gray : Color.blue)
                            .cornerRadius(10)
                            .disabled(viewModel.isLoading || viewModel.placa.isEmpty)
                        }
                    }
                    .padding(.horizontal)
                    
                    // Resultado ou Placeholder
                    if let veiculo = viewModel.veiculo {
                        ResultadoView(veiculo: veiculo)
                            .transition(.opacity)
                    } else if !viewModel.isLoading {
                        VStack(spacing: 15) {
                            Image(systemName: "doc.text.magnifyingglass")
                                .font(.system(size: 50))
                                .foregroundColor(.gray)
                            
                            Text("Digite a placa do veículo para consultar")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                                .multilineTextAlignment(.center)
                        }
                        .padding(.top, 60)
                    }
                }
                .padding()
            }
        }
        .navigationTitle("")
        .navigationBarTitleDisplayMode(.inline)
        .alert("Erro", isPresented: $viewModel.showError) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(viewModel.errorMessage ?? "Erro desconhecido")
        }
        .onAppear {
            isPlacaFocused = true
        }
    }
}

#Preview {
    ConsultaView(viewModel: ConsultaViewModel())
}

