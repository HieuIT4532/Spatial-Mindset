// src/components/UserAvatar.jsx
// Avatar nhỏ góc trên - click để mở profile hoặc login
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User, Trophy, Settings } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function UserAvatar({ xp, rankInfo, onOpenProfile, onOpenAuth }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) {
    return (
      <button
        onClick={onOpenAuth}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs transition-all hover:scale-105"
        style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.2) 100%)",
          border: "1px solid rgba(99,102,241,0.3)",
          color: "#a5b4fc",
        }}
      >
        <User size={13} />
        Đăng nhập
      </button>
    );
  }

  const initial = (user.displayName || user.email || "?")[0].toUpperCase();
  const photoURL = user.photoURL;

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(v => !v)}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-all hover:bg-white/5"
      >
        {photoURL ? (
          <img src={photoURL} alt="avatar" className="w-7 h-7 rounded-full object-cover ring-2" style={{ ringColor: rankInfo?.current?.color }} />
        ) : (
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs text-white"
            style={{ background: `linear-gradient(135deg, ${rankInfo?.current?.color || "#6366f1"} 0%, #8b5cf6 100%)` }}
          >
            {initial}
          </div>
        )}
        <span className="text-white text-xs font-bold max-w-[80px] truncate hidden sm:block">
          {user.displayName?.split(" ").pop() || "Bạn"}
        </span>
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="absolute right-0 top-10 z-50 w-44 rounded-2xl p-2 shadow-2xl"
            style={{
              background: "rgba(10,15,35,0.98)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(20px)",
            }}
          >
            <button
              onClick={() => { setMenuOpen(false); onOpenProfile?.(); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 text-sm font-bold transition-all"
            >
              <Trophy size={14} /> Hồ sơ & Rank
            </button>
            <button
              onClick={() => { setMenuOpen(false); logout(); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm font-bold transition-all"
            >
              <LogOut size={14} /> Đăng xuất
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
