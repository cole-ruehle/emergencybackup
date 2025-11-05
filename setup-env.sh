#!/bin/bash

# TrailLink Environment Setup Script
# This script helps you set up your .env.local file

echo "🔑 TrailLink Environment Setup"
echo "================================"
echo ""

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists!"
    echo ""
    read -p "Do you want to overwrite it? (y/N): " overwrite
    if [[ ! $overwrite =~ ^[Yy]$ ]]; then
        echo "Keeping existing .env.local"
        exit 0
    fi
fi

# Ask for Google Maps API key
echo "Please enter your Google Maps API key:"
echo "(Get one from: https://console.cloud.google.com/)"
echo ""
read -p "API Key: " api_key

# Validate API key is not empty
if [ -z "$api_key" ]; then
    echo "❌ Error: API key cannot be empty"
    exit 1
fi

# Create .env.local file
cat > .env.local << EOF
# TrailLink Environment Variables
# Auto-generated on $(date)

# ============================================================================
# REQUIRED: Google Maps API Key
# ============================================================================
VITE_GOOGLE_MAPS_API_KEY=$api_key

# ============================================================================
# OPTIONAL: Backend Configuration
# ============================================================================
# Override default backend URL (default: http://localhost:8000/api)
# VITE_API_BASE_URL=http://localhost:8000/api

# ============================================================================
# OPTIONAL: Development Settings
# ============================================================================
# Enable debug logging in console
# VITE_DEBUG=true
EOF

echo ""
echo "✅ Success! .env.local created"
echo ""
echo "📝 Next steps:"
echo "   1. Make sure your backend is running on http://localhost:8000"
echo "   2. Run: npm run dev"
echo "   3. Open: http://localhost:5173"
echo ""
echo "📚 For more info, see: ENV_SETUP.md"

