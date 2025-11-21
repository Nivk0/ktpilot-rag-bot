# KTPilot RAG Bot - Product Presentation

## 🎯 Product Overview

**KTPilot** is an intelligent AI-powered chatbot designed specifically for Kappa Theta Pi (KTP) fraternity. It combines **Retrieval Augmented Generation (RAG)** technology with Google's Gemini AI to provide accurate, context-aware answers from uploaded documents and general knowledge.

### What Problem Does It Solve?
- **Information Access**: Quickly find answers from fraternity documents, event details, membership info, and project guidelines
- **Knowledge Management**: Centralized document storage and intelligent search across all uploaded materials
- **Member Communication**: Direct messaging system for fraternity members
- **Multi-Device Access**: Shared database ensures all members see the same information across different devices

---

## ✨ Key Features

### 1. **AI-Powered Document Q&A**
- Upload documents (PDF, DOCX, TXT, HTML, Excel)
- Ask questions in natural language
- Get answers that combine document content with general knowledge
- Adaptive response format (paragraph or straightforward based on question type)

### 2. **Intelligent Document Search**
- Semantic search through document content
- Chunk-based retrieval for precise answers
- Relevance scoring to find the most accurate information
- Multi-document support

### 3. **User Authentication & Security**
- Secure user signup and login
- JWT token-based authentication
- Password reset via email
- Executive role management
- Protected API endpoints

### 4. **Direct Messaging System**
- Real-time messaging between members
- Contact management
- Conversation history
- User directory

### 5. **Executive Panel**
- User management
- Generate password reset codes for members
- View all registered users
- Administrative controls

### 6. **Document Management**
- Upload multiple document types
- View all uploaded documents
- Delete documents
- Automatic document chunking for efficient search

### 7. **Multi-Computer Synchronization**
- MongoDB Atlas cloud database
- All data shared across all devices
- Real-time synchronization
- No manual file sharing needed

---

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Axios** - HTTP client for API calls
- **React Context API** - State management for authentication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database (Mongoose ODM)
- **Google Gemini AI** - AI model for generating responses
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Nodemailer** - Email service for password resets

### Document Processing
- **pdf-parse** - PDF text extraction
- **mammoth** - DOCX file parsing
- **cheerio** - HTML parsing
- **multer** - File upload handling

### Deployment
- **Netlify** - Frontend hosting
- **Railway** - Backend hosting
- **MongoDB Atlas** - Database hosting

---

## 🏗️ Architecture

### System Architecture
```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Client    │────────▶│   Backend   │────────▶│   MongoDB   │
│  (React)    │  HTTP   │  (Express)  │  Query  │   Atlas     │
│  Netlify    │         │  Railway    │         │   Cloud     │
└─────────────┘         └─────────────┘         └─────────────┘
                              │
                              ▼
                        ┌─────────────┐
                        │ Google      │
                        │ Gemini AI   │
                        └─────────────┘
```

### Data Flow
1. **User uploads document** → Backend processes and chunks → Stored in MongoDB
2. **User asks question** → Backend searches documents → Retrieves relevant chunks
3. **AI generates answer** → Combines document context + general knowledge → Returns to user

### Database Models
- **User** - User accounts with authentication
- **Document** - Uploaded documents with chunks
- **Message** - Direct messages between users
- **Contact** - User contacts list
- **ResetCode** - Password reset codes

---

## 🔄 How It Works

### Document Upload Process
1. User selects file (PDF, DOCX, TXT, HTML, Excel)
2. File is uploaded to server
3. Server extracts text content based on file type
4. Text is split into semantic chunks
5. Chunks are stored in MongoDB with metadata
6. Document metadata is saved

### Question Answering Process
1. User submits a question
2. System determines question type (what, who, when, how, etc.)
3. Semantic search finds relevant document chunks
4. Relevant chunks are scored and ranked
5. Top chunks are sent to Gemini AI as context
6. AI generates answer combining:
   - Information from documents
   - General knowledge
   - Context-aware understanding
7. Answer is formatted (paragraph or straightforward)
8. Response returned to user (no sources shown)

