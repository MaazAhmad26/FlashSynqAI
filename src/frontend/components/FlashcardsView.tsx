/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Document } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, RotateCw, BrainCircuit, Sparkles } from "lucide-react";

interface FlashcardsViewProps {
  doc: Document;
  onBack: () => void;
}

export default function FlashcardsView({ doc, onBack }: FlashcardsViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Derive cards from document key points if analysis exists
  const cards = doc.analysis?.keyPoints.map((point, i) => {
    const parts = point.split(":");
    return {
      front: parts[0] || `Key Concept ${i + 1}`,
      back: parts[1] || point
    };
  }) || [];

  if (cards.length === 0) {
    return (
      <div className="text-center py-20 bg-card rounded-[32px] border border-dashed border-border shadow-sm">
        <p className="text-text-muted font-bold text-sm uppercase tracking-widest">No flashcards available for this document</p>
        <button onClick={onBack} className="mt-4 text-primary font-bold">Go Back</button>
      </div>
    );
  }

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-text-muted hover:text-text-main transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-text-muted">Active Recall Session</span>
        </div>
        <h2 className="text-3xl font-bold text-text-main">{doc.title}</h2>
        <p className="text-text-muted text-sm mt-2">{currentIndex + 1} of {cards.length} cards</p>
      </div>

      <div className="perspective-1000 h-[400px] relative">
        <motion.div
          className="w-full h-full relative preserve-3d cursor-pointer"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden bg-card border border-border rounded-[32px] shadow-xl flex flex-col items-center justify-center p-12 text-center">
            <div className="absolute top-8 left-8 text-primary/20">
              <BrainCircuit className="w-8 h-8" />
            </div>
            <p className="text-[12px] font-bold text-primary uppercase tracking-widest mb-6">Concept</p>
            <h3 className="text-2xl font-bold text-text-main leading-tight">{cards[currentIndex].front}</h3>
            <div className="mt-auto pt-8 flex items-center gap-2 text-text-muted text-[10px] font-bold uppercase tracking-widest">
              <RotateCw className="w-3 h-3" />
              Tap to reveal
            </div>
          </div>

          {/* Back */}
          <div 
            className="absolute inset-0 backface-hidden bg-text-main text-bg border border-border rounded-[32px] shadow-xl flex flex-col items-center justify-center p-12 text-center"
            style={{ transform: "rotateY(180deg)" }}
          >
            <p className="text-[12px] font-bold text-primary uppercase tracking-widest mb-6">Explanation</p>
            <p className="text-lg font-medium leading-relaxed">{cards[currentIndex].back}</p>
            <div className="mt-auto pt-8 flex items-center gap-2 text-bg opacity-30 text-[10px] font-bold uppercase tracking-widest">
              <RotateCw className="w-3 h-3" />
              Tap to flip back
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <button 
          onClick={handlePrev}
          className="w-14 h-14 rounded-full border border-border bg-card flex items-center justify-center text-text-main hover:bg-bg transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div className="flex gap-2">
          {cards.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all ${i === currentIndex ? "w-8 bg-primary" : "w-1.5 bg-border"}`} 
            />
          ))}
        </div>

        <button 
          onClick={handleNext}
          className="w-14 h-14 rounded-full border border-border bg-card flex items-center justify-center text-text-main hover:bg-bg transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
