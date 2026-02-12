# Sach Wave Deployment Guide

## Quick Deploy

### Backend (Render)
1. Go to [render.com](https://render.com) and create a free account
2. Create a new Web Service
3. Connect your GitHub repo or use "Deploy from Git"
4. Configure:
   - **Name**: sach-wave-server
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free
5. Add Environment Variables:
   - `NODE_ENV`: production
   - `JWT_SECRET`: (generate a random string)
   - `CORS_ORIGINS`: https://sach-wave.vercel.app,http://localhost:5173
6. Deploy!

### Frontend (Vercel)
1. Go to [vercel.com](https://vercel.com) and create a free account
2. Import your GitHub repo
3. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variables:
   - `VITE_API_URL`: https://your-render-url.onrender.com/api
5. Deploy!

## Environment Variables

### Backend (.env)
```
NODE_ENV=production
PORT=10000
JWT_SECRET=your-super-secret-key-here
CORS_ORIGINS=https://sach-wave.vercel.app
```

### Frontend (.env)
```
VITE_API_URL=https://your-render-url.onrender.com/api
```

## Features

- **PWA Support**: Install on mobile home screen
- **Real-time**: Chat and notifications work in real-time
- **Persistent Storage**: JSON file storage (upgradable to MongoDB)
- **Secure**: JWT authentication, admin access controls
- **Mobile-First**: Optimized for mobile browsers

## Access Codes

- **Secret Code**: `sachad26` (for new user registration)
- **First User**: Automatically becomes Owner/Admin

## Post-Deployment

1. First user to sign up becomes the Owner
2. Owner can grant admin access to other users
3. All data persists between sessions
4. Multiple users can use the app simultaneously
