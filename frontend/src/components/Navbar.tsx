import { Zap, LogOut, Layout, History, Plus, Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";

interface NavbarProps {
  user: any;
  onLogout: () => void;
  currentView: string;
  setView: (view: any) => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function Navbar({ user, onLogout, currentView, setView, darkMode, setDarkMode }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 px-4 ${scrolled ? "bg-bg/80 backdrop-blur-md border-b border-border py-4 shadow-sm" : "bg-transparent py-6"}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div 
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={() => setView("dashboard")}
        >
          <img src="/logo.png" alt="FlashSynqAI Logo" className="w-7 h-7 object-contain shrink-0 rounded-lg shadow-sm" />
          <span className="font-sans font-bold text-xl tracking-tight text-text-main">
            FLASHSYNQ<span className="text-primary">AI</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-card rounded-full border border-border shadow-sm text-[12px] font-medium">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            API Connected
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-card rounded-full border border-border shadow-sm text-[12px] font-medium text-text-muted">
            v2.0.4 - Study Mode
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 bg-card border border-border rounded-full text-text-muted hover:text-text-main hover:border-primary/50 transition-all shadow-sm"
            title="Toggle Dark Mode"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          <div className="flex items-center gap-3 bg-card border border-border pl-4 pr-2 py-2 rounded-full shadow-sm">
            <div className="text-right hidden sm:block">
              <p className="text-[13px] font-bold leading-none text-text-main">{user.displayName}</p>
            </div>
            <img
              src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
              alt="Avatar"
              className="w-8 h-8 rounded-full border border-border"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={onLogout}
              className="p-1.5 text-text-muted hover:text-danger transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
