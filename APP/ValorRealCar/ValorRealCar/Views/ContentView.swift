//
//  ContentView.swift
//  Valor Real Car
//
//  Created on 24/11/2025.
//

import SwiftUI

struct ContentView: View {
    @StateObject private var viewModel = ConsultaViewModel()
    
    var body: some View {
        NavigationView {
            ConsultaView(viewModel: viewModel)
        }
    }
}

#Preview {
    ContentView()
}

