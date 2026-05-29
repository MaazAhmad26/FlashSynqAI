<div align="center">
  <img width="1200" height="475" alt="FlashSynqAI Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
  
  # 🚀 FlashSynqAI — Your AI-Powered Study Buddy
  
  [![Deploy to Render](https://render.com/images/deploy-to-render.svg)](https://render.com)
  [![Firebase](https://img.shields.io/badge/firebase-ffca28?style=flat&logo=firebase&logoColor=black)](https://firebase.google.com/)
  [![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)](https://react.dev/)
  [![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
  
  *Transform raw textbooks, notes, and PDFs into interactive learning hubs, instant summaries, custom quizzes, and continuous chat support.*
</div>

---

## ✨ Features

- 📚 **Document Archive**: Upload study materials and compile them into an organized digital library.
- 📝 **AI Summarization**: Instantly digest dense textbooks or notes into structural, readable bulleted summaries.
- 🧠 **Smart Quizzes**: Generate personalized, document-specific quizzes to test your understanding of the material.
- 🏆 **Integrated Analytics**: Track your progress over time with a clean quiz performance breakdown nested directly in your history.
- 💬 **AI Study Companion**: Chat live with **FlashSynq AI**—a tailored chatbot that keeps you aligned with your studies, takes quick notes, and helps clarify hard topics.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/) (Vite, TypeScript, Tailwind CSS, Motion / Framer Motion, Lucide icons)
- **Backend**: [Express](https://expressjs.com/) (Node.js runtime, API Compression, Rate Limiter)
- **AI Core**: [Google Gemini 1.5/2.5 API](https://ai.google.dev/) (Native structured JSON mode output)
- **Database / Auth**: [Firebase](https://firebase.google.com/) (Auth & Firestore integration)
- **Bundler & Tooling**: [esbuild](https://esbuild.github.io/), TypeScript, TSX

---

## ⚙️ Getting Started Locally

### Prerequisites
- **Node.js** (v18 or higher recommended)
- A **Gemini API Key** (Get one at [Google AI Studio](https://aistudio.google.com/))

### Setup
1. **Clone the repository:**
   ```bash
   git clone https://github.com/MaazAhmad26/FlashSynqAI.git
   cd FlashSynqAI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```

4. **Run the app in development mode:**
   ```bash
   npm run dev
   ```
   *Your app will be running at [http://localhost:3000](http://localhost:3000)*

---

## 🚀 Deployment

### 1. Deploying to Render (Recommended & Free)
This repository is pre-configured with a blueprint `render.yaml` for instant deployment:
1. Go to the [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Blueprint**.
3. Link your GitHub account and select your `FlashSynqAI` repository.
4. Render will parse the `render.yaml` automatically. When prompted, add your **`GEMINI_API_KEY`** environment variable.
5. Click **Apply / Create**. 

### 2. Deploying to Firebase
If you prefer Firebase Hosting + Cloud Functions (requires the Blaze pay-as-you-go plan):
1. Authenticate with the Firebase CLI:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add
   ```
2. Build the project:
   ```bash
   npm run build
   ```
3. Install backend cloud function dependencies:
   ```bash
   cd firebase/functions
   npm install
   cd ../..
   ```
4. Deploy to Firebase:
   ```bash
   npx firebase-tools deploy
   ```

---

## 📂 Directory Structure

```
├── backend/src/          # Express API server & AI modules (chat, quiz, analysis)
├── frontend/src/         # React SPA frontend (components, types, firebase integrations)
├── firebase/functions/   # Firebase serverless environment (built output ready for deployment)
├── dist/                 # Static production bundle folder (generated during build)
├── render.yaml           # PaaS blueprint configuration file for Render
├── firebase.json         # Firebase project configuration
└── package.json          # Monorepo build and start script configurations
```
