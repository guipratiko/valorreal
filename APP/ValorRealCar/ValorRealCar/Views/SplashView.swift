//
//  SplashView.swift
//  Valor Real Car
//
//  Created on 24/11/2025.
//

import SwiftUI

struct SplashView: View {
    @State private var isActive = false
    @State private var size = 0.8
    @State private var opacity = 0.5
    
    var body: some View {
        if isActive {
            ContentView()
        } else {
            ZStack {
                LinearGradient(
                    gradient: Gradient(colors: [Color.blue, Color.blue.opacity(0.8)]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
                
                VStack(spacing: 20) {
                    Image(systemName: "car.fill")
                        .font(.system(size: 80))
                        .foregroundColor(.white)
                        .scaleEffect(size)
                        .opacity(opacity)
                    
                    Text("Valor Real Car")
                        .font(.system(size: 36, weight: .bold))
                        .foregroundColor(.white)
                        .opacity(opacity)
                    
                    Text("Consulte o valor do seu veículo")
                        .font(.subheadline)
                        .foregroundColor(.white.opacity(0.9))
                        .opacity(opacity)
                }
                .onAppear {
                    withAnimation(.easeIn(duration: 1.2)) {
                        self.size = 0.9
                        self.opacity = 1.0
                    }
                }
            }
            .onAppear {
                DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                    withAnimation {
                        self.isActive = true
                    }
                }
            }
        }
    }
}

#Preview {
    SplashView()
}

