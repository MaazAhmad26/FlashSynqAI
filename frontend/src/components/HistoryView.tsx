import { useState, useEffect } from "react";
import { FirestoreDB as MockDB } from "../lib/firestore-db";
import { Document, Progress, Quiz } from "../types";
import { FileText, Calendar, ChevronRight, ChevronDown, BookOpen, ChevronLeft, Trash2, Trophy } from "lucide-react";
import { motion } from "motion/react";

interface HistoryViewProps {
  user: any;
  onBack: () => void;
}

export default function HistoryView({ user, onBack }: HistoryViewProps) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);
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

  const handleDeleteDoc = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this document?")) return;
    
    try {
      // Cascade delete related quizzes and progress
      const relatedQuizzes = quizzes.filter(q => q.documentId === docId);
      for (const quiz of relatedQuizzes) {
        if (quiz.id) {
          const relatedProgress = progress.filter(p => p.quizId === quiz.id);
          for (const p of relatedProgress) {
            if (p.id) {
              await MockDB.delete("progress", p.id);
              setProgress(prev => prev.filter(item => item.id !== p.id));
            }
          }
          await MockDB.delete("quizzes", quiz.id);
          setQuizzes(prev => prev.filter(item => item.id !== quiz.id));
        }
      }

      await MockDB.delete("documents", docId);
      setDocs((prev) => prev.filter(d => d.id !== docId));
      if (expandedDocId === docId) {
        setExpandedDocId(null);
      }
    } catch (err) {
      console.error("Failed to delete document:", err);
      alert("Failed to delete document.");
    }
  };

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

      <div className="grid gap-10 max-w-3xl mx-auto w-full">
        <section>
          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-bold text-text-main">Document Archive</h3>
          </div>
          
          <div className="space-y-4">
            {docs.map((doc, i) => {
              const isExpanded = expandedDocId === doc.id;
              const docQuizzes = quizzes.filter(q => q.documentId === doc.id);
              const docProgress = progress.filter(p => docQuizzes.some(q => q.id === p.quizId));

              return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card p-6 rounded-[24px] border border-border shadow-sm flex flex-col group cursor-pointer hover:border-primary/20 transition-all"
                onClick={() => setExpandedDocId(isExpanded ? null : doc.id)}
              >
                <div className="flex items-center justify-between w-full">
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
                          {doc.analysis?.tags?.[0] || "General"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-border group-hover:text-primary transition-all">
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </div>
                </div>

                {isExpanded && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-6 pt-6 border-t border-border/50 text-sm overflow-hidden"
                  >
                    {doc.analysis?.summary && (
                      <div className="mb-6">
                        <h5 className="font-bold text-text-main mb-2">Summary</h5>
                        <p className="text-text-muted leading-relaxed">{doc.analysis.summary}</p>
                      </div>
                    )}

                    {docProgress.length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-bold text-text-main mb-3 flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-warning" /> Quiz Performance
                        </h5>
                        <div className="space-y-3">
                          {docProgress.map((p) => {
                            const quiz = docQuizzes.find(q => q.id === p.quizId);
                            const percent = Math.round((p.score / p.totalQuestions) * 100);
                            return (
                              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-bg border border-border">
                                <div>
                                  <div className="font-bold text-text-main text-sm">{quiz?.title || "Learning Quiz"}</div>
                                  <div className="text-[11px] text-text-muted mt-0.5">
                                    {new Date(p.completedAt).toLocaleDateString()}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs font-bold text-text-muted">{p.score} / {p.totalQuestions} correct</span>
                                  <div className={`px-2 py-1 rounded text-xs font-bold ${percent >= 70 ? 'bg-success/10 text-success' : percent >= 40 ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'}`}>
                                    {percent}%
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={(e) => handleDeleteDoc(e, doc.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-error/10 text-error hover:bg-error hover:text-white rounded-lg transition-colors font-bold text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Document
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
              );
            })}

            {docs.length === 0 && !loading && (
              <div className="text-center py-20 bg-card rounded-[24px] border border-dashed border-border shadow-sm">
                <p className="text-text-muted font-bold text-sm uppercase tracking-widest">Archive empty</p>
              </div>
            )}
          </div>
        </section>


      </div>
    </div>
  );
}
