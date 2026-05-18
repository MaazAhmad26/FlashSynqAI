import { motion } from "motion/react";
import { Zap, BookOpen, BrainCircuit, Trophy, ArrowRight, Sparkles } from "lucide-react";

interface LandingPageProps {
  onLogin: () => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-bg overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <header className="relative z-10 max-w-7xl mx-auto px-4 h-24 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="FlashSynqAI Logo" className="w-7 h-7 object-contain shrink-0 rounded-lg shadow-sm" />
          <span className="font-sans font-bold text-xl tracking-tight text-text-main">
            FLASHSYNQ<span className="text-primary">AI</span>
          </span>
        </div>
        <button 
          onClick={onLogin}
          className="bg-text-main text-bg px-6 py-2.5 rounded-full font-bold text-[13px] hover:scale-105 transition-all shadow-lg shadow-text-main/10"
        >
          Sign In
        </button>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 pt-12 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-card border border-border rounded-full text-[10px] font-bold text-primary uppercase tracking-widest mb-6 shadow-sm">
                <Sparkles className="w-3 h-3" />
                Next-Gen Learning Platform
              </div>
              <h1 className="text-7xl font-sans font-bold leading-[0.9] tracking-tighter text-text-main mb-8">
                Master any subject <br />
                <span className="text-primary">with AI intelligence.</span>
              </h1>
              <p className="text-lg text-text-muted mb-10 max-w-md leading-relaxed font-medium">
                Analyze complex documents, extract key mnemonics, and generate personalized quizzes in seconds.
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={onLogin}
                  className="group flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-accent transition-all shadow-xl shadow-primary/20"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-bg overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="User" />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-card flex items-center justify-center text-[10px] font-bold text-text-muted">
                    +2k
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4 p-4 bg-card/50 backdrop-blur border border-border rounded-[40px] shadow-2xl">
              <div className="bg-card border border-border rounded-[24px] p-6 shadow-sm">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="h-2 w-12 bg-border rounded-full mb-2" />
                <div className="h-2 w-full bg-border/40 rounded-full" />
              </div>
              <div className="bg-primary text-white rounded-[24px] p-6 shadow-lg shadow-primary/20">
                <div className="text-[24px] font-bold mb-1">92%</div>
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">Avg. Accuracy</div>
              </div>
              <div className="col-span-2 bg-text-main text-bg rounded-[24px] p-8 flex items-center justify-between">
                <div>
                   <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Live Session</div>
                   <div className="text-xl font-bold">Document Analysis</div>
                </div>
                <div className="flex gap-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-1 h-6 bg-primary rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
