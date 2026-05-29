import React, { useState } from "react";
import { FirestoreDB as MockDB } from "../lib/firestore-db";
import { OperationType, Document } from "../types";
import { Upload, X, FileText, Loader2, Sparkles, AlertCircle, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DocumentUploadProps {
  user: any;
  onSuccess: (doc: Document) => void;
  onCancel: () => void;
}

export default function DocumentUpload({ user, onSuccess, onCancel }: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"file" | "text">("file");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = user?.uid || "local-user";
    if (mode === "file" && !file) return;
    if (mode === "text" && !textContent.trim()) return;

    setAnalyzing(true);
    setError(null);

    try {
      let requestBody: any = {};

      if (mode === "file" && file) {
        const base64Promise = new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });

        const fileData = await base64Promise;
        requestBody = {
          fileData,
          fileName: file.name,
          fileType: file.type,
        };
      } else {
        requestBody = {
          textContent,
        };
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const analysis = await response.json();

      const docData = {
        userId: userId,
        title: mode === "file" ? file?.name.split('.')[0] : textContent.slice(0, 30) + "...",
        content: mode === "text" ? textContent : "Analyzed from file: " + file?.name,
        fileName: file?.name || "Text Entry",
        fileType: file?.type || "text/plain",
        analysis,
        createdAt: new Date().toISOString(),
      };

      const docId = await MockDB.add("documents", docData);
      onSuccess({ id: docId, ...docData } as Document);
    } catch (err: any) {
      console.error("Upload/Analysis Error:", err);
      setError(err.message || "Failed to analyze document");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <button 
          onClick={onCancel}
          className="flex items-center gap-2 text-sm font-bold text-text-muted hover:text-text-main transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
      <div className="bg-card rounded-[24px] border border-border shadow-sm p-10">
        <div className="flex items-center justify-between mb-8">
          <div className="text-[12px] font-bold text-text-muted uppercase tracking-widest">Analysis Engine</div>
          <button onClick={onCancel} className="p-2 hover:bg-bg rounded-full transition-colors text-text-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 p-1 bg-bg rounded-xl mb-8 border border-border">
          <button
            onClick={() => setMode("file")}
            className={`flex-1 py-2.5 px-4 rounded-lg text-[13px] font-bold transition-all ${
              mode === "file" ? "bg-card text-primary shadow-sm" : "text-text-muted hover:text-text-main"
            }`}
          >
            File Upload
          </button>
          <button
            onClick={() => setMode("text")}
            className={`flex-1 py-2.5 px-4 rounded-lg text-[13px] font-bold transition-all ${
              mode === "text" ? "bg-card text-primary shadow-sm" : "text-text-muted hover:text-text-main"
            }`}
          >
            Paste Text
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === "file" ? (
            <div 
              className={`border-2 border-dashed rounded-[20px] p-12 text-center transition-all ${
                file ? "border-primary bg-primary/5" : "border-border hover:border-text-muted/30"
              }`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const droppedFile = e.dataTransfer.files[0];
                if (droppedFile) setFile(droppedFile);
              }}
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="file-upload" className="cursor-pointer block">
                <div className="w-12 h-12 bg-card border border-border rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Upload className={`w-6 h-6 ${file ? "text-primary" : "text-text-muted"}`} />
                </div>
                {file ? (
                  <div>
                    <p className="font-bold text-text-main text-[15px]">{file.name}</p>
                    <p className="text-[11px] text-text-muted mt-1 uppercase tracking-tight">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-bold text-text-main">Drop your file here</p>
                    <p className="text-[12px] text-text-muted mt-1 font-medium">PDF, DOCX, or Image supported</p>
                  </div>
                )}
              </label>
            </div>
          ) : (
            <textarea
              className="w-full h-48 p-6 bg-bg rounded-[20px] border border-border focus:border-primary focus:ring-0 resize-none font-sans text-sm"
              placeholder="Paste your study notes or text here..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
            />
          )}

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-danger/5 border border-danger/10 p-4 rounded-xl flex items-center gap-3 text-danger text-sm font-medium"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={analyzing || (mode === "file" ? !file : !textContent.trim())}
            className="w-full bg-primary text-white py-4 rounded-full font-bold text-[15px] hover:bg-accent shadow-sm shadow-primary/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {analyzing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {analyzing ? "Synthesizing Knowledge..." : "Analyze Now"}
          </button>
        </form>
      </div>

      <div className="mt-8 flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest justify-center">
        <span>AI-Powered Insights</span>
        <div className="w-1 h-1 bg-gray-300 rounded-full" />
        <span>Mnemonics generation</span>
        <div className="w-1 h-1 bg-gray-300 rounded-full" />
        <span>Custom Quizzes</span>
      </div>
    </div>
  );
}
