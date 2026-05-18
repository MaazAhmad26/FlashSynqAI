import { useState, useEffect } from "react";
import { FirestoreDB as MockDB } from "../lib/firestore-db";
import { Document, Progress, Quiz } from "../types";
import { FileText, Calendar, Trophy, ChevronRight, BookOpen, ChevronLeft } from "lucide-react";
import { motion } from "motion/react";

interface HistoryViewProps {
  user: any;
  onBack: () => void;
}

export default function HistoryView({ user, onBack }: HistoryViewProps) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const dDocs = await MockDB.list("documents", { field: "userId", value: user.uid });
        setDocs(dDocs);

        const pProgress = await MockDB.list("progress", { field: "userId", value: user.uid });
        setProgress(pProgress);

        const qQuizzes = await MockDB.list("quizzes", { field: "userId", value: user.uid });
        setQuizzes(qQuizzes);
      } catch (err) {
        console.error("History fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user.uid]);

  return (
    <div className="space-y-12 pb-20 max-w-6xl mx-auto">
      <div className="mb-2">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-text-muted hover:text-text-main transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
      <header>
        <h2 className="text-4xl font-sans font-bold tracking-tight text-text-main mb-2">Learning History</h2>
        <p className="text-text-muted text-lg font-medium">Your entire intellectual journey, organized.</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-10">
        <section>
          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-bold text-text-main">Document Archive</h3>
          </div>
          
          <div className="space-y-4">
            {docs.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card p-6 rounded-[24px] border border-border shadow-sm flex items-center justify-between group cursor-pointer hover:border-primary/20 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-bg rounded-xl border border-border group-hover:bg-primary/5 transition-colors">
                    <FileText className="w-6 h-6 text-text-muted group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-bold text-text-main group-hover:text-primary transition-colors line-clamp-1">{doc.title}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1.5 text-[11px] text-text-muted font-bold">
                        <Calendar className="w-3 h-3" />
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                      <span className="w-1 h-1 bg-border rounded-full" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary px-2 py-0.5 bg-primary/10 rounded">
                        {doc.analysis?.tags[0] || "General"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center text-border group-hover:text-primary translate-x-0 group-hover:translate-x-1 transition-all">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </motion.div>
            ))}

            {docs.length === 0 && !loading && (
              <div className="text-center py-20 bg-card rounded-[24px] border border-dashed border-border shadow-sm">
                <p className="text-text-muted font-bold text-sm uppercase tracking-widest">Archive empty</p>
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-8">
            <Trophy className="w-5 h-5 text-warning" />
            <h3 className="text-xl font-bold text-text-main">Performance</h3>
          </div>

          <div className="space-y-4">
            {progress.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-text-main p-6 rounded-[24px] text-bg flex items-center justify-between shadow-lg shadow-text-main/10"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-card/10 flex items-center justify-center font-bold text-xl text-primary border border-bg/10">
                    {Math.round((p.score / p.totalQuestions) * 100)}%
                  </div>
                  <div>
                    <h4 className="font-bold text-bg opacity-90">
                      {(() => {
                        const quiz = quizzes.find(q => q.id === p.quizId);
                        if (quiz?.title) return quiz.title;
                        const parentDoc = quiz ? docs.find(d => d.id === quiz.documentId) : null;
                        return parentDoc?.title || "Learning Quiz";
                      })()}
                    </h4>
                    <p className="text-[11px] text-bg opacity-50 mt-1 font-bold uppercase tracking-wider">
                      {p.score}/{p.totalQuestions} Correct • {new Date(p.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-success" />
              </motion.div>
            ))}

            {progress.length === 0 && !loading && (
              <div className="text-center py-20 bg-card rounded-[24px] border border-dashed border-border shadow-sm">
                <p className="text-text-muted font-bold text-sm uppercase tracking-widest">No records yet</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
