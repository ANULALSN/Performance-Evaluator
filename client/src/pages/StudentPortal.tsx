import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import type { User, DailyCheckIn, DailyTask } from '../types';
import api from '../api';
import { 
  CheckCircle, 
  Brain, 
  LogOut,
  Zap,
  Flame,
  LayoutDashboard,
  ClipboardList,
  Sparkles,
  ChevronRight,
  Send,
  Loader2,
  TrendingUp,
  AlertCircle,
  Trophy,
  User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Modular Components
import QuizList from '../components/student/QuizList';

const StudentPortal: React.FC = () => {
  const { user, logout } = useAppContext();
  const [activeTab, setActiveTab] = useState<'checkin' | 'tasks' | 'reviews' | 'quizzes' | 'stats'>('checkin');
  const [loading, setLoading] = useState(false);
  
  // Data State
  const [todayCheckin, setTodayCheckin] = useState<DailyCheckIn | null>(null);
  const [todayTasks, setTodayTasks] = useState<DailyTask | null>(null);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [{ data: checkin }, { data: tasks }] = await Promise.all([
          api.get('/student/today-checkin'),
          api.get('/student/today-tasks')
        ]);
        setTodayCheckin(checkin);
        setTodayTasks(tasks);
      } catch (err) {
        console.error('Portal Data Error', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleCompleteTask = async (taskId: string) => {
    try {
      const { data } = await api.patch(`/student/tasks/${taskId}/complete`);
      setTodayTasks(data);
    } catch (err) {
      console.error('Task Update Error', err);
    }
  };

  const menu = [
    { id: 'checkin', label: 'Check-in', icon: Send },
    { id: 'tasks', label: 'Work', icon: Zap },
    { id: 'reviews', label: 'Weekly', icon: ClipboardList },
    { id: 'quizzes', label: 'Assessments', icon: Brain },
    { id: 'stats', label: 'Profile', icon: LayoutDashboard },
  ];

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      {/* Sidebar */}
      <aside className="w-20 lg:w-72 bg-bg-secondary border-r border-white/5 p-6 flex flex-col items-center lg:items-start">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-accent-purple rounded-xl flex items-center justify-center">
            <Zap className="text-white fill-white" size={24} />
          </div>
          <span className="text-2xl font-outfit font-extrabold lg:block hidden tracking-tighter">SIPP</span>
        </div>

        <nav className="flex-1 w-full space-y-3">
          {menu.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-accent-purple/10 text-accent-purple ring-1 ring-accent-purple/30 font-bold' 
                  : 'text-text-muted hover:bg-neutral-800/50'
              }`}
            >
              <item.icon size={22} />
              <span className="lg:block hidden">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto w-full pt-8 border-t border-white/5">
          <div className="flex items-center gap-3 mb-6 lg:flex hidden">
            <div className="w-10 h-10 rounded-full bg-accent-purple/10 border border-accent-purple/30 flex items-center justify-center text-accent-purple font-bold">
               {user?.name.substring(0, 1)}
            </div>
            <div>
               <p className="font-bold text-sm truncate max-w-[120px]">{user?.name}</p>
               <p className="text-[10px] uppercase font-black tracking-widest text-text-muted">{user?.skillLevel}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-4 p-4 text-accent-amber hover:bg-accent-amber/10 rounded-xl transition-all">
            <LogOut size={22} />
            <span className="lg:block hidden">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-10 py-10">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold font-outfit mb-2 capitalize">{activeTab}</h1>
            <p className="text-text-muted">Tracking accountability & technical progression.</p>
          </div>

          <div className="flex gap-4">
             <div className="glass px-6 py-3 flex items-center gap-6">
                <div className="flex items-center gap-2">
                   <Zap size={20} className="text-accent-purple fill-accent-purple" />
                   <div>
                      <p className="text-[10px] uppercase font-bold text-text-muted">Total Score</p>
                      <p className="font-bold leading-tight">{user?.consistencyScore}</p>
                   </div>
                </div>
                <div className="w-px h-8 bg-white/5"></div>
                <div className="flex items-center gap-2">
                   <Flame size={20} className="text-accent-amber" />
                   <div>
                      <p className="text-[10px] uppercase font-bold text-text-muted">Streak</p>
                      <p className="font-bold leading-tight">{user?.streak} Days</p>
                   </div>
                </div>
             </div>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center pt-32 gap-4">
            <Loader2 size={42} className="text-accent-purple animate-spin" />
            <p className="text-text-muted font-medium">Syncing profile data...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'checkin' && <CheckinView todayCheckin={todayCheckin} onUpdate={setTodayCheckin} />}
              {activeTab === 'tasks' && <TasksView todayTasks={todayTasks} onComplete={handleCompleteTask} />}
              {activeTab === 'reviews' && <ReviewView />}
              {activeTab === 'quizzes' && <QuizList />}
              {activeTab === 'stats' && <ProfileView user={user} />}
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
};

// --- Subviews Components ---

const CheckinView: React.FC<{ todayCheckin: DailyCheckIn | null; onUpdate: (c: DailyCheckIn) => void }> = ({ todayCheckin, onUpdate }) => {
  const [formData, setFormData] = useState({ learned: '', built: '', problem: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/student/checkin', formData);
      onUpdate(data);
      (window as any).toast?.('Check-in logged successfully!', 'success');
    } catch (err) {
      console.error('Checkin failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (todayCheckin) {
    return (
      <div className="max-w-4xl space-y-10">
        <div className="card-premium p-12 text-center relative overflow-hidden bg-neutral-900 shadow-2xl">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <Sparkles size={160} className="text-accent-purple -rotate-12" />
           </div>
           
           <div className="w-20 h-20 bg-accent-green/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-accent-green/20">
              <CheckCircle className="text-accent-green" size={40} />
           </div>
           <h2 className="text-4xl font-bold font-outfit mb-4">Accountability Logged</h2>
           <p className="text-lg text-text-muted mb-12">Metrics synchronized. AI feedback is now live.</p>
           
           <div className="grid md:grid-cols-3 gap-6 text-left">
              <FeedbackCard type="feedback" title="Coach Analysis" content={todayCheckin.aiFeedback} color="purple" icon={UserIcon} />
              <FeedbackCard type="suggestion" title="Strategic Pivot" content={todayCheckin.aiSuggestion} color="blue" icon={Sparkles} />
              <FeedbackCard type="nextTask" title="Tomorrow's Objective" content={todayCheckin.nextTask} color="amber" icon={Zap} />
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-12">
        <h2 className="text-4xl font-bold font-outfit mb-4">Daily Report</h2>
        <p className="text-xl text-text-muted font-medium italic opacity-60">"Consistency is the only metric that matters at scale."</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          <InputArea num="1" label="What core technical concept did you master today?" value={formData.learned} onChange={(v: string) => setFormData({...formData, learned: v})} placeholder="e.g., Higher Order Components, Binary Search logic..." color="purple" />
          <InputArea num="2" label="What functional component did you build?" value={formData.built} onChange={(v: string) => setFormData({...formData, built: v})} placeholder="e.g., Implemented JWT middleware, built glassmorphism UI..." color="blue" />
          <InputArea num="3" label="Identify your primary technical blocker." value={formData.problem} onChange={(v: string) => setFormData({...formData, problem: v})} placeholder="e.g., Race condition in async calls, Redux state hydration..." color="amber" />
        </div>

        <button type="submit" disabled={submitting} className="btn-primary px-10 py-5 text-lg h-20 w-fit flex items-center gap-4 disabled:opacity-50">
          {submitting ? <Loader2 className="animate-spin" /> : 'Synchronize Accountability Data'}
          {!submitting && <ChevronRight />}
        </button>
      </form>
    </div>
  );
};

const FeedbackCard = ({ title, content, color, icon: Icon }: any) => {
  const colors: any = {
    purple: 'border-accent-purple/30 bg-accent-purple/5 text-accent-purple',
    blue: 'border-accent-blue/30 bg-accent-blue/5 text-accent-blue',
    amber: 'border-accent-amber/30 bg-accent-amber/5 text-accent-amber'
  };

  return (
    <div className={`p-6 rounded-2xl border ${colors[color]}`}>
       <div className="flex items-center gap-2 mb-4">
          <Icon size={14} className="opacity-80" />
          <p className="text-[10px] font-black uppercase tracking-widest">{title}</p>
       </div>
       <p className="text-sm font-medium leading-relaxed text-white/90 italic">"{content}"</p>
    </div>
  );
};

const InputArea = ({ num, label, value, onChange, placeholder, color }: any) => {
  const colors: any = {
    purple: 'bg-accent-purple/10 text-accent-purple',
    blue: 'bg-accent-blue/10 text-accent-blue',
    amber: 'bg-accent-amber/10 text-accent-amber'
  };
  return (
    <div className="space-y-4">
      <label className="text-lg font-bold flex items-center gap-4">
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${colors[color]}`}>{num}</span>
        {label}
      </label>
      <textarea 
         required rows={3} className="w-full bg-neutral-900 border border-white/5 rounded-2xl p-6 text-lg outline-none focus:border-white/20 transition-all resize-none placeholder:opacity-20"
         placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
      />
    </div>
  )
};

