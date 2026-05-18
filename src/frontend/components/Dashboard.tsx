import React, { useState, useEffect } from "react";
import { FirestoreDB as MockDB } from "../lib/firestore-db";
import { Document, Progress as ProgressType, Quiz } from "../types";
import { FileText, Plus, ArrowRight, Clock, Trophy, Book, Zap, Loader2, Trash2 } from "lucide-react";
import { motion } from "motion/react";

interface DashboardProps {
  user: any;
  onStartUpload: () => void;
  onViewDoc: (doc: Document) => void;
  onStartFlashcards: (doc: Document) => void;
  onGenerateQuiz: (quiz: Quiz) => void;
  onViewHistory: () => void;
}

export default function Dashboard({ user, onStartUpload, onViewDoc, onStartFlashcards, onGenerateQuiz, onViewHistory }: DashboardProps) {
  const [recentDocs, setRecentDocs] = useState<Document[]>([]);
  const [stats, setStats] = useState({ totalDocs: 0, completedQuizzes: 0, avgScore: 0, lastScore: 0, diffLabel: "No sessions yet", isPositive: true });
  const [latestQuizId, setLatestQuizId] = useState<string | null>(null);
  const [docScores, setDocScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showTopicSelector, setShowTopicSelector] = useState(false);
  const [generatingDocId, setGeneratingDocId] = useState<string | null>(null);

  const handleDeleteDoc = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!docId) return;
    await MockDB.delete("documents", docId);
    setRecentDocs(prev => prev.filter(doc => doc.id !== docId));
    setStats(prev => ({ ...prev, totalDocs: Math.max(0, prev.totalDocs - 1) }));
  };

  const handleClearLog = async () => {
    if (!confirm("Are you sure you want to delete all your activity history? This cannot be undone.")) return;
    const allDocs = await MockDB.list("documents", { field: "userId", value: user.uid });
    for (const doc of allDocs) {
      if (doc.id) {
        await MockDB.delete("documents", doc.id);
      }
    }
    setRecentDocs([]);
    setStats(prev => ({ ...prev, totalDocs: 0 }));
  };



  const handleGenerateNewQuiz = async (doc: Document) => {
    setGeneratingDocId(doc.id);

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: (doc.analysis?.summary || "") + "\n" + (doc.analysis?.keyPoints?.join("\n") || "") }),
      });

      if (!response.ok) throw new Error("Failed to generate quiz");

      const quizData = await response.json();
      const fullQuiz = {
        ...quizData,
        documentId: doc.id,
        userId: user.uid,
        createdAt: new Date().toISOString(),
      };

      const quizId = await MockDB.add("quizzes", fullQuiz);
      onGenerateQuiz({ ...fullQuiz, id: quizId } as Quiz);
      setShowTopicSelector(false);
    } catch (err) {
      console.error("Quiz Gen Error:", err);
    } finally {
      setGeneratingDocId(null);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const docs = await MockDB.list("documents", { field: "userId", value: user.uid });
        const topDocs = docs.slice(0, 5);
        setRecentDocs(topDocs);

        const progress = await MockDB.list("progress", { field: "userId", value: user.uid });
        const quizzes = await MockDB.list("quizzes", { field: "userId", value: user.uid });
        
        const scoresMap: Record<string, number> = {};
        topDocs.forEach(doc => {
           if (!doc.id) return;
           const docQuizzes = quizzes.filter(q => q.documentId === doc.id);
           const quizIds = new Set(docQuizzes.map(q => q.id));
           const docProgress = progress.filter(p => quizIds.has(p.quizId));
           if (docProgress.length > 0) {
             const avg = docProgress.reduce((acc, p) => acc + (p.score / p.totalQuestions), 0) / docProgress.length;
             scoresMap[doc.id] = Math.round(avg * 100);
           } else {
             scoresMap[doc.id] = -1;
           }
        });
        setDocScores(scoresMap);
        
        let lastScore = 0;
        let diffLabel = "No sessions yet";
        let isPositive = true;

        if (progress.length > 0) {
          const sortedProgress = [...progress].sort((a: any, b: any) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime());
          setLatestQuizId(sortedProgress[0].quizId);
          lastScore = Math.round((sortedProgress[0].score / sortedProgress[0].totalQuestions) * 100);

          if (sortedProgress.length > 1) {
             const previousScore = Math.round((sortedProgress[1].score / sortedProgress[1].totalQuestions) * 100);
             const scoreDiff = lastScore - previousScore;
             isPositive = scoreDiff >= 0;
             diffLabel = `${isPositive ? '+' : ''}${scoreDiff}% from last session`;
          } else {
             diffLabel = `+${lastScore}% initial score`;
          }
        }

        setStats({
          totalDocs: docs.length,
          completedQuizzes: progress.length,
          avgScore: progress.length > 0 
            ? Math.round(progress.reduce((acc: number, p: ProgressType) => acc + (p.score / p.totalQuestions), 0) / progress.length * 100)
            : 0,
          lastScore,
          diffLabel,
          isPositive
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user.uid]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-none md:grid-rows-3 gap-5 min-h-[600px]">
      {/* Hero Card - Document Analysis */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="md:col-span-2 md:row-span-2 bg-card border border-border rounded-[24px] p-8 flex flex-col relative overflow-hidden bg-[linear-gradient(135deg,var(--color-card)_0%,var(--color-bg)_100%)] group"
      >
        <div className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-6 flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          Document Analysis
        </div>
        
        <div 
          onClick={onStartUpload}
          className="flex-1 border-2 border-dashed border-border rounded-[16px] flex flex-col items-center justify-center gap-3 bg-card/50 hover:bg-card/80 transition-all cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center text-primary">
             <Plus className="w-6 h-6" />
          </div>
          <p className="font-bold text-primary">Upload Course Materials</p>
          <p className="text-[11px] text-text-muted">PDF, DOCX, PPT, TXT supported</p>
        </div>

        <div className="mt-8 flex items-center gap-4">
           {recentDocs[0] ? (
             <div 
               onClick={() => onViewDoc(recentDocs[0])}
               className="w-full flex items-center gap-3 p-3 bg-card border border-border rounded-xl shadow-sm cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group/card"
             >
               <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover/card:scale-110 transition-transform">
                 <FileText className="w-5 h-5" />
               </div>
               <div className="flex-1">
                 <p className="text-[13px] font-bold line-clamp-1 group-hover/card:text-primary transition-colors">{recentDocs[0].title}</p>
                 <div className="flex items-center gap-2 mt-1">
                   <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                     <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${Math.max(0, docScores[recentDocs[0].id as string] || 0)}%` }} />
                   </div>
                   <span className="text-[10px] font-bold text-primary">{Math.max(0, docScores[recentDocs[0].id as string] || 0)}%</span>
                 </div>
               </div>
               <ArrowRight className="w-4 h-4 text-text-muted opacity-0 group-hover/card:opacity-100 group-hover/card:translate-x-1 transition-all" />
             </div>
           ) : (
             <p className="text-xs text-text-muted italic">No recent documents analyzed yet.</p>
           )}
        </div>
      </motion.div>

      {/* Progress Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-[24px] p-8 flex flex-col"
      >
        <div className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-4">Learning Mastery</div>
        <div className="mt-auto">
          <div className="text-[36px] font-bold tracking-tight text-text-main">{stats.avgScore}%</div>
          <div className={`text-[12px] font-medium ${stats.isPositive ? 'text-success' : 'text-danger'}`}>{stats.diffLabel}</div>
          <div className="flex gap-1.5 mt-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`flex-1 h-1 rounded-full ${stats.avgScore >= (i * 25) - 24 && stats.avgScore > 0 ? (stats.avgScore < 50 ? 'bg-warning' : 'bg-success') : 'bg-border'}`} />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Key Points / Tags Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="md:row-span-2 bg-card border border-border rounded-[24px] p-8 flex flex-col"
      >
        <div className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-6">Quick Tags</div>
        <div className="flex flex-wrap gap-2">
          {recentDocs.flatMap(d => d.analysis?.tags || []).slice(0, 15).map((tag, i) => (
             <span key={i} className="text-[10px] px-2 py-1 bg-bg border border-border rounded-md text-text-muted font-mono lowercase">
               {tag}
             </span>
          ))}
        </div>
        <div className="mt-auto pt-6 border-t border-dashed border-border">
          <button 
            disabled={recentDocs.length === 0}
            onClick={() => recentDocs[0] && onStartFlashcards(recentDocs[0])}
            className="w-full py-3 border border-dashed border-primary text-primary text-[11px] font-bold rounded-xl hover:bg-primary/5 transition-colors disabled:opacity-30"
          >
            Generate Flashcards
          </button>
        </div>
      </motion.div>

      {/* Quiz Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="md:col-span-2 bg-card border border-border rounded-[24px] p-8 flex flex-col"
      >
        <div className="text-[12px] font-semibold text-text-muted uppercase tracking-wider mb-6">Smart Quizzes</div>
        <div className="grid grid-cols-2 gap-4">
          <div 
            onClick={() => setShowTopicSelector(true)}
            className="flex items-center gap-3 p-3 border border-warning rounded-xl bg-warning/5 cursor-pointer hover:border-warning/50 transition-colors"
          >
             <div className="w-8 h-8 bg-warning rounded-lg flex items-center justify-center text-white">
               ?
             </div>
             <div>
               <p className="text-[13px] font-bold">New Quiz</p>
               <p className="text-[10px] text-text-muted">Generate from existing</p>
             </div>
          </div>
          <div 
            onClick={onViewHistory}
            className="flex items-center gap-3 p-3 border border-purple-500/50 rounded-xl bg-purple-500/5 cursor-pointer hover:border-purple-500 transition-colors group"
          >
             <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
               <Clock className="w-4 h-4" />
             </div>
             <div>
               <p className="text-[13px] font-bold text-text-main group-hover:text-purple-500 transition-colors">Study History</p>
               <p className="text-[10px] text-purple-500/80 font-medium">View past performance</p>
             </div>
          </div>
        </div>
      </motion.div>

      {/* Recent History Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card border border-border rounded-[24px] p-8 flex flex-col relative"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Activity Log</div>
          {recentDocs.length > 0 && (
            <button
              onClick={handleClearLog}
              className="text-[10px] text-danger hover:text-danger/80 font-bold uppercase tracking-wider transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
        <div className="space-y-3 mt-4 overflow-y-auto">
          {recentDocs.length === 0 ? (
            <p className="text-xs text-text-muted italic py-4">No activity yet.</p>
          ) : (
            recentDocs.map(doc => {
              const score = docScores[doc.id as string];
              const hasScore = score !== undefined && score !== -1;
              return (
                <div key={doc.id} onClick={() => onViewDoc(doc)} className="flex items-center justify-between p-2 rounded-lg hover:bg-bg transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-1.5 h-1.5 rounded-full bg-border group-hover:bg-primary transition-colors shrink-0" />
                    <p className="text-[11px] font-medium text-text-muted group-hover:text-text-main line-clamp-1">{doc.title}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {hasScore ? (
                      <span className={`text-[11px] font-bold tabular-nums ${score >= 80 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-danger'}`}>
                        {score}%
                      </span>
                    ) : (
                      <span className="text-[10px] text-text-muted font-medium italic">No quiz</span>
                    )}
                    <button 
                      onClick={(e) => handleDeleteDoc(doc.id as string, e)}
                      className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>

      {showTopicSelector && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-[24px] p-6 max-w-md w-full shadow-xl"
          >
            <h3 className="text-lg font-bold mb-4 font-sans text-text-main">Select a Topic</h3>
            {generatingDocId ? (
               <div className="flex flex-col items-center py-8">
                 <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                 <p className="font-medium text-text-main">Generating Quiz...</p>
               </div>
            ) : (
               <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                 {recentDocs.map(doc => (
                   <div 
                     key={doc.id}
                     onClick={() => handleGenerateNewQuiz(doc)}
                     className="p-3 border border-border rounded-xl hover:border-primary cursor-pointer transition-colors group"
                   >
                     <p className="font-bold text-[13px] text-text-main group-hover:text-primary transition-colors">{doc.title}</p>
                     <p className="text-[11px] text-text-muted mt-1 line-clamp-1">{doc.analysis?.summary}</p>
                   </div>
                 ))}
                 {recentDocs.length === 0 && (
                   <p className="text-center text-sm text-text-muted py-4">No recent documents available.</p>
                 )}
               </div>
            )}
            {!generatingDocId && (
              <button 
                onClick={() => setShowTopicSelector(false)}
                className="mt-4 w-full py-3 bg-bg text-text-main font-bold rounded-xl hover:bg-border transition-colors text-sm"
              >
                Cancel
              </button>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
