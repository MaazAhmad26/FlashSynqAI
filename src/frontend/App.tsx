/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Document, Quiz } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { Zap } from "lucide-react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "./lib/firebase";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import DocumentUpload from "./components/DocumentUpload";
import AnalysisResult from "./components/AnalysisResult";
import QuizView from "./components/QuizView";
import HistoryView from "./components/HistoryView";
import FlashcardsView from "./components/FlashcardsView";
import FloatingAIAssistant from "./components/FloatingAIAssistant";
import AuthModal from "./components/AuthModal";
import LandingPage from "./components/LandingPage";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" ||
        (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });

  const [view, setView] = useState<"dashboard" | "upload" | "analysis" | "quiz" | "history" | "flashcards">("dashboard");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (firebaseUser) setShowAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Theme persistence
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const logout = async () => {
    await signOut(auth);
    setView("dashboard");
    setSelectedDoc(null);
    setSelectedQuiz(null);
  };

  // Loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <motion.div
          animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <img src="/logo.png" alt="FlashSynqAI Loading" className="w-16 h-16 object-contain rounded-2xl shadow-md" />
        </motion.div>
      </div>
    );
  }

  // Not logged in: show Landing Page
  if (!user) {
    return (
      <div className="min-h-screen bg-bg text-text-main font-sans">
        <LandingPage onLogin={() => setShowAuth(true)} />
        <AnimatePresence>
          {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        </AnimatePresence>
      </div>
    );
  }

  // Logged in: show the main app
  return (
    <div className="min-h-screen bg-bg text-text-main font-sans flex flex-col">
      <Navbar
        user={user}
        onLogout={logout}
        currentView={view}
        setView={setView}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <main className="max-w-7xl w-full mx-auto px-4 py-8 flex-1">
        <AnimatePresence mode="wait">
          {view === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Dashboard
                user={user}
                onStartUpload={() => setView("upload")}
                onViewDoc={(doc) => {
                  setSelectedDoc(doc);
                  setView("analysis");
                }}
                onStartFlashcards={(doc) => {
                  setSelectedDoc(doc);
                  setView("flashcards");
                }}
                onGenerateQuiz={(quiz) => {
                  setSelectedQuiz(quiz);
                  setView("quiz");
                }}
                onViewHistory={() => setView("history")}
              />
            </motion.div>
          )}

          {view === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DocumentUpload
                user={user}
                onSuccess={(doc) => {
                  setSelectedDoc(doc);
                  setView("analysis");
                }}
                onCancel={() => setView("dashboard")}
              />
            </motion.div>
          )}

          {view === "analysis" && selectedDoc && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AnalysisResult
                user={user}
                doc={selectedDoc}
                onGenerateQuiz={(quiz) => {
                  setSelectedQuiz(quiz);
                  setView("quiz");
                }}
                onBack={() => setView("dashboard")}
              />
            </motion.div>
          )}

          {view === "quiz" && selectedQuiz && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <QuizView
                user={user}
                quiz={selectedQuiz}
                onComplete={() => setView("dashboard")}
                onBack={() => setView("dashboard")}
              />
            </motion.div>
          )}

          {view === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <HistoryView user={user} onBack={() => setView("dashboard")} />
            </motion.div>
          )}

          {view === "flashcards" && selectedDoc && (
            <motion.div
              key="flashcards"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <FlashcardsView
                doc={selectedDoc}
                onBack={() => setView("dashboard")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="w-full py-6 mt-auto">
        <p className="text-center text-[12px] font-medium text-text-muted">
          &copy; {new Date().getFullYear()} FlashSynqAI. All rights reserved. Built for intelligent learning.
        </p>
      </footer>

      {view !== "quiz" && <FloatingAIAssistant user={user} />}
    </div>
  );
}
