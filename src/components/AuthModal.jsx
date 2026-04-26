// src/components/AuthModal.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogIn, UserPlus, Mail, Lock, User, Chrome } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function AuthModal({ isOpen, onClose }) {
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const [mode, setMode]         = useState("login"); // login | register
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const reset = () => { setError(""); setEmail(""); setPassword(""); setName(""); };

  const handleGoogle = async () => {
    setError(""); setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (e) {
      setError("Đăng nhập Google thất bại. Thử lại nhé!");
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (mode === "login") {
        await loginWithEmail(email, password);
      } else {
        if (!name.trim()) { setError("Nhập tên của bạn nhé!"); setLoading(false); return; }
        await registerWithEmail(email, password, name.trim());
      }
      onClose();
    } catch (e) {
      const msg = e.code;
      if (msg === "auth/user-not-found" || msg === "auth/wrong-password" || msg === "auth/invalid-credential")
        setError("Email hoặc mật khẩu không đúng.");
      else if (msg === "auth/email-already-in-use")
        setError("Email này đã được đăng ký rồi.");
      else if (msg === "auth/weak-password")
        setError("Mật khẩu phải ít nhất 6 ký tự.");
      else
        setError("Có lỗi xảy ra. Thử lại nhé!");
    } finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.85, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 300 }}
            className="fixed inset-0 z-[301] flex items-center justify-center p-6 pointer-events-none"
          >
            <div
              className="relative w-full max-w-md rounded-3xl p-8 pointer-events-auto"
              style={{
                background: "linear-gradient(135deg, rgba(2,6,23,0.99) 0%, rgba(15,23,42,0.99) 100%)",
                border: "1px solid rgba(99,102,241,0.25)",
                boxShadow: "0 0 80px rgba(99,102,241,0.1), 0 40px 80px rgba(0,0,0,0.6)",
              }}
            >
              {/* Glow line top */}
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-3xl bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={16} />
              </button>

              {/* Header */}
              <div className="mb-6 text-center">
                <div className="text-4xl mb-2">🔺</div>
                <h2 className="text-white font-black text-xl">
                  {mode === "login" ? "Chào mừng trở lại!" : "Tạo tài khoản"}
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  {mode === "login"
                    ? "Đăng nhập để lưu tiến trình và leo rank"
                    : "Bắt đầu hành trình chinh phục hình học không gian"}
                </p>
              </div>

              {/* Google button */}
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl mb-4 font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <Chrome size={18} className="text-blue-400" />
                Tiếp tục với Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-slate-500 text-xs font-bold">hoặc</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === "register" && (
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Tên của bạn"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                    />
                  </div>
                )}
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-xs font-bold px-1">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-2xl font-black text-white transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    boxShadow: "0 0 20px rgba(99,102,241,0.3)",
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {mode === "login"
                    ? <><LogIn size={16} /> Đăng nhập</>
                    : <><UserPlus size={16} /> Đăng ký</>}
                </button>
              </form>

              {/* Switch mode */}
              <p className="text-center text-slate-500 text-sm mt-4">
                {mode === "login" ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
                <button
                  onClick={() => { setMode(mode === "login" ? "register" : "login"); reset(); }}
                  className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
                >
                  {mode === "login" ? "Đăng ký ngay" : "Đăng nhập"}
                </button>
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
