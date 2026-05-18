import { useState, useEffect } from "react";
import { Document, Quiz, Progress } from "../types";
import { FirestoreDB as MockDB } from "../lib/firestore-db";
import { FileText, BrainCircuit, ListChecks, Sparkles, ChevronLeft, Loader2, Trophy, Clock } from "lucide-react";
import { motion } from "motion/react";

interface AnalysisResultProps {
  user: any;
  doc: Document;
  onGenerateQuiz: (quiz: Quiz) => void;
  onBack: () => void;
}

const STUDY_TIPS = [
  "Use the mnemonics provided in the key points to anchor complex information. Research shows associative learning is 80% more effective.",
  "Try the 'Pomodoro Technique': Study for 25 minutes, then take a 5-minute break to keep your mind fresh.",
  "Teaching someone else is the best way to learn. Try explaining these key points to a friend or even an AI!",
  "Review your notes within 24 hours of first reading them to significantly increase long-term retention.",
  "Active recall (like our quizzes) is far more effective than passive reading. Test yourself frequently!",
  "Stay hydrated! Your brain is 75% water, and even mild dehydration can impact concentration and memory.",
  "Change your environment. Sometimes studying in a new location can help stimulate your brain and improve focus."
];

export default function AnalysisResult({ user, doc, onGenerateQuiz, onBack }: AnalysisResultProps) {
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [docProgress, setDocProgress] = useState<Progress[]>([]);
  const [randomTip, setRandomTip] = useState("");

  useEffect(() => {
    setRandomTip(STUDY_TIPS[Math.floor(Math.random() * STUDY_TIPS.length)]);
    
    async function fetchDocProgress() {
      try {
        const progress = await MockDB.list("progress", { field: "quizId", value: doc.id }); // Assuming quizId maps to docId for simplicity or we need a real mapping
        // Actually, our Progress type has quizId. Quizzes have documentId.
        // Let's fetch all quizzes for this doc first, then their progress.
        const quizzes = await MockDB.list("quizzes", { field: "documentId", value: doc.id });
        const quizIds = quizzes.map(q => q.id);
        
        const allProgress = await MockDB.list("progress");
        const relevantProgress = allProgress.filter((p: Progress) => quizIds.includes(p.quizId));
        setDocProgress(relevantProgress.sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()));
      } catch (err) {
        console.error("Doc progress fetch error:", err);
      }
    }
    fetchDocProgress();
  }, [doc.id]);

  const handleGenerateQuiz = async () => {
    const userId = user?.uid || "local-user";
    setGeneratingQuiz(true);

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: doc.analysis?.summary + "\n" + doc.analysis?.keyPoints.join("\n") }),
      });

      if (!response.ok) throw new Error("Failed to generate quiz");

      const quizData = await response.json();
      const fullQuiz = {
        ...quizData,
        documentId: doc.id,
        userId: userId,
        createdAt: new Date().toISOString(),
      };

      const quizId = await MockDB.add("quizzes", fullQuiz);
      onGenerateQuiz({ id: quizId, ...fullQuiz } as Quiz);
    } catch (err) {
      console.error("Quiz Gen Error:", err);
    } finally {
      setGeneratingQuiz(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-text-muted hover:text-text-main transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
              AI Analysis Complete
            </span>
          </div>
          <h2 className="text-4xl font-sans font-bold tracking-tight text-text-main">{doc.title}</h2>
        </div>
        <button
          onClick={handleGenerateQuiz}
          disabled={generatingQuiz}
          className="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-bold hover:scale-105 shadow-md shadow-primary/20 transition-all disabled:opacity-50"
        >
          {generatingQuiz ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Quiz...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Quiz
            </>
          )}
        </button>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-card p-8 rounded-[24px] border border-border shadow-sm relative overflow-hidden">
            <div className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-border pb-4">
              <FileText className="w-4 h-4 text-primary" />
              Executive Summary
            </div>
            <p className="text-text-main leading-relaxed text-lg font-sans pt-2">
              {doc.analysis?.summary}
            </p>
          </section>

          <section className="bg-card p-8 rounded-[24px] border border-border shadow-sm">
            <div className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-border pb-4">
              <ListChecks className="w-4 h-4 text-success" />
              Key Insights & Mnemonics
            </div>
            <div className="space-y-4 pt-2">
              {doc.analysis?.keyPoints.map((point, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 p-5 rounded-xl bg-bg border border-border border-l-4 border-l-success"
                >
                  <p className="text-text-main font-medium leading-relaxed font-sans">{point}</p>
                </motion.div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-8">
          <section className="bg-card p-8 rounded-[24px] border border-border shadow-sm">
            <div className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-6 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-accent" />
              Core Concepts
            </div>
            <div className="flex flex-wrap gap-2">
              {doc.analysis?.tags.map((tag, i) => (
                <span key={i} className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 bg-bg text-text-muted border border-border rounded-lg hover:bg-card transition-colors cursor-default">
                  {tag}
                </span>
              ))}
            </div>
          </section>

          <section className="bg-card p-8 rounded-[24px] border border-border shadow-sm">
            <div className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Recent Activities
            </div>
            <div className="space-y-4">
              {docProgress.length > 0 ? docProgress.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-bg rounded-xl border border-border">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-warning" />
                    <span className="text-[13px] font-bold text-text-main">{p.score}/{p.totalQuestions}</span>
                  </div>
                  <span className="text-[10px] font-bold text-text-muted">{new Date(p.completedAt).toLocaleDateString()}</span>
                </div>
              )) : (
                <div className="text-center py-4 border border-dashed border-border rounded-xl">
                  <p className="text-[11px] text-text-muted font-medium italic">No quizzes taken yet</p>
                </div>
              )}
            </div>
          </section>

          <div className="p-6 bg-warning/10 rounded-[24px] border border-warning/20">
            <h4 className="font-bold text-warning mb-2 text-sm uppercase tracking-wider">Study Tip</h4>
            <p className="text-[13px] text-text-main leading-relaxed font-medium">
              {randomTip}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
