/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, lazy, Suspense } from "react";
import { Document, Quiz } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { Zap } from "lucide-react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "./lib/firebase";
import Navbar from "./components/Navbar";

// Lazy load views to minimize initial JavaScript bundle size and optimize loading performance
const Dashboard = lazy(() => import("./components/Dashboard"));
const DocumentUpload = lazy(() => import("./components/DocumentUpload"));
const AnalysisResult = lazy(() => import("./components/AnalysisResult"));
const QuizView = lazy(() => import("./components/QuizView"));
const HistoryView = lazy(() => import("./components/HistoryView"));
const FlashcardsView = lazy(() => import("./components/FlashcardsView"));
const FloatingAIAssistant = lazy(() => import("./components/FloatingAIAssistant"));
const AuthModal = lazy(() => import("./components/AuthModal"));
const LandingPage = lazy(() => import("./components/LandingPage"));

// Premium spinner fallback for lazy components
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px] w-full">
    <motion.div
      className="flex flex-col items-center gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="w-10 h-10 border-4 border-[#ffaa00] border-t-transparent rounded-full animate-spin" />
      <span className="text-[12px] font-semibold text-text-muted tracking-wider animate-pulse uppercase">Loading View...</span>
    </motion.div>
  </div>
);

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
        <Suspense fallback={<PageLoader />}>
          <LandingPage onLogin={() => setShowAuth(true)} />
          <AnimatePresence>
            {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
          </AnimatePresence>
        </Suspense>
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
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
      </main>

      <footer className="w-full py-6 mt-auto">
        <p className="text-center text-[12px] font-medium text-text-muted">
          &copy; {new Date().getFullYear()} FlashSynqAI. All rights reserved. Built for intelligent learning.
        </p>
      </footer>

      {view !== "quiz" && (
        <Suspense fallback={null}>
          <FloatingAIAssistant user={user} />
        </Suspense>
      )}
    </div>
  );
}
