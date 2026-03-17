import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import type { User } from '../types';
import api from '../api';
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  Trophy, 
  Search, 
  AlertCircle,
  TrendingUp,
  User as UserIcon,
  ChevronRight,
  Filter,
  LogOut,
  Clock,
  Download,
  Zap,
  ArrowUpRight,
  MoreVertical,
  Target,
  FlaskConical,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Modular Components
import QuizBuilderPage from '../components/admin/QuizBuilderPage';
import QuizResultsView from '../components/admin/QuizResultsView';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAppContext();
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'quizzes' | 'leaderboard'>('overview');
  const [students, setStudents] = useState<User[]>([]);
  const [dropoffs, setDropoffs] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [{ data: sData }, { data: aData }] = await Promise.all([
        api.get('admin/students'),
        api.get('admin/analytics')
      ]);
      setStudents(sData);
      setAnalytics(aData);
      
      // Filter dropoffs (inactive 48h+)
      const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
      setDropoffs(sData.filter((s: User) => new Date(s.lastActiveAt) < fortyEightHoursAgo));
    } catch (err) {
      console.error('Admin Data Error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleExportStudents = async () => {
    try {
      const res = await api.get('export/students', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sipp_students_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed');
    }
  };

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden font-inter">
      {/* Sidebar */}
      <aside className="w-20 lg:w-72 bg-bg-secondary border-r border-white/5 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-accent-blue rounded-xl flex items-center justify-center shadow-lg shadow-accent-blue/20">
            <BarChart3 className="text-white" size={24} />
          </div>
          <span className="text-2xl font-outfit font-extrabold lg:block hidden tracking-tighter">SIPP <span className="text-accent-blue">ADMIN</span></span>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem id="overview" label="Dashboard" icon={BarChart3} active={activeTab} setActive={setActiveTab} />
          <NavItem id="students" label="Student Roster" icon={Users} active={activeTab} setActive={setActiveTab} />
          <NavItem id="quizzes" label="Content Bank" icon={BookOpen} active={activeTab} setActive={setActiveTab} />
          <NavItem id="leaderboard" label="High Performers" icon={Trophy} active={activeTab} setActive={setActiveTab} />
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
           <div className="flex items-center gap-3 p-4 mb-6 lg:flex hidden">
              <div className="w-10 h-10 rounded-xl bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center text-accent-blue font-bold">
                 A
              </div>
              <div>
                 <p className="font-bold text-sm">Coordinator</p>
                 <p className="text-[10px] uppercase font-black tracking-widest text-text-muted">Root Privileges</p>
              </div>
           </div>
           <button onClick={logout} className="w-full flex items-center gap-4 p-4 text-text-muted hover:text-white hover:bg-white/5 rounded-xl transition-all">
             <LogOut size={22} />
             <span className="lg:block hidden font-medium">System Logout</span>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10 relative">
        <header className="flex justify-between items-center mb-12">
           <div>
              <h1 className="text-2xl font-extrabold font-outfit mb-2 tracking-tighter">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
              <p className="text-text-muted text-sm font-medium">Cohort orchestration & strategic oversight.</p>
           </div>
           
           <div className="flex items-center gap-4">
              <button 
                onClick={fetchAdminData}
                className="p-3 bg-white/5 border border-white/10 rounded-xl text-text-muted hover:text-white transition-all"
              >
                 <RefreshCw size={20} />
              </button>
              <div className="glass px-6 py-2.5 flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse"></div>
                 <span className="text-xs font-black uppercase tracking-widest italic">{students.length} ACTIVE TRAINEES</span>
              </div>
           </div>
        </header>

        {loading && activeTab !== 'quizzes' && (
           <div className="flex flex-col items-center justify-center pt-32 gap-4">
              <Loader2 size={48} className="text-accent-blue animate-spin" />
              <p className="text-text-muted font-medium">Synchronizing cohort state...</p>
           </div>
        )}

        {!loading && (
           <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                 {activeTab === 'overview' && (
                    <div className="space-y-10">
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <StatCard label="Trainee Population" value={analytics?.totalStudents || 0} icon={Users} trend="+4 new this week" color="blue" />
                          <StatCard label="Technical Accuracy" value={`${Math.round(analytics?.avgScore || 0)}%`} icon={Target} trend="+5% improvement" color="purple" />
                          <StatCard label="Drop-off Risk" value={dropoffs.length} icon={AlertCircle} subLabel="Inactive 48h+" color="amber" />
                       </div>

                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                          <div className="card-premium p-8 bg-neutral-900 border-white/5 shadow-2xl">
                             <div className="flex justify-between items-center mb-10">
                                <div>
                                   <h3 className="text-lg font-bold font-outfit">Priority Intervention Alerts</h3>
                                   <p className="text-text-muted text-[10px] mt-1">Students flagged for immediate follow-up.</p>
                                </div>
                                <button className="p-2 border border-white/10 rounded-lg text-text-muted">
                                   <MoreVertical size={20} />
                                </button>
                             </div>
                             <div className="space-y-4">
                                {dropoffs.length > 0 ? dropoffs.map(s => (
                                   <div key={s._id} className="p-5 bg-accent-amber/5 border border-accent-amber/10 rounded-2xl flex items-center justify-between group hover:border-accent-amber/30 transition-all">
                                      <div className="flex items-center gap-6">
                                         <div className="w-12 h-12 bg-accent-amber/10 rounded-xl flex items-center justify-center text-accent-amber shadow-inner">
                                            <UserIcon size={24} />
                                         </div>
                                         <div>
                                            <p className="font-bold text-white tracking-tight">{s.name}</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-accent-amber opacity-60">Stagnant since {new Date(s.lastActiveAt).toLocaleDateString()}</p>
                                         </div>
                                      </div>
                                      <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-text-muted group-hover:bg-accent-amber group-hover:text-bg-primary transition-all">
                                         <ChevronRight size={20} />
                                      </button>
                                   </div>
                                )) : (
                                   <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                      <p className="text-text-muted italic text-sm">No critical inactivity detected across the cohort.</p>
                                   </div>
                                )}
                             </div>
                          </div>

                          <div className="card-premium p-10 bg-neutral-950 shadow-2xl">
                             <h3 className="text-lg font-bold font-outfit mb-10">Real-time Progression Log</h3>
                             <div className="space-y-10 relative">
                                <div className="absolute left-[23px] top-4 bottom-4 w-px bg-white/5"></div>
                                {students.slice(0, 4).map((s, i) => (
                                   <div key={s._id} className="flex gap-8 relative z-10">
                                      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 transition-all ${
                                        i === 0 ? 'bg-accent-purple border-accent-purple shadow-lg shadow-accent-purple/20 text-white' : 'bg-neutral-900 border-white/5 text-text-muted'
                                      }`}>
                                         {i === 0 ? <Zap size={22} className="fill-white" /> : <Clock size={20} />}
                                      </div>
                                      <div className="flex-1">
                                         <p className="font-bold text-sm text-text-primary tracking-tight">
                                           {s.name} <span className="text-text-muted font-medium ml-2">— Synchronized 3/3 daily objectives</span>
                                         </p>
                                         <div className="flex items-center gap-3 mt-2">
                                            <div className="px-2 py-0.5 bg-white/5 rounded text-[8px] font-black uppercase text-accent-blue">{s.techStack}</div>
                                            <div className="text-[10px] font-bold text-accent-green italic flex items-center gap-1">
                                              <ArrowUpRight size={12} /> XP Velocity +15%
                                            </div>
                                         </div>
                                      </div>
                                   </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>
                 )}

                 {activeTab === 'students' && (
                    <div className="glass overflow-hidden border-white/5 bg-neutral-900 shadow-2xl">
                       <div className="p-8 border-b border-white/5 flex flex-wrap gap-4 items-center justify-between">
                          <div className="relative w-full md:w-96">
                             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                             <input className="w-full bg-bg-primary border border-white/5 rounded-2xl pl-12 pr-4 py-3 placeholder:opacity-20 outline-none focus:border-accent-blue transition-all" placeholder="Quick search trainees..." />
                          </div>
                          <div className="flex gap-4">
                             <button className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white/10 transition-all"><Filter size={18} /> Filters</button>
                             <button 
                               onClick={handleExportStudents}
                               className="px-6 py-2.5 bg-accent-blue text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-accent-blue/20"
                             >
                               <Download size={18} /> Export Cohort CSV
                             </button>
                          </div>
                       </div>
                       <div className="overflow-x-auto">
                          <table className="w-full text-left">
                             <thead>
                                <tr className="bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-text-muted border-b border-white/5">
                                   <th className="px-8 py-6">Rank</th>
                                   <th className="px-8 py-6">Student Identity</th>
                                   <th className="px-8 py-6">Consistency Score</th>
                                   <th className="px-8 py-6">Current Streak</th>
                                   <th className="px-8 py-6">Tech Stack</th>
                                   <th className="px-8 py-6 text-right">Insight</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-white/5">
                                {students.map((s, idx) => (
                                   <tr key={s._id} className="hover:bg-white/[0.02] transition-colors group">
                                      <td className="px-8 py-6 font-outfit font-black text-xs text-text-muted">#{idx + 1}</td>
                                      <td className="px-8 py-6">
                                         <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center text-accent-blue font-bold text-xs uppercase italic border border-accent-blue/20">
                                               {s.name.substring(0, 1) + (s.name.split(' ')[1]?.substring(0, 1) || '')}
                                            </div>
                                            <div>
                                               <p className="font-bold text-sm tracking-tight">{s.name}</p>
                                               <p className="text-[10px] text-text-muted font-medium">{s.email}</p>
                                            </div>
                                         </div>
                                      </td>
                                      <td className="px-8 py-6 italic font-black text-accent-purple text-lg font-outfit">{s.consistencyScore} <span className="text-[10px] opacity-30 not-italic">XP</span></td>
                                      <td className="px-8 py-6">
                                         <div className="flex items-center gap-2">
                                            <div className="px-3 py-1 bg-accent-amber/5 border border-accent-amber/20 rounded-lg flex items-center gap-2 text-accent-amber font-black text-[10px] tracking-tighter">
                                               <TrendingUp size={12} /> {s.streak} DAY STREAK
                                            </div>
                                         </div>
                                      </td>
                                      <td className="px-8 py-6">
                                         <div className="flex gap-2">
                                            <span className="px-2.5 py-1 bg-neutral-800 text-white rounded-lg text-[9px] font-black uppercase tracking-widest italic">{s.techStack}</span>
                                         </div>
                                      </td>
                                      <td className="px-8 py-6 text-right">
                                         <button className="text-accent-blue text-xs font-black uppercase tracking-widest hover:underline opacity-0 group-hover:opacity-100 transition-all">Audit History</button>
                                      </td>
                                   </tr>
                                ))}
                             </tbody>
                          </table>
                       </div>
                    </div>
                 )}

                 {activeTab === 'quizzes' && (
                    <div className="space-y-8">
                       {selectedQuizId ? (
                         <div className="space-y-8">
                             <button 
                               onClick={() => setSelectedQuizId(null)}
                               className="flex items-center gap-2 text-text-muted hover:text-white transition-all font-bold text-sm"
                             >
                               <ChevronRight size={18} className="rotate-180" /> Back to Assessment Bank
                             </button>
                             <QuizResultsView quizId={selectedQuizId} />
                         </div>
                       ) : (
                         <div className="space-y-12">
                            <div className="flex justify-between items-end">
                               <div>
                                  <h2 className="text-2xl font-bold font-outfit mb-2">Content Bank</h2>
                                  <p className="text-text-muted text-sm font-medium italic">Create and oversee technical validation modules.</p>
                               </div>
                               <button 
                                 onClick={() => { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}}
                                 className="btn-primary flex items-center gap-2 py-3 px-6 h-12"
                               >
                                  <FlaskConical size={20} /> Create New Assessment
                               </button>
                            </div>
                            
                            <ActiveQuizzes onSelect={setSelectedQuizId} />
                            
                            <div className="pt-12 border-t border-white/5">
                               <h3 className="text-2xl font-bold font-outfit mb-10">Module Architect</h3>
                               <QuizBuilderPage />
                            </div>
                         </div>
                       )}
                    </div>
                 )}
              </motion.div>
           </AnimatePresence>
        )}
      </main>
    </div>
  );
};

const ActiveQuizzes: React.FC<{ onSelect: (id: string) => void }> = ({ onSelect }) => {
   const [quizzes, setQuizzes] = useState<any[]>([]);
   
   const fetchQuizzes = async () => {
      try {
         const { data } = await api.get('admin/quizzes');
         setQuizzes(data);
      } catch (err) {
         console.error(err);
      }
   };

   useEffect(() => { fetchQuizzes(); }, []);

   return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
         {quizzes.map(quiz => (
            <div key={quiz._id} className="card-premium p-8 py-10 flex flex-col items-start bg-neutral-900 border-white/5 shadow-2xl">
               <div className="flex justify-between items-center w-full mb-6">
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                    quiz.isActive ? 'bg-accent-green/10 text-accent-green border-accent-green/20' : 'bg-white/5 text-text-muted border-white/10'
                  }`}>
                    {quiz.isActive ? 'Active Module' : 'In Draft'}
                  </span>
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">{quiz.techStack}</span>
               </div>
               <h4 className="text-xl font-bold font-outfit mb-2 leading-tight tracking-tight">{quiz.title}</h4>
               <p className="text-text-muted text-sm line-clamp-2 mb-8">{quiz.description}</p>
               
               <div className="mt-auto w-full pt-6 border-t border-white/5 flex items-center justify-between">
                  <div>
                     <p className="text-[10px] uppercase font-black tracking-widest text-text-muted">Total Participation</p>
                     <p className="font-bold text-lg font-outfit">{quiz.attemptCount || 0} Trainees</p>
                  </div>
                  <button 
                    onClick={() => onSelect(quiz._id)}
                    className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-accent-blue hover:bg-accent-blue hover:text-white transition-all shadow-lg"
                  >
                     <Target size={24} />
                  </button>
               </div>
            </div>
         ))}
      </div>
   );
};

const NavItem = ({ id, label, icon: Icon, active, setActive }: any) => (
   <button
      onClick={() => setActive(id)}
      className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
      active === id 
         ? 'bg-accent-blue/10 text-accent-blue ring-1 ring-accent-blue/30 font-bold' 
         : 'text-text-muted hover:bg-neutral-800/50'
      }`}
   >
      <Icon size={22} />
      <span className="lg:block hidden text-sm font-medium">{label}</span>
   </button>
);

const StatCard = ({ label, value, icon: Icon, trend, subLabel, color }: any) => {
   const colors: any = {
      blue: 'text-accent-blue bg-accent-blue/10 border-accent-blue/20',
      purple: 'text-accent-purple bg-accent-purple/10 border-accent-purple/20',
      amber: 'text-accent-amber bg-accent-amber/10 border-accent-amber/20'
   };

   return (
      <div className="card-premium h-fit bg-neutral-900 border-white/5 p-8 shadow-2xl">
         <div className="flex justify-between items-start mb-10">
            <div className={`p-4 rounded-2xl border ${colors[color]}`}>
               <Icon size={28} />
            </div>
            {trend && <span className="text-[10px] font-black uppercase tracking-widest text-accent-green bg-accent-green/10 border border-accent-green/20 px-3 py-1.5 rounded-full">{trend}</span>}
         </div>
         <h4 className="text-text-muted text-xs uppercase font-black tracking-widest mb-1 opacity-60 font-inter">{label}</h4>
         <div className="flex items-baseline gap-3">
            <span className="text-5xl font-black font-outfit tracking-tighter">{value}</span>
            {subLabel && <span className="text-text-muted text-xs font-bold uppercase tracking-widest opacity-40">{subLabel}</span>}
         </div>
      </div>
   );
};

export default AdminDashboard;
