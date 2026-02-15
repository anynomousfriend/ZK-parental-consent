#!/bin/bash

echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                               ║"
echo "║              ZK CONSENT GATEWAY - Full Stack Launcher                        ║"
echo "║                                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Docker is running
echo "🔍 Checking Docker services..."
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if containers are running
if ! docker ps | grep -q "node\|indexer\|proof-server"; then
    echo "⚠️  Docker containers not running. Starting them now..."
    cd ../midnight-local-network
    docker compose up -d
    cd ../midnight-starter-template
    echo "✅ Docker containers started"
    sleep 5
else
    echo "✅ Docker containers already running"
fi

echo ""
echo "🚀 Starting services..."
echo ""

# Start API server
echo "📡 Starting API server on port 3001..."
cd zk-consent-gateway
npm run api > /dev/null 2>&1 &
API_PID=$!
cd ..

# Wait for API to be ready
sleep 3

# Check if API is responding
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ API server running (PID: $API_PID)"
else
    echo "❌ API server failed to start"
    exit 1
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
echo "║                         ALL SERVICES READY!                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "  ✅ Docker Testnet:  Running"
echo "  ✅ API Server:      http://localhost:3001"
echo "  ✅ Frontend:        Ready to start"
echo ""
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""
echo "📱 TO START FRONTEND:"
echo "   cd zk-consent-frontend"
echo "   npm run dev"
echo ""
echo "🌐 THEN OPEN: http://localhost:5173"
echo ""
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""
echo "🛑 TO STOP ALL SERVICES:"
echo "   kill $API_PID"
echo "   cd ../midnight-local-network && docker compose down"
echo ""
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""

# Keep script running
read -p "Press Enter to stop API server and exit..."
kill $API_PID
echo "✅ API server stopped"