const TasksView: React.FC<{ todayTasks: DailyTask | null; onComplete: (id: string) => void }> = ({ todayTasks, onComplete }) => {
   const completedCount = todayTasks?.tasks.filter(t => t.completed).length || 0;
   const progressWidth = (completedCount / 3) * 100;

   return (
      <div className="max-w-4xl space-y-12">
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
            <div>
               <h2 className="text-5xl font-bold mb-3 font-outfit tracking-tight">The 3-Objective Rule</h2>
               <p className="text-text-muted text-lg max-w-xl">Each morning, AI generates three mission-critical tasks based on your current technical trajectory.</p>
            </div>
            <div className="text-right">
               <p className="text-3xl font-black font-outfit mb-2 text-accent-purple">{completedCount}/3 SECURED</p>
               <div className="w-64 h-2.5 bg-neutral-900 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-accent-purple transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(168,85,247,0.5)]" style={{ width: `${progressWidth}%` }}></div>
               </div>
            </div>
         </div>

         <div className="space-y-6">
            {todayTasks?.tasks.map((task, idx) => (
               <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={task._id} 
                  className={`card-premium p-8 py-10 flex items-center gap-10 cursor-pointer group transition-all ${
                    task.completed ? 'opacity-40 border-accent-green/20' : 'hover:translate-x-3 active:scale-[0.99]'
                  }`}
                  onClick={() => !task.completed && onComplete(task._id)}
               >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
                     task.completed ? 'bg-accent-green border-accent-green text-white shadow-lg' : 'bg-neutral-900 border-white/5 text-text-muted group-hover:border-accent-purple group-hover:text-accent-purple'
                  }`}>
                     {task.completed ? <CheckCircle size={30} /> : <Zap size={30} />}
                  </div>
                  
                  <div className="flex-1">
                     <span className="text-[10px] uppercase font-black tracking-widest text-accent-purple mb-3 block italic">{task.type} Alignment</span>
                     <h3 className={`text-2xl font-bold font-outfit transition-all ${task.completed ? 'line-through opacity-50' : ''}`}>{task.title}</h3>
                  </div>

                  {!task.completed && <ChevronRight className="text-text-muted group-hover:text-white group-hover:translate-x-2 transition-all" size={24} />}
                  {task.completed && <Badge label="Objective Met" color="green" />}
               </motion.div>
            ))}
         </div>

         {todayTasks?.allCompleted && (
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="p-12 card-premium text-center border-accent-purple/30 bg-accent-purple/5 shadow-2xl shadow-accent-purple/10">
               <Trophy size={64} className="mx-auto text-accent-amber mb-6 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
               <h3 className="text-4xl font-extrabold mb-3 font-outfit">Perfect Performance!</h3>
               <p className="text-white/60 text-lg mb-8 max-w-md mx-auto">All daily objectives secured. You've earned a +3 accountability bonus to your global profile rank.</p>
               <div className="px-8 py-3 bg-accent-purple text-white inline-block rounded-xl font-black text-xs uppercase tracking-widest">Efficiency Streak Active</div>
            </motion.div>
         )}
      </div>
   )
}

const ReviewView: React.FC = () => {
   const [formData, setFormData] = useState({ completed: '', incomplete: '', improvement: '' });
   const [submitting, setSubmitting] = useState(false);
   const [review, setReview] = useState<any>(null);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      try {
         const { data } = await api.post('/student/weekly-review', formData);
         setReview(data);
      } catch (err) {
         console.error('Review failed', err);
      } finally {
         setSubmitting(false);
      }
   };

   if (review) {
      return (
         <div className="max-w-4xl space-y-10">
            <h2 className="text-5xl font-black font-outfit tracking-tighter">Strategic Audit Complete</h2>
            <div className="card-premium p-12 bg-neutral-900 border-white/5 space-y-12">
               <div>
                  <div className="flex items-center gap-3 mb-6">
                     <Sparkles size={20} className="text-accent-purple" />
                     <h3 className="text-xs uppercase font-black tracking-widest text-accent-purple">Mentor Diagnostic Verdict</h3>
                  </div>
                  <p className="text-2xl font-medium italic text-white/90 leading-relaxed">"{review.feedbackSummary}"</p>
               </div>
               
               <div className="grid md:grid-cols-2 gap-8">
                  <div className="p-8 rounded-3xl bg-white/2 border border-white/5">
                     <div className="flex items-center gap-3 mb-8">
                        <AlertCircle size={20} className="text-accent-amber" />
                        <h4 className="font-black text-[10px] uppercase tracking-widest">Corrective Focus</h4>
                     </div>
                     <ul className="space-y-4">
                        {review.weaknessAnalysis.map((w: string, i: number) => (
                           <li key={i} className="text-sm text-text-muted flex gap-3">
                              <span className="shrink-0 text-accent-amber">•</span> {w}
                           </li>
                        ))}
                     </ul>
                  </div>
                  <div className="p-8 rounded-3xl bg-accent-purple/5 border border-accent-purple/20">
                     <div className="flex items-center gap-3 mb-8">
                        <TrendingUp size={20} className="text-accent-purple" />
                        <h4 className="font-black text-[10px] uppercase tracking-widest">Growth Roadmap</h4>
                     </div>
                     <ul className="space-y-4">
                        {review.nextWeekRoadmap.map((r: string, i: number) => (
                           <li key={i} className="text-sm font-bold text-white/80 flex gap-3">
                              <span className="shrink-0 text-accent-green">→</span> {r}
                           </li>
                        ))}
                     </ul>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="max-w-3xl">
         <h2 className="text-5xl font-black font-outfit mb-4 tracking-tighter">Weekly Calibration</h2>
         <p className="text-text-muted text-xl mb-12 italic opacity-60">Analyze the past 168 hours to optimize the next.</p>
         <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-10">
               <ReviewField label="1. List your significant technical milestones." value={formData.completed} onChange={(v: string) => setFormData({...formData, completed: v})} />
               <ReviewField label="2. Which objectives were not successfully met?" value={formData.incomplete} onChange={(v: string) => setFormData({...formData, incomplete: v})} />
               <ReviewField label="3. Where do you need mentor intervention?" value={formData.improvement} onChange={(v: string) => setFormData({...formData, improvement: v})} />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full h-16 text-lg font-bold tracking-widest uppercase">
               {submitting ? 'Generating Strategic Analysis...' : 'Submit Audit for AI Review'}
            </button>
         </form>
      </div>
   );
};

const ReviewField = ({ label, value, onChange }: any) => (
   <div className="space-y-4">
      <label className="font-black text-[10px] uppercase tracking-widest text-text-muted opacity-80">{label}</label>
      <textarea 
         required rows={4} className="w-full bg-neutral-900 border border-white/5 rounded-2xl p-6 text-lg outline-none focus:border-white/20 transition-all resize-none shadow-inner" 
         value={value} onChange={(e) => onChange(e.target.value)} 
      />
   </div>
);

const ProfileView: React.FC<{ user: any }> = ({ user }) => {
   return (
      <div className="max-w-5xl space-y-12">
         <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-8">
               <div className="card-premium p-10 text-center bg-neutral-900 shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/5 to-transparent pointer-events-none"></div>
                  <div className="w-24 h-24 bg-accent-purple/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-accent-purple border border-accent-purple/20">
                     <UserIcon size={48} />
                  </div>
                  <h2 className="text-3xl font-black font-outfit tracking-tighter">{user.name}</h2>
                  <p className="text-accent-purple font-black text-[10px] uppercase tracking-widest mt-2">{user.skillLevel} Specialist</p>
                  
                  <div className="w-full h-px bg-white/5 my-8"></div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <p className="text-[10px] uppercase font-bold text-text-muted mb-1">XP Points</p>
                        <p className="font-black text-2xl font-outfit">{user.consistencyScore}</p>
                     </div>
                     <div>
                        <p className="text-[10px] uppercase font-bold text-text-muted mb-1">Streak</p>
                        <p className="font-black text-2xl font-outfit">{user.streak}d</p>
                     </div>
                  </div>
               </div>
               
               <div className="card-premium p-8">
                  <h3 className="font-black text-[10px] uppercase tracking-widest text-text-muted mb-6">Expertise Profile</h3>
                  <div className="flex flex-wrap gap-2">
                     <span className="px-3 py-1.5 bg-neutral-900 border border-white/5 text-white rounded-lg text-xs font-bold">{user.techStack}</span>
                  </div>
               </div>
            </div>

            <div className="md:col-span-2 space-y-8">
               <div className="card-premium p-10 h-full border-white/5 bg-neutral-950 shadow-2xl">
                  <h3 className="text-xl font-bold font-outfit mb-8">System Analysis: Cognitive Weakness Tags</h3>
                  <div className="flex flex-wrap gap-3">
                     {user.weaknessTags && user.weaknessTags.length > 0 ? user.weaknessTags.map((tag: string, i: number) => (
                        <div key={i} className="px-5 py-2.5 bg-accent-amber/5 border border-accent-amber/20 text-accent-amber rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                           <AlertCircle size={14} /> {tag}
                        </div>
                     )) : (
                        <div className="py-12 w-full text-center glass border-dashed">
                           <p className="text-text-muted italic text-sm">Log your first check-in to generate cognitive mapping.</p>
                        </div>
                     )}
                  </div>
                  
                  <div className="mt-20 p-10 bg-accent-purple/5 border border-accent-purple/20 rounded-3xl relative overflow-hidden group">
                     <div className="relative z-10">
                        <h4 className="text-2xl font-black mb-3 flex items-center gap-3 font-outfit text-accent-purple tracking-tighter">
                           Certification Roadmap
                        </h4>
                        <p className="text-white/40 text-sm leading-relaxed max-w-lg font-medium">
                           Your performance metrics are being analyzed for cohort eligibility. Maintain a 5-day streak to unlock advanced technical pushed content and peer review sessions.
                        </p>
                     </div>
                     <div className="absolute right-[-40px] top-[-40px] p-24 opacity-5 rotate-12 group-hover:rotate-45 group-hover:opacity-10 transition-all duration-700">
                        <Zap size={200} className="text-accent-purple" />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

const Badge = ({ label, color }: any) => {
   const styles: any = {
      green: 'bg-accent-green/10 text-accent-green border-accent-green/30'
   };
   return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[color]}`}>
         {label}
      </span>
   );
};

export default StudentPortal;
