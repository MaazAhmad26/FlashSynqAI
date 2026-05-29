import { useState } from "react";
import { Quiz, Progress } from "../types";
import { FirestoreDB as MockDB } from "../lib/firestore-db";
import { CheckCircle2, XCircle, Trophy, ArrowRight, HelpCircle, ChevronRight, Layout, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface QuizViewProps {
  user: any;
  quiz: Quiz;
  onComplete: () => void;
  onBack: () => void;
}

export default function QuizView({ user, quiz, onComplete, onBack }: QuizViewProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const currentQuestion = quiz.questions[currentStep];

  const handleOptionSelect = (index: number) => {
    if (showResult) return;
    setSelectedOption(index);
    setShowResult(true);
    if (index === currentQuestion.correctAnswerIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNext = async () => {
    if (currentStep < quiz.questions.length - 1) {
      setCurrentStep(s => s + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      await saveProgress();
      setFinished(true);
    }
  };

  const saveProgress = async () => {
    try {
      const progress: Omit<Progress, "id"> = {
        userId: user.uid,
        quizId: quiz.id,
        score: score,
        totalQuestions: quiz.questions.length,
        completedAt: new Date().toISOString(),
      };
      await MockDB.add("progress", progress);
    } catch (err) {
      console.error("Scale Save Error:", err);
    }
  };

  if (finished) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-card p-12 rounded-[48px] border border-gray-100 shadow-2xl"
        >
          <div className="w-24 h-24 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <Trophy className="w-12 h-12" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Quiz Completed!</h2>
          <p className="text-gray-500 text-xl mb-10">
            You scored {score} out of {quiz.questions.length}
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={onComplete}
              className="bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-primary/80 transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-card rounded-full border border-border shadow-sm transition-colors text-text-muted">
            <Layout className="w-5 h-5" />
          </button>
          <div>
            <h3 className="font-bold text-text-main">{quiz.title}</h3>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">
              Assessment • {currentStep + 1} / {quiz.questions.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-bold text-primary">{Math.round(((currentStep + 1) / quiz.questions.length) * 100)}%</span>
          <div className="h-2 w-32 bg-border/40 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              animate={{ width: `${((currentStep + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <motion.div
        key={currentStep}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        className="space-y-8"
      >
        <div className="bg-card p-10 rounded-[24px] border border-border shadow-sm">
          <div className="flex gap-4 mb-6">
            <div className="w-10 h-10 bg-bg border border-border rounded-xl flex items-center justify-center shrink-0">
               <HelpCircle className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold leading-tight text-text-main py-1">
              {currentQuestion.question}
            </h2>
          </div>

          <div className="grid gap-3 mt-10">
            {currentQuestion.options.map((option, i) => {
              const isSelected = selectedOption === i;
              const isCorrect = i === currentQuestion.correctAnswerIndex;
              const showCheck = showResult && isCorrect;
              const showWrong = showResult && isSelected && !isCorrect;

              return (
                <button
                  key={i}
                  disabled={showResult}
                  onClick={() => handleOptionSelect(i)}
                  className={`group relative flex items-center justify-between p-6 rounded-2xl border transition-all text-left ${
                    showCheck ? "border-success bg-success/5" : 
                    showWrong ? "border-danger bg-danger/5" :
                    isSelected ? "border-primary bg-primary/5 shadow-sm" :
                    "border-border bg-card hover:border-text-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-[12px] shrink-0 transition-colors ${
                      isSelected ? "bg-primary text-white border-primary" : "bg-bg text-text-muted group-hover:border-border"
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className={`font-medium text-sm ${isSelected ? "text-text-main" : "text-text-muted group-hover:text-text-main"}`}>
                      {option}
                    </span>
                  </div>
                  {showCheck && <CheckCircle2 className="w-5 h-5 text-success shrink-0" />}
                  {showWrong && <XCircle className="w-5 h-5 text-danger shrink-0" />}
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className={`mt-10 p-6 rounded-2xl border ${
                  selectedOption === currentQuestion.correctAnswerIndex ? "bg-success/5 border-success/10" : "bg-bg border-border"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-4 h-4 text-text-muted" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Analysis Insights</span>
                </div>
                <p className="text-[13px] text-text-main leading-relaxed font-medium">
                  {currentQuestion.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-end pt-4">
          <button
            disabled={!showResult}
            onClick={handleNext}
            className="flex items-center gap-2 bg-text-main text-bg px-8 py-4 rounded-full font-bold hover:scale-105 transition-all disabled:opacity-30 disabled:scale-100 shadow-lg shadow-text-main/10"
          >
            {currentStep < quiz.questions.length - 1 ? "Proceed" : "Review Mastery"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
