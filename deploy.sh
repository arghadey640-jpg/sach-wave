#!/bin/bash

echo "🚀 Sach Wave Deployment Script"
echo "================================"

# Check if git is initialized
if [ ! -d .git ]; then
  echo "📦 Initializing Git repository..."
  git init
  git add .
  git commit -m "Initial commit - Sach Wave social media app"
fi

echo ""
echo "📋 Deployment Checklist:"
echo ""
echo "1. Backend Deployment (Render):"
echo "   - Go to https://render.com"
echo "   - Create new Web Service"
echo "   - Connect this GitHub repo"
echo "   - Set build command: npm install"
echo "   - Set start command: node server.js"
echo "   - Add environment variables:"
echo "     * NODE_ENV=production"
echo "     * JWT_SECRET=<generate-random-string>"
echo "     * CORS_ORIGINS=https://your-frontend-url.vercel.app"
echo ""
echo "2. Frontend Deployment (Vercel):"
echo "   - Go to https://vercel.com"
echo "   - Import this GitHub repo"
echo "   - Framework: Vite"
echo "   - Add environment variable:"
echo "     * VITE_API_URL=https://your-render-url.onrender.com/api"
echo ""
echo "3. PWA Icons:"
echo "   - Replace /client/public/icon-*.png with your app icons"
echo "   - Recommended: 512x512, 192x192, 144x144, 96x96, 72x72"
echo ""
echo "✨ Features Ready:"
echo "   ✅ PWA Support (installable on mobile)"
echo "   ✅ Real-time chat & notifications"
echo "   ✅ Admin panel with owner controls"
echo "   ✅ Follow/unfollow system"
echo "   ✅ Multi-reactions on posts"
echo "   ✅ Stories with text & emojis"
echo "   ✅ Profile customization"
echo ""
echo "🔑 Access Code: sachad26"
echo "👑 First user becomes Owner automatically"
