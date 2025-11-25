#!/bin/bash

echo "🧪 Testando o App Valor Real Car"
echo "================================"
echo ""

# Verificar se a API está rodando
echo "1️⃣ Verificando se a API está rodando..."
if lsof -Pi :3923 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ API está rodando na porta 3923"
else
    echo "❌ API não está rodando"
    echo ""
    echo "🚀 Iniciando a API..."
    cd /Users/guilhermeaugustosantos/Documents/Cursor/valorreal
    npm start &
    sleep 3
    echo "✅ API iniciada!"
fi

echo ""
echo "2️⃣ Testando endpoint da API..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3923/health)

if [ "$response" = "200" ]; then
    echo "✅ API respondendo corretamente"
else
    echo "❌ API não está respondendo (código: $response)"
    echo "   Verifique se a API está rodando: npm start"
fi

echo ""
echo "3️⃣ Testando consulta de placa..."
test_response=$(curl -s http://localhost:3923/api/placas/NWG9990 | head -c 100)

if [[ $test_response == *"success"* ]] || [[ $test_response == *"MARCA"* ]]; then
    echo "✅ Consulta de placa funcionando"
else
    echo "⚠️  Consulta pode não estar funcionando corretamente"
fi

echo ""
echo "📱 Próximos passos para testar o app:"
echo "1. Abra o Xcode"
echo "2. Abra o projeto: /Users/guilhermeaugustosantos/Documents/APP/ValorRealCar"
echo "3. Selecione um simulador (ex: iPhone 15)"
echo "4. Pressione ⌘ + R para executar"
echo "5. Digite uma placa (ex: NWG9990) e teste!"
echo ""
echo "✅ Tudo pronto para testar!"

