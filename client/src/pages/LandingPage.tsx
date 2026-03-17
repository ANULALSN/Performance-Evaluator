import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, GraduationCap, ArrowRight, Zap, Trophy, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-primary overflow-hidden relative">
      {/* Animated Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-accent-purple/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent-blue/10 blur-[120px] rounded-full"></div>

      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-accent-purple rounded-xl flex items-center justify-center shadow-lg shadow-accent-purple/20">
            <Zap className="text-white" size={24} />
          </div>
          <span className="text-2xl font-outfit font-bold tracking-tight">SIPP</span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="btn-secondary">Login</Link>
          <Link to="/register" className="btn-primary">Get Started</Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-accent-purple text-sm font-semibold mb-6">
            v1.0 • AI-Powered Accountability
          </span>
          <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tight font-outfit">
            Master Your <br />
            <span className="gradient-text">Performance</span>
          </h1>
          <p className="text-xl text-text-muted max-w-2xl mx-auto mb-12 leading-relaxed">
            The full-stack platform for student innovators to track daily progress, 
            receive AI coaching, and build meaningful streaks.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-20">
          <motion.div
            whileHover={{ y: -5 }}
            className="card-premium text-left p-10 group cursor-pointer"
          >
            <div className="w-16 h-16 bg-accent-purple/10 rounded-2xl flex items-center justify-center mb-8 border border-accent-purple/20">
              <GraduationCap className="text-accent-purple" size={32} />
            </div>
            <h2 className="text-3xl font-bold mb-4 group-hover:text-accent-purple transition-colors">Student Portal</h2>
            <p className="text-text-muted mb-8 text-lg">Daily check-ins, AI-assigned tasks, and real-time consistency tracking.</p>
            <Link to="/register" className="flex items-center gap-2 text-accent-purple font-bold">
              Join as Learner <ArrowRight size={20} />
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="card-premium text-left p-10 group cursor-pointer"
          >
            <div className="w-16 h-16 bg-accent-blue/10 rounded-2xl flex items-center justify-center mb-8 border border-accent-blue/20">
              <ShieldCheck className="text-accent-blue" size={32} />
            </div>
            <h2 className="text-3xl font-bold mb-4 group-hover:text-accent-blue transition-colors">Admin Hub</h2>
            <p className="text-text-muted mb-8 text-lg">Cohort analytics, drop-off alerts, and dynamic quiz builder.</p>
            <Link to="/login" className="flex items-center gap-2 text-accent-blue font-bold">
              Mentor Access <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>

        <div className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-border-default pt-20">
           <div className="text-center">
              <Trophy className="mx-auto mb-4 text-accent-amber" size={24} />
              <p className="text-2xl font-bold font-outfit">Top 1%</p>
              <p className="text-text-muted text-sm">Innovator Growth</p>
           </div>
           <div className="text-center">
              <Brain className="mx-auto mb-4 text-accent-purple" size={24} />
              <p className="text-2xl font-bold font-outfit">AI Coaching</p>
              <p className="text-text-muted text-sm">Real-time Feedback</p>
           </div>
           <div className="text-center">
              <Zap className="mx-auto mb-4 text-accent-blue" size={24} />
              <p className="text-2xl font-bold font-outfit">Daily Goals</p>
              <p className="text-text-muted text-sm">Smart Completion</p>
           </div>
           <div className="text-center">
              <ShieldCheck className="mx-auto mb-4 text-accent-green" size={24} />
              <p className="text-2xl font-bold font-outfit">Certified</p>
              <p className="text-text-muted text-sm">Verified Progress</p>
           </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
