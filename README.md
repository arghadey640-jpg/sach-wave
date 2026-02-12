# Sach Wave - Social Media Web App

A mobile-first social media web application for students with Instagram/Facebook-like UI.

## Features

- **Access Control**: Secret access code verification (sachad26)
- **Authentication**: JWT-based login/signup
- **Profile Creation**: Upload profile picture, fill in name, DOB, roll number, stream, and bio
- **Stories**: 24-hour disappearing stories with circular avatars
- **Feed**: Instagram-like post feed with likes, comments, and shares
- **Navigation**: Bottom navigation bar (Home, Search, Create, Notifications, Profile)
- **Admin Panel**: Full user and post management (ban, suspend, delete)
- **Animations**: Smooth Framer Motion animations throughout

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express
- **Storage**: JSON file-based storage
- **Authentication**: JWT tokens

## Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Setup

1. Install dependencies:
```bash
npm run install-all
```

2. Set up environment variables:
```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

3. Start development server:
```bash
npm run dev
```

This will start both the client (http://localhost:5173) and server (http://localhost:5000).

## Default Access Code

The secret access code to enter the app is: **sachad26**

## Admin Access

The first user to sign up automatically becomes an admin.

## Build for Production

```bash
npm run build
```

## Deployment

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`

### Render
1. Create a new Web Service
2. Connect your repository
3. Set build command: `npm install && cd client && npm install && npm run build`
4. Set start command: `cd server && npm start`

## Project Structure

```
sach-wave/
├── client/              # React Frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   └── ...
│   └── package.json
├── server/              # Node.js Backend
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── utils/           # Data store utilities
│   └── package.json
└── package.json
```

## License

MIT
