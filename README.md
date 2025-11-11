# KTPilot RAG Bot

A chatbot application that allows you to upload documents and search through them using AI-powered search.

## Features

- 📄 Upload documents (PDF, DOCX, TXT, HTML)
- 🔍 Search through uploaded documents
- 💬 Chat interface with document-based answers
- 📚 View and manage uploaded documents
- 🗑️ Delete documents

## Local Development

### Prerequisites
- Node.js (v16 or higher)
- npm

### Setup

1. Clone the repository
```bash
git clone https://github.com/Nivk0/ktpilot-rag-bot.git
cd ktpilot-rag-bot
```

2. Install backend dependencies
```bash
cd server
npm install
```

3. Install frontend dependencies
```bash
cd ../client
npm install
```

### Running Locally

**Terminal 1 - Backend:**
```bash
cd server
npm start
# Server runs on http://localhost:5050
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

The frontend will automatically proxy API requests to the backend during development.

## Website Deployment

### Environment Variables

**Frontend (`client/.env`):**
```env
# For production, set your API URL
# Leave empty to use same-origin (if frontend and backend are on same domain)
VITE_API_BASE_URL=https://api.yourdomain.com
```

**Backend (`server/.env`):**
```env
PORT=5050
FRONTEND_URL=https://yourdomain.com
```

### Building for Production

**Frontend:**
```bash
cd client
npm run build
# Output will be in client/dist/
```

**Backend:**
The backend runs as a Node.js server. Use a process manager like PM2:
```bash
cd server
npm install -g pm2
pm2 start index.js --name ktpilot-backend
```

### Deployment Options

1. **Same Domain (Recommended)**: Deploy frontend and backend on the same domain
   - Frontend: Serve `client/dist/` as static files
   - Backend: Run Node.js server on `/api` routes
   - No CORS issues, simpler setup

2. **Separate Domains**: 
   - Set `VITE_API_BASE_URL` in frontend `.env`
   - Set `FRONTEND_URL` in backend `.env` for CORS
   - Configure CORS properly for cross-origin requests

### Deployment Platforms

- **Vercel/Netlify**: Deploy frontend, use serverless functions or separate backend
- **Heroku/Railway**: Deploy both frontend and backend
- **AWS/GCP/Azure**: Use their hosting services for both

## API Endpoints

- `POST /api/upload` - Upload a document
- `GET /api/documents` - List all documents
- `GET /api/documents/:id` - Get a specific document
- `POST /api/search` - Search documents
- `POST /api/ask` - Ask a question (searches documents)
- `DELETE /api/documents/:id` - Delete a document

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Document Processing**: pdf-parse, mammoth, cheerio