### Search Process
1. User enters search query
2. System searches through all document chunks
3. Relevance scoring ranks results
4. Top results displayed with snippets
5. User can click to view full document

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/request-reset-code` - Request password reset
- `POST /api/auth/reset-password` - Reset password with code

### Executive Endpoints
- `POST /api/auth/executive/generate-reset-code` - Generate reset code for user
- `GET /api/auth/executive/users` - List all users

### Documents
- `POST /api/upload` - Upload a document
- `GET /api/documents` - List all documents
- `GET /api/documents/:id` - Get specific document
- `DELETE /api/documents/:id` - Delete document
- `POST /api/search` - Search documents
- `POST /api/ask` - Ask question (RAG-powered)

### Messaging
- `GET /api/users` - List all users
- `POST /api/contacts` - Add contact
- `GET /api/contacts` - Get contacts
- `POST /api/messages` - Send message
- `GET /api/conversations` - Get conversations
- `GET /api/messages/:userId` - Get messages with user

### Health & Status
- `GET /` - Server status
- `GET /api/health` - Health check with database status

---

## 🔒 Security Features

### Authentication & Authorization
- JWT tokens for secure authentication
- Password hashing with bcrypt
- Protected API routes with middleware
- Executive role-based access control

### Data Security
- MongoDB Atlas with connection encryption
- Environment variables for sensitive data
- CORS configuration for allowed origins
- Input validation and sanitization

### Email Security
- Password reset codes with expiration
- Secure token generation
- Email verification for password resets

---

## 🚀 Deployment

### Frontend (Netlify)
- **Build Command**: `npm run build`
- **Publish Directory**: `client/dist`
- **Environment Variables**:
  - `VITE_API_BASE_URL` - Backend API URL

### Backend (Railway)
- **Root Directory**: `server`
- **Build Command**: Auto-detected (npm install)
- **Start Command**: `node index.js`
- **Environment Variables**:
  - `PORT` - Server port
  - `MONGODB_URI` - MongoDB connection string
  - `FRONTEND_URL` - Frontend URL for CORS
  - `JWT_SECRET` - Secret for JWT tokens
  - `GEMINI_API_KEY` - Google Gemini API key
  - `SMTP_*` - Email configuration (optional)

### Database (MongoDB Atlas)
- Cloud-hosted MongoDB
- Automatic backups
- IP whitelisting for security
- Connection pooling and retry logic

---

## 💡 Use Cases

### For Fraternity Members
1. **Quick Information Access**
   - "What are the membership requirements?"
   - "When is the next event?"
   - "What are the project guidelines?"

2. **Document Search**
   - Find specific information in uploaded documents
   - Search through event schedules, contact lists, guidelines

3. **Member Communication**
   - Direct messaging with other members
   - Contact management

### For Executives
1. **User Management**
   - View all registered members
   - Generate password reset codes
   - Administrative oversight

2. **Content Management**
   - Upload important documents
   - Organize fraternity information
   - Keep documents up-to-date

---

## 🎨 User Interface Features

### Main Chat Interface
- Clean, modern design
- Real-time message display
- File upload button
- Document management panel
- Search functionality
- Direct messaging toggle

### Authentication Screens
- Login page
- Signup page
- Forgot password flow
- Executive panel

### Document Management
- Document list view
- Document details
- Delete confirmation
- Upload status feedback

---

## 📊 Technical Highlights

### AI Integration
- **Model**: Google Gemini 2.5 Flash
- **Response Types**: 
  - Paragraph format for complex questions
  - Straightforward format for simple questions
- **Context Window**: Up to 8 document chunks
- **General Knowledge**: Always available, even without documents

### Document Processing
- **Supported Formats**: PDF, DOCX, TXT, HTML, Excel
- **Chunking Strategy**: Semantic sentence-based chunks
- **Search Algorithm**: Relevance scoring with query term matching
- **Storage**: MongoDB with efficient indexing

### Performance Optimizations
- Connection pooling for MongoDB
- Retry logic for database connections
- Efficient chunk retrieval
- Caching of document metadata

---

## 🔮 Future Enhancements

### Potential Features
- [ ] Voice input/output
- [ ] Document versioning
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Mobile app
- [ ] Integration with calendar systems
- [ ] Notification system
- [ ] Document collaboration features
- [ ] Advanced search filters
- [ ] Export conversations

---

## 📈 Key Metrics & Benefits

### Efficiency Gains
- **Instant Answers**: No need to manually search through documents
- **Time Savings**: Quick access to fraternity information
- **Centralized Knowledge**: All documents in one place
- **Multi-Device Access**: Same data everywhere

### User Experience
- **Natural Language**: Ask questions like talking to a person
- **Context-Aware**: Understands follow-up questions
- **Clean Interface**: Easy to use, no learning curve
- **Fast Responses**: Quick AI-powered answers

### Technical Benefits
- **Scalable**: Cloud-based architecture
- **Reliable**: Automatic retry and error handling
- **Secure**: Industry-standard authentication
- **Maintainable**: Clean code structure

---

## 🎓 Demo Scenarios

### Scenario 1: New Member Onboarding
1. New member signs up
2. Uploads membership guide PDF
3. Asks: "What are the requirements to join?"
4. Gets comprehensive answer from document + general knowledge

### Scenario 2: Event Planning
1. Executive uploads event calendar
2. Member asks: "When is the next social event?"
3. System searches calendar and provides date and details

### Scenario 3: Member Communication
1. Member searches for another member
2. Sends direct message
3. Conversation history maintained

### Scenario 4: Document Search
1. Member searches for "project guidelines"
2. System finds relevant sections
3. Member clicks to view full document

---

## 🏆 Competitive Advantages

1. **RAG Technology**: Combines document knowledge with AI general knowledge
2. **Fraternity-Specific**: Built specifically for KTP needs
3. **Multi-Feature**: Not just a chatbot - includes messaging, document management
4. **Cloud-Based**: Accessible from anywhere, any device
5. **Easy Deployment**: Ready for production with minimal setup
6. **Secure**: Enterprise-grade authentication and data protection

---

## 📝 Summary

**KTPilot** is a comprehensive AI-powered platform that:
- ✅ Provides intelligent answers from documents and general knowledge
- ✅ Enables seamless member communication
- ✅ Centralizes fraternity information
- ✅ Works across all devices with shared data
- ✅ Offers secure, scalable architecture
- ✅ Delivers excellent user experience

**Perfect for**: Fraternities, organizations, and teams that need intelligent information access and member communication tools.

---

## 📞 Questions & Discussion

Ready to answer questions about:
- Technical implementation details
- Deployment process
- Feature demonstrations
- Future roadmap
- Architecture decisions
- Security measures

---

*Presentation prepared for KTPilot RAG Bot*
*Last updated: 2025*


