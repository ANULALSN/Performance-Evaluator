import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Cpu, 
  Globe, 
  Sparkles,
  Rocket,
  Flame,
  Bot,
  Trophy,
  BookOpen,
  Hammer,
  Bug,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAppContext } from '../../context/AppContext';
import api from '../../api';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const { user, login } = useAppContext();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkinData, setCheckinData] = useState({ learned: '', built: '', problem: '' });
  const [generatedTasks, setGeneratedTasks] = useState<any>(null);

  const nextStep = () => setStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleFirstCheckin = async () => {
    setLoading(true);
    try {
      // Step 4: Submit onboarding checkin
      await api.post('student/checkin', checkinData);
      
      // Fetch the tasks that were generated
      const { data: taskData } = await api.get('student/today-tasks');
      setGeneratedTasks(taskData.tasks);
      
      nextStep();
    } catch (err) {
      console.error(err);
      alert("Failed to generate tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    try {
      const { data: updatedUser } = await api.patch('student/onboarding-complete');
      
      // Update local context/storage
      const token = localStorage.getItem('sipp_token');
      if (token && updatedUser) {
        login(token, updatedUser);
      }
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#8b5cf6', '#10b981']
      });
      
      setTimeout(() => {
        onComplete();
      }, 1000);
    } catch (err) {
      console.error(err);
    }
  };

  const steps = [
    // Step 1: Welcome
    <div className="space-y-12 text-center max-w-2xl mx-auto">
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-24 h-24 bg-accent-blue/10 rounded-3xl mx-auto flex items-center justify-center border border-accent-blue/30"
      >
        <Rocket className="text-accent-blue" size={48} />
      </motion.div>
      
      <div className="space-y-4">
        <h1 className="text-5xl font-black font-outfit tracking-tighter">
          Welcome to <span className="bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent italic">SIPP</span>, {user?.name.split(' ')[0]}!
        </h1>
        <p className="text-text-muted text-lg font-medium">Your personal learning accountability system for technical mastery.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard 
          icon={<Flame className="text-accent-error" />} 
          title="Daily Check-ins" 
          desc="Stay accountable every single day" 
          delay={0.2}
        />
        <FeatureCard 
          icon={<Bot className="text-accent-blue" />} 
          title="AI Coaching" 
          desc="Get personalized feedback on work" 
          delay={0.3}
        />
        <FeatureCard 
          icon={<Trophy className="text-accent-green" />} 
          title="Earn Points" 
          desc="Track your growth with XP scores" 
          delay={0.4}
        />
      </div>
    </div>,

    // Step 2: Your Track
    <div className="space-y-10 text-center max-w-2xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold font-outfit tracking-tight">You're on the {user?.techStack} Track</h2>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent-blue/10 border border-accent-blue/20 rounded-full text-accent-blue text-xs font-black uppercase tracking-widest">
          {user?.skillLevel} Level
        </div>
      </div>

      <div className="p-8 bg-neutral-900 border border-white/5 rounded-3xl flex flex-col items-center gap-6 shadow-2xl">
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white">
          {user?.techStack === 'Python' ? <Cpu size={40}/> : <Globe size={40}/>}
        </div>
        
        <div className="space-y-4">
          <p className="text-sm font-medium leading-relaxed italic text-text-muted">
            {user?.skillLevel === 'beginner' && '"Concepts + guided features + simple debugging"'}
            {user?.skillLevel === 'intermediate' && '"Projects + architecture + optimization"'}
            {user?.skillLevel === 'advanced' && '"System design + complex algorithms + code review"'}
          </p>
          <p className="text-xs text-text-muted">Tasks are algorithmically generated based on this specialization.</p>
        </div>

        <button className="text-accent-blue text-xs font-bold hover:underline">Edit your track in Profile Settings</button>
      </div>
    </div>,

    // Step 3: The 3-Objective Rule
    <div className="space-y-12 text-center max-w-xl mx-auto">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold font-outfit tracking-tight">The 3-Objective Rule</h2>
        <p className="text-text-muted text-sm font-medium">Every morning, AI generates 3 tasks tailored specifically for your current goals.</p>
      </div>

      <div className="space-y-4">
        <ObjectiveItem icon={<BookOpen size={18}/>} title="Concept" desc="Learn one thing deeply" delay={0.1} />
        <ObjectiveItem icon={<Hammer size={18}/>} title="Feature" desc="Build one working thing" delay={0.2} />
        <ObjectiveItem icon={<Bug size={18}/>} title="Debug" desc="Solve one real technical problem" delay={0.3} />
      </div>

      <div className="p-6 bg-accent-amber/5 border border-accent-amber/20 rounded-2xl">
        <p className="text-sm font-bold text-accent-amber">
          Complete all 3 → Earn +3 XP <br/>
          Miss a day → -2 XP (Consistency matters!)
        </p>
      </div>
    </div>,

    // Step 4: Your First Check-in
    <div className="space-y-8 text-center max-w-2xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold font-outfit tracking-tight">Your First Check-in</h2>
        <p className="text-text-muted text-sm font-medium">This unlocks your portal and seeds the AI with your current context.</p>
      </div>

      <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8 text-left space-y-6 shadow-2xl">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Weekly Learning Goal</label>
            <input 
              value={checkinData.learned}
              onChange={e => setCheckinData({...checkinData, learned: e.target.value})}
              placeholder="e.g. Master React performance optimization"
              className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-sm focus:border-accent-blue transition-all outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Current Project or Goal</label>
            <input 
              value={checkinData.built}
              onChange={e => setCheckinData({...checkinData, built: e.target.value})}
              placeholder="e.g. Building a SaaS dashboard"
              className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-sm focus:border-accent-blue transition-all outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Biggest Technical Challenge</label>
            <textarea 
              value={checkinData.problem}
              onChange={e => setCheckinData({...checkinData, problem: e.target.value})}
              placeholder="e.g. Struggling with complex state management in Redux"
              className="w-full h-24 bg-black/40 border border-white/5 rounded-xl p-3 text-sm focus:border-accent-blue transition-all outline-none"
            />
          </div>
        </div>

        <button 
          onClick={handleFirstCheckin}
          disabled={loading || !checkinData.learned || !checkinData.built || !checkinData.problem}
          className="w-full btn-primary h-14 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[11px]"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Architecting your first tasks...
            </>
          ) : (
            <>
              Initialize My Journey
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </div>
    </div>,

    // Step 5: You're Ready
    <div className="space-y-12 text-center max-w-2xl mx-auto">
      <div className="space-y-4">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-accent-green/10 rounded-full mx-auto flex items-center justify-center text-accent-green mb-6"
        >
          <Sparkles size={40} />
        </motion.div>
        <h2 className="text-4xl font-black font-outfit tracking-tighter text-white">You're All Set, {user?.name.split(' ')[0]}!</h2>
        <p className="text-text-muted font-medium">Your initial tasks are ready. Let's start building.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {generatedTasks?.map((task: any, i: number) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="p-5 bg-neutral-900 border border-white/5 rounded-2xl text-left"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-accent-blue mb-2 block">{task.type}</span>
            <p className="text-xs font-bold leading-tight">{task.title}</p>
          </motion.div>
        ))}
      </div>

      <button 
        onClick={handleFinish}
        className="btn-primary h-16 px-12 rounded-full inline-flex items-center gap-4 text-sm font-black uppercase tracking-widest shadow-2xl shadow-accent-blue/30"
      >
        Enter the Portal
        <Rocket size={20} />
      </button>
    </div>
  ];

  return (
    <div className="fixed inset-0 z-[9999] bg-bg-primary flex flex-col font-inter">
      {/* Progress */}
      {step < 5 && (
        <div className="absolute top-10 left-0 right-0 flex justify-center gap-3">
          {[1,2,3,4,5].map(i => (
            <div 
              key={i} 
              className={`w-3 h-3 rounded-full transition-all duration-500 ${i <= step ? 'bg-accent-blue' : 'bg-white/10'}`}
            />
          ))}
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full"
          >
            {steps[step - 1]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      {step < 4 && (
        <div className="p-10 flex justify-between items-center max-w-4xl mx-auto w-full">
          <button 
            onClick={prevStep}
            className={`flex items-center gap-3 text-text-muted font-bold transition-all hover:text-white ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            <ArrowLeft size={18} /> Back
          </button>
          
          <button 
            onClick={nextStep}
            className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 font-bold hover:bg-white/10 transition-all"
          >
            Next Step <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="p-6 bg-neutral-900 border border-white/5 rounded-2xl space-y-3"
  >
    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-2 text-xl">
      {icon}
    </div>
    <h3 className="text-sm font-black uppercase tracking-widest text-white">{title}</h3>
    <p className="text-[11px] text-text-muted font-medium">{desc}</p>
  </motion.div>
);

const ObjectiveItem = ({ icon, title, desc, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className="flex items-center gap-4 p-4 bg-neutral-900 border border-white/5 rounded-2xl group hover:border-accent-blue/30 transition-all"
  >
    <div className="w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center text-accent-blue">
      {icon}
    </div>
    <div className="text-left">
      <h4 className="text-xs font-black uppercase tracking-widest text-white">{title}</h4>
      <p className="text-[11px] text-text-muted">{desc}</p>
    </div>
    <div className="ml-auto">
      <CheckCircle2 size={16} className="text-white/10 group-hover:text-accent-blue transition-all" />
    </div>
  </motion.div>
);

export default OnboardingFlow;
