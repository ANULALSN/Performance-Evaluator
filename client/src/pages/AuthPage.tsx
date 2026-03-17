import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  CheckCircle, 
  ShieldCheck, 
  Rocket, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ChevronRight,
  Code,
  LineChart,
  BrainCircuit,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import api from '../api';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAppContext();
  const navigate = useNavigate();

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    techStack: 'General',
    skillLevel: 'beginner'
  });

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return { label: '', color: '' };
    if (pass.length < 6) return { label: 'Weak', color: 'bg-accent-error' };
    if (pass.length < 10 || !/\d/.test(pass)) return { label: 'Fair', color: 'bg-accent-amber' };
    return { label: 'Strong', color: 'bg-accent-green' };
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Client-side validation
    if (!validateEmail(formData.email)) return setError('Invalid email format');
    if (isLogin && !formData.password) return setError('Password is required');
    
    if (!isLogin) {
      if (formData.name.length < 2) return setError('Name is too short');
      if (formData.password.length < 8 || !/\d/.test(formData.password)) {
        return setError('Password must be 8+ chars and contain a number');
      }
      if (formData.password !== formData.confirmPassword) {
        return setError('Passwords do not match');
      }
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? 'auth/login' : 'auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { ...formData };
      
      const { data } = await api.post(endpoint, payload);
      login(data.token, data.user);
      
      if (data.user.role === 'admin') navigate('/admin');
      else navigate('/portal');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const techStacks = ["Python", "JavaScript", "React", "Node.js", "Full Stack", "AI/ML", "General"];

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden font-inter">
      {/* Left Panel: Branding */}
      <div className="hidden lg:flex w-1/2 flex-col p-20 justify-between relative bg-neutral-950 border-r border-white/5">
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }}>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-accent-purple rounded-2xl flex items-center justify-center shadow-lg shadow-accent-purple/20">
              <Zap size={28} className="text-white fill-white" />
            </div>
            <h1 className="text-4xl font-outfit font-extrabold gradient-text">SIPP</h1>
          </div>
          
          <div className="space-y-12 max-w-lg">
             <h2 className="text-6xl font-outfit font-bold tracking-tight leading-tight">
               Build. Learn. Grow. <br/><span className="text-text-muted">Every Single Day.</span>
             </h2>

             <div className="space-y-8">
               <Feature icon={BrainCircuit} title="AI Mentor Analysis" desc="Daily check-ins analyzed by LLMs for precision feedback." />
               <Feature icon={LineChart} title="Growth Tracking" desc="Visual consistency scores and high-performance streaks." />
               <Feature icon={ShieldCheck} title="Cohort Transparency" desc="Real-time leaderboard and objective performance metrics." />
             </div>
          </div>
        </div>

        <div className="relative z-10 text-text-muted text-sm font-medium">
          © 2026 SIPP Architecture. All systems operational.
        </div>
      </div>

      {/* Right Panel: Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-20 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-10 lg:hidden flex items-center gap-3">
             <div className="w-10 h-10 bg-accent-purple rounded-xl flex items-center justify-center">
                <Zap size={20} className="text-white fill-white" />
             </div>
             <h1 className="text-2xl font-outfit font-extrabold gradient-text">SIPP</h1>
          </div>

          <h2 className="text-3xl font-bold font-outfit mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-text-muted mb-10">
            {isLogin ? 'Enter your credentials to access your dashboard.' : 'Join the cohort and start your accountability journey.'}
          </p>

          <form onSubmit={handleAuth} className="space-y-6">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div 
                   key="login"
                   initial={{ opacity: 0, x: 10 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -10 }}
                   className="space-y-5"
                >
                  <Input 
                    icon={Mail} label="Email Address" type="email" placeholder="name@example.com"
                    autoComplete="email"
                    value={formData.email} onChange={(v: string) => setFormData({...formData, email: v})} 
                  />
                  <div className="relative">
                    <Input 
                      icon={Lock} label="Password" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                      autoComplete={isLogin ? "current-password" : "new-password"}
                      value={formData.password} onChange={(v: string) => setFormData({...formData, password: v})}
                    />
                    <button 
                      type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 bottom-3.5 text-text-muted hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                   key="register"
                   initial={{ opacity: 0, x: 10 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -10 }}
                   className="space-y-5"
                >
                  <Input 
                    icon={User} label="Full Name" type="text" placeholder="John Doe"
                    autoComplete="name"
                    value={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} 
                  />
                  <Input 
                    icon={Mail} label="Email Address" type="email" placeholder="name@example.com"
                    autoComplete="email"
                    value={formData.email} onChange={(v: string) => setFormData({...formData, email: v})} 
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div className="relative">
                        <Input 
                          icon={Lock} label="Password" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                          autoComplete="new-password"
                          value={formData.password} onChange={(v: string) => setFormData({...formData, password: v})}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 bottom-3.5 text-text-muted">
                           {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <div className="mt-2 flex gap-1 h-1">
                           {[1,2,3].map(i => (
                             <div key={i} className={`flex-1 rounded-full ${i <= (formData.password.length > 8 ? 3 : 1) ? getPasswordStrength(formData.password).color : 'bg-neutral-800'}`}></div>
                           ))}
                        </div>
                     </div>
                     <Input 
                       icon={CheckCircle} label="Confirm" type="password" placeholder="••••••••"
                       autoComplete="new-password"
                       value={formData.confirmPassword} onChange={(v: string) => setFormData({...formData, confirmPassword: v})}
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Tech Stack Focus</label>
                     <select 
                        className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent-purple transation-all text-sm"
                        value={formData.techStack} onChange={e => setFormData({...formData, techStack: e.target.value})}
                     >
                        {techStacks.map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Current Skill Level</label>
                     <div className="grid grid-cols-3 gap-3">
                        {['beginner', 'intermediate', 'advanced'].map(level => (
                          <button
                            key={level} type="button"
                            onClick={() => setFormData({...formData, skillLevel: level as any})}
                            className={`p-3 rounded-xl border text-[10px] font-black uppercase tracking-tighter transition-all ${
                              formData.skillLevel === level 
                                ? 'bg-accent-purple/10 border-accent-purple text-accent-purple' 
                                : 'bg-neutral-900 border-white/5 text-text-muted hover:border-white/20'
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="p-4 bg-accent-error/10 border border-accent-error/20 text-accent-error text-xs font-bold rounded-xl flex items-center gap-2">
                <AlertTriangle size={16} /> {error}
              </motion.div>
            )}

            <button 
              disabled={loading}
              className="btn-primary w-full h-14 text-sm font-bold flex items-center justify-center gap-3 shadow-xl shadow-accent-purple/20"
            >
              {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Sign In to Portal' : 'Create My Account')}
              {!loading && <ChevronRight size={18} />}
            </button>
          </form>

          <div className="mt-8 text-center">
             <button 
               onClick={() => setIsLogin(!isLogin)}
               className="text-sm font-medium text-text-muted hover:text-white transition-colors"
             >
               {isLogin ? "Don't have an account? " : "Already have an account? "}
               <span className="text-accent-purple font-bold">{isLogin ? 'Sign Up' : 'Sign In'}</span>
             </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const Feature = ({ icon: Icon, title, desc }: any) => (
  <div className="flex gap-4">
    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
       <Icon size={24} className="text-accent-purple" />
    </div>
    <div>
      <h3 className="font-bold text-white mb-1">{title}</h3>
      <p className="text-text-muted text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);

const Input = ({ label, icon: Icon, value, onChange, ...props }: any) => (
  <div className="space-y-2">
    <label className="text-xs font-bold uppercase tracking-widest text-text-muted">{label}</label>
    <div className="relative">
       <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
          <Icon size={18} />
       </div>
       <input 
         className="w-full bg-neutral-900 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 outline-none focus:border-accent-purple transition-all text-sm"
         value={value} onChange={e => onChange(e.target.value)}
         {...props}
       />
    </div>
  </div>
);

export default AuthPage;
