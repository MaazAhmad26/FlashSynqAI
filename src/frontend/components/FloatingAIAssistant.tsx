/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { ChatMessage, Note } from "../types";
import { FirestoreDB as MockDB } from "../lib/firestore-db";
import { MessageSquare, StickyNote, X, Send, Plus, Trash2, Palette, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const COLORS = [
  { name: "Yellow", bg: "bg-yellow-100", border: "border-yellow-200", text: "text-yellow-800" },
  { name: "Blue", bg: "bg-blue-100", border: "border-blue-200", text: "text-blue-800" },
  { name: "Green", bg: "bg-green-100", border: "border-green-200", text: "text-green-800" },
  { name: "Pink", bg: "bg-pink-100", border: "border-pink-200", text: "text-pink-800" },
  { name: "Purple", bg: "bg-purple-100", border: "border-purple-200", text: "text-purple-800" },
];

interface FloatingAIAssistantProps {
  user: any;
}

export default function FloatingAIAssistant({ user }: FloatingAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "notes">("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "ai", content: "Hi! I'm your FlashSynq AI study buddy. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && activeTab === "notes") {
      fetchNotes();
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchNotes = async () => {
    const fetchedNotes = await MockDB.list("notes", { field: "userId", value: user?.uid || "local-user" });
    setNotes(fetchedNotes.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const chatHistory = messages.filter(m => m.content !== "Hi! I'm your FlashSynq AI study buddy. How can I help you today?");
      const recentHistory = chatHistory.slice(-6);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, history: recentHistory }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: "ai", content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "ai", content: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    const noteData = {
      userId: user?.uid || "local-user",
      content: newNote,
      color: selectedColor.name,
      createdAt: new Date().toISOString()
    };
    await MockDB.add("notes", noteData);
    setNewNote("");
    fetchNotes();
  };

  const handleDeleteNote = async (id: string) => {
    await MockDB.delete("notes", id);
    setNotes(notes.filter(n => n.id !== id));
  };

  const handleClearChat = () => {
    setMessages([{ role: "ai", content: "Hi! I'm your FlashSynq AI study buddy. How can I help you today?" }]);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-[380px] h-[550px] bg-card rounded-[32px] shadow-2xl border border-border flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-card sticky top-0 z-10">
              <div className="flex gap-4">
                <button 
                  onClick={() => setActiveTab("chat")}
                  className={`text-sm font-bold transition-colors ${activeTab === "chat" ? "text-primary" : "text-text-muted hover:text-text-main"}`}
                >
                  AI Chat
                </button>
                <button 
                  onClick={() => setActiveTab("notes")}
                  className={`text-sm font-bold transition-colors ${activeTab === "notes" ? "text-primary" : "text-text-muted hover:text-text-main"}`}
                >
                  My Notes
                </button>
              </div>
              <div className="flex items-center gap-1">
                {activeTab === "chat" && messages.length > 1 && (
                  <button 
                    onClick={handleClearChat} 
                    className="p-1.5 hover:bg-bg rounded-full text-text-muted transition-colors group relative" 
                    title="Clear Chat"
                  >
                    <Trash2 className="w-4 h-4 group-hover:text-danger" />
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-bg rounded-full text-text-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-bg/30">
              {activeTab === "chat" ? (
                <div className="space-y-4">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed ${
                        msg.role === "user" 
                        ? "bg-primary text-white rounded-br-none" 
                        : "bg-card border border-border text-text-main rounded-bl-none shadow-sm"
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-card border border-border p-4 rounded-2xl rounded-bl-none shadow-sm">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Note Creator */}
                  <div className="bg-card p-4 rounded-2xl border border-border shadow-sm space-y-4">
                    <textarea 
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Jot down a quick thought..."
                      className="w-full text-sm border-none focus:ring-0 p-0 resize-none h-20 bg-transparent placeholder:text-text-muted/50"
                    />
                    <div className="flex items-center justify-between border-t border-border pt-3">
                      <div className="flex gap-2">
                        {COLORS.map(c => (
                          <button 
                            key={c.name}
                            onClick={() => setSelectedColor(c)}
                            className={`w-5 h-5 rounded-full border-2 ${c.bg} ${selectedColor.name === c.name ? "border-primary scale-110" : "border-transparent"}`}
                          />
                        ))}
                      </div>
                      <button 
                        onClick={handleAddNote}
                        disabled={!newNote.trim()}
                        className="bg-primary text-white p-2 rounded-xl hover:bg-accent transition-colors disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Notes List */}
                  <div className="space-y-4 pb-4">
                    {notes.map(note => {
                      const colorScheme = COLORS.find(c => c.name === note.color) || COLORS[0];
                      return (
                        <div key={note.id} className={`${colorScheme.bg} ${colorScheme.border} border p-4 rounded-2xl relative group`}>
                          <p className={`text-[13px] leading-relaxed ${colorScheme.text}`}>{note.content}</p>
                          <button 
                            onClick={() => handleDeleteNote(note.id)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-black/5 rounded transition-all"
                          >
                            <Trash2 className="w-3 h-3 text-text-muted" />
                          </button>
                          <div className="mt-2 text-[9px] font-bold uppercase tracking-wider text-black/20">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Footer */}
            {activeTab === "chat" && (
              <div className="p-6 bg-card border-t border-border sticky bottom-0">
                <form onSubmit={handleSendMessage} className="relative">
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything..."
                    className="w-full py-4 pl-5 pr-14 bg-bg border border-border rounded-2xl text-sm focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all outline-none"
                  />
                  <button 
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white p-2.5 rounded-xl hover:bg-accent transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all ${
          isOpen ? "bg-text-main text-bg" : "bg-primary text-white"
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-danger border-4 border-white rounded-full" />
        )}
      </motion.button>
    </div>
  );
}
