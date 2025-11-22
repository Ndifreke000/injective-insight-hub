#!/bin/bash

# Start Injective Insight Hub Backend Server
echo "🚀 Starting Injective Insight Hub Backend Server..."
echo ""

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "❌ Error: backend directory not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Navigate to backend
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
    echo ""
fi

# Start backend server
echo "✅ Starting backend server on port 3001..."
npm run dev
