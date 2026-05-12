# 🎓 AI Kids Learning Assistant

An interactive, AI-powered educational platform designed to make learning fun and engaging for children. This full-stack application features AI-generated content, interactive games, and a personalized learning buddy powered by Google's Gemini AI.

## ✨ Features

### 🎯 Core Learning Activities
- **📖 Story Generation** - AI creates age-appropriate stories with customizable topics
- **📝 Story Comprehension Quiz** - Automatically generates questions based on generated stories
- **🎲 General Knowledge Quiz** - Spelling and general knowledge quizzes tailored to age groups
- **🧮 Math Practice** - Interactive math problems (addition, subtraction, multiplication, division)
- **📚 Daily Routine Learning** - Context-aware language learning through daily activities
- **🌍 Translation** - Translate content to Telugu for multilingual learning

### 🎮 Interactive Games
- **🧠 Memory Matching Game** - Brain training with emoji-based memory games (animals, food, flowers, transport, sports, music)

### 🤖 AI Buddy Character
- **Personalized Avatar** - Create a unique superhero identity with custom name, superpower, and catchphrase
- **Context-Aware Messages** - Buddy responds differently based on activity context (story, quiz, math, etc.)
- **Voice Q&A** - Children can ask questions and get AI-powered educational responses

### 📊 User Features
- **User Authentication** - Secure login/signup with JWT and bcrypt
- **Profile Management** - Customize child name, favorite animal, and favorite color
- **Progress Tracking** - Leaderboard system to motivate learning

## 🛠️ Tech Stack

### Frontend (71.2% JavaScript)
- **React 19.1.1** - UI framework
- **Vite 7.1.2** - Fast build tool and dev server
- **Canvas Confetti** - Celebration animations
- **ESLint** - Code quality

### Backend (28.7% CSS, 0.1% HTML)
- **Express 5.1.0** - Node.js web framework
- **MongoDB 9.3.0** - Database with Mongoose ODM
- **Google Generative AI** - Gemini API for content generation
- **JWT** - Secure authentication
- **Bcrypt** - Password hashing
- **CORS** - Cross-origin requests handling

## 📁 Project Structure

```
ai-kids-learning-assistant/
├── frontend/                    # React app
│   ├── src/                    # Components and pages
│   ├── public/                 # Static assets
│   ├── index.html             # Entry point
│   ├── package.json           # Frontend dependencies
│   ├── vite.config.js         # Vite configuration
│   └── eslint.config.js       # Linting rules
├── backend/                    # Express server
│   ├── models/                # MongoDB schemas
│   ├── routes/                # API endpoints
│   ├── server.js              # Main server file
│   ├── package.json           # Backend dependencies
│   └── .gitignore
└── package.json               # Root configuration
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **MongoDB** (local or Atlas)
- **Google Generative AI API Key** (free tier available at [Google AI Studio](https://aistudio.google.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Soumika649/ai-kids-learning-assistant.git
   cd ai-kids-learning-assistant
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Create .env file
   cat > .env << EOF
   MONGO_URI=mongodb://localhost:27017/kids-learning
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=5000
   JWT_SECRET=your_jwt_secret_here
   EOF
   
   npm start
   ```

3. **Setup Frontend** (in new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

The application will be available at `http://localhost:5173` (Vite dev server)

## 📡 API Endpoints

### Authentication
- `POST /auth/signup` - Create new user account
- `POST /auth/login` - Login with credentials

### Learning Content
- `POST /story` - Generate age-appropriate story
  - Body: `{ age: number, topic: string }`
  
- `POST /quiz` - Generate quiz questions
  - Body: `{ type: "spelling" | "general", age: number }`
  
- `POST /story-quiz` - Generate comprehension questions from story
  - Body: `{ story: string, age: number }`
  
- `POST /math` - Generate math problems
  - Body: `{ age: number, operation: "addition" | "subtraction" | "multiplication" | "division" }`
  
- `POST /words` - Generate daily routine description
  - Body: `{ age: number }`
  
- `POST /translate` - Translate text to Telugu
  - Body: `{ text: string }`

### Avatar & Buddy
- `POST /avatar-name` - Generate superhero identity
  - Body: `{ childName: string, favoriteAnimal: string, favoriteColor: string }`
  
- `POST /buddy-message` - Get context-aware buddy messages
  - Body: `{ context: string, heroName: string, avatar: string, age: number, extra?: string }`
  
- `POST /buddy-ask` - Ask buddy a question
  - Body: `{ question: string, heroName: string, age: number }`

### Games
- `POST /memory-game` - Get memory game pairs
  - Body: `{ theme: "animals" | "food" | "flowers" | "transport" | "sports" | "music", count: number }`

## ⚙️ Rate Limiting

- **Limit**: 15 requests per minute per IP
- **Window**: 60 seconds
- **Status**: 429 (Too Many Requests)

All endpoints have built-in rate limiting to prevent abuse.

## 🔐 Security Features

- **Password Hashing** - Using bcrypt for secure password storage
- **JWT Authentication** - Stateless session management
- **CORS Protection** - Configured for safe cross-origin requests
- **Input Validation** - Backend validates all incoming data
- **Rate Limiting** - IP-based request throttling

## 🎨 Features Highlights

### Gamification
- 🏆 Leaderboard system for competition
- ✨ Confetti celebrations on victories
- 📈 Progress tracking and achievements

### AI-Powered Personalization
- Generates unique learning content for each child
- Age-appropriate language and complexity
- Culturally relevant examples (Indian context)
- Fallback content for graceful error handling

### Accessibility
- Simple English language
- Emoji-rich interface for visual learning
- Mobile-friendly design
- Voice Q&A support

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 👨‍💻 Author

**Soumika649** - [@Soumika649](https://github.com/Soumika649)

## 🙏 Acknowledgments

- [Google Generative AI](https://ai.google.dev) - Gemini API for content generation
- [React](https://react.dev) - UI library
- [Express.js](https://expressjs.com) - Backend framework
- [MongoDB](https://www.mongodb.com) - Database




