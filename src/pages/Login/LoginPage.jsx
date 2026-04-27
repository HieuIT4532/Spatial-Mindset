import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Float, PerspectiveCamera } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { signInWithGoogle, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      setError('Đăng nhập bằng Google thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Email hoặc mật khẩu không đúng.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full grid grid-cols-1 md:grid-cols-2 bg-[#020617] text-white overflow-hidden">
      {/* ── Left Side: Auth Form ── */}
      <div className="flex flex-col justify-center px-8 md:px-16 lg:px-24 z-10 bg-[#020617]">
        <div className="max-w-md w-full mx-auto">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-12">
            <img src="/logo.png" alt="SpatialMind" className="h-10 w-10 object-contain rounded-xl" />
            <span
              className="text-2xl font-black tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #22d3ee 0%, #4ade80 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              SpatialMind
            </span>
          </div>

          <h1 className="text-3xl font-bold mb-2">Đăng nhập</h1>
          <p className="text-slate-400 text-sm mb-8">
            Tiếp tục hành trình chinh phục không gian 3D của bạn.
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all text-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-400">Mật khẩu</label>
                <a href="#" className="text-xs text-cyan-500 hover:text-cyan-400">Quên mật khẩu?</a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="relative flex items-center py-6">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-slate-500 text-xs">Hoặc tiếp tục với</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.79 15.75 17.55V20.31H19.31C21.4 18.39 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
              <path d="M12 23C14.97 23 17.46 22.02 19.31 20.31L15.75 17.55C14.75 18.22 13.48 18.63 12 18.63C9.13 18.63 6.7 16.69 5.82 14.07H2.15V16.92C3.96 20.52 7.69 23 12 23Z" fill="#34A853"/>
              <path d="M5.82 14.07C5.59 13.4 5.46 12.71 5.46 12C5.46 11.29 5.59 10.6 5.82 9.93V7.08H2.15C1.41 8.55 1 10.23 1 12C1 13.77 1.41 15.45 2.15 16.92L5.82 14.07Z" fill="#FBBC05"/>
              <path d="M12 5.38C13.62 5.38 15.07 5.94 16.21 7.02L19.4 3.83C17.45 2.01 14.97 1 12 1C7.69 1 3.96 3.48 2.15 7.08L5.82 9.93C6.7 7.31 9.13 5.38 12 5.38Z" fill="#EA4335"/>
            </svg>
            Google
          </button>
        </div>
      </div>

      {/* ── Right Side: 3D Showcase ── */}
      <div className="hidden md:block relative bg-[#0f172a] border-l border-white/5">
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#020617] via-transparent to-transparent z-10 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/20 blur-[120px] rounded-full z-0" />
        
        <Canvas dpr={[1, 2]} gl={{ antialias: true }}>
          <PerspectiveCamera makeDefault fov={50} position={[5, 4, 8]} />
          <ambientLight intensity={1} />
          <spotLight position={[10, 20, 10]} intensity={2} color="#22d3ee" />
          <pointLight position={[-10, 10, -10]} intensity={1} color="#6366f1" />
          
          <Stars radius={50} depth={50} count={2000} factor={4} saturation={1} fade speed={1} />
          
          <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <group>
              <mesh>
                <octahedronGeometry args={[2.5, 0]} />
                <meshStandardMaterial 
                  color="#0f172a" 
                  wireframe 
                  transparent 
                  opacity={0.3}
                  emissive="#22d3ee" 
                  emissiveIntensity={0.5}
                />
              </mesh>
              <mesh scale={0.5}>
                <dodecahedronGeometry args={[2.5, 0]} />
                <meshStandardMaterial 
                  color="#1e293b" 
                  transparent 
                  opacity={0.8}
                  emissive="#6366f1" 
                  emissiveIntensity={0.5}
                />
              </mesh>
            </group>
          </Float>

          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            autoRotate 
            autoRotateSpeed={1} 
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 3}
          />
        </Canvas>
      </div>
    </div>
  );
}
