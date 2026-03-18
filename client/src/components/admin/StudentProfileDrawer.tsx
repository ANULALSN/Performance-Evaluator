import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Flame, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Award,
  Calendar,
  Clock,
  Send,
  Loader2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Area, 
  AreaChart 
} from 'recharts';
import { formatDistanceToNow, format } from 'date-fns';
import api from '../../api';

interface StudentProfileDrawerProps {
  studentId: string | null;
  onClose: () => void;
}

const StudentProfileDrawer: React.FC<StudentProfileDrawerProps> = ({ studentId, onClose }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [activeHistoryTab, setActiveHistoryTab] = useState<'mcq' | 'coding'>('mcq');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (studentId) {
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [studentId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`admin/students/${studentId}/profile`);
      setProfile(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !studentId) return;
    setSending(true);
    try {
      await api.post(`admin/interventions/${studentId}/notify`, { message });
      setMessage('');
      setShowMessageModal(false);
      alert('Message sent successfully');
    } catch (err) {
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {studentId && (
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {studentId && (
          <motion.div
            key="drawer-content"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-[480px] bg-bg-primary border-l border-white/5 flex flex-col shadow-2xl"
          >
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-accent-blue" size={32} />
                <p className="text-text-muted font-bold text-xs uppercase tracking-widest">Loading Dossier...</p>
              </div>
            ) : profile ? (
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Header Section */}
                <div className="p-8 space-y-6 bg-gradient-to-b from-neutral-900 to-transparent">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h2 className="text-3xl font-black font-outfit tracking-tighter">{profile.student.name}</h2>
                      <p className="text-text-muted text-sm font-medium">{profile.student.email}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge label={profile.student.techStack} color="blue" />
                    <Badge label={profile.student.skillLevel} color="purple" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-neutral-900 rounded-2xl p-5 border border-white/5 space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Consistency Score</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-black font-outfit ${profile.student.consistencyScore > 50 ? 'text-accent-green' : 'text-accent-amber'}`}>
                          {profile.student.consistencyScore}
                        </span>
                        <Zap size={16} className="text-accent-purple fill-accent-purple" />
                      </div>
                    </div>
                    <div className="bg-neutral-900 rounded-2xl p-5 border border-white/5 space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Current Streak</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black font-outfit text-white">{profile.student.streak} Days</span>
                        <Flame size={20} className="text-accent-error fill-accent-error" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted block">Cognitive Weakness Tags</span>
                    <div className="flex flex-wrap gap-2">
                      {profile.student.weaknessTags.map((tag: string, i: number) => (
                        <div key={i} className="px-3 py-1 bg-accent-amber/10 border border-accent-amber/20 rounded-lg text-[10px] font-black text-accent-amber uppercase tracking-widest">
                          {tag}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2 text-text-muted text-xs font-medium">
                      <Clock size={14} />
                      Last active: {formatDistanceToNow(new Date(profile.student.lastActiveAt))} ago
                    </div>
                    <button 
                      onClick={() => setShowMessageModal(true)}
                      className="btn-primary h-10 px-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                    >
                      <MessageSquare size={14} /> Send Message
                    </button>
                  </div>
                </div>

                <div className="p-8 space-y-10">
                  {/* Last 7 Days Activity */}
                  <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-accent-blue pl-3">Last 7 Days Activity</h3>
                    <div className="grid grid-cols-7 gap-1">
                      {profile.last7Days.map((day: any, i: number) => (
                        <button
                          key={day.date}
                          onClick={() => setExpandedDay(expandedDay === day.date ? null : day.date)}
                          className={`h-12 rounded-lg border transition-all flex flex-col items-center justify-center gap-1 ${
                            expandedDay === day.date ? 'bg-accent-blue border-accent-blue text-white shadow-lg' : 'bg-neutral-900 border-white/5 hover:border-white/20'
                          }`}
                        >
                          <span className={`text-[8px] font-black uppercase ${expandedDay === day.date ? 'text-white' : 'text-text-muted'}`}>
                            {format(new Date(day.date), 'EEE')}
                          </span>
                          <div className={`w-2 h-2 rounded-full ${
                             day.pointsEarned >= 4 ? 'bg-accent-green' : day.pointsEarned > 0 ? 'bg-accent-amber' : 'bg-accent-error'
                          }`} />
                        </button>
                      ))}
                    </div>

                    <AnimatePresence>
                      {expandedDay && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6 space-y-6">
                            {profile.last7Days.find((d: any) => d.date === expandedDay)?.checkInText ? (
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-accent-blue">Daily Log</label>
                                  <div className="space-y-3 p-4 bg-black/20 rounded-xl text-xs font-medium leading-relaxed">
                                    <p><span className="text-text-muted">Mastered:</span> {profile.last7Days.find((d: any) => d.date === expandedDay).checkInText.learned}</p>
                                    <p><span className="text-text-muted">Built:</span> {profile.last7Days.find((d: any) => d.date === expandedDay).checkInText.built}</p>
                                    <p><span className="text-text-muted">Blocker:</span> {profile.last7Days.find((d: any) => d.date === expandedDay).checkInText.problem}</p>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-accent-purple">Mentor Feedback</label>
                                  <blockquote className="p-4 border-l-2 border-accent-purple bg-accent-purple/5 italic text-xs leading-relaxed">
                                    "{profile.last7Days.find((d: any) => d.date === expandedDay).aiFeedback}"
                                  </blockquote>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Tasks Status</label>
                                  <div className="space-y-2">
                                    {profile.last7Days.find((d: any) => d.date === expandedDay).tasksAssigned.map((t: any, idx: number) => (
                                      <div key={idx} className="flex items-center gap-3 text-[11px] font-bold">
                                        {t.completed ? <CheckCircle2 size={12} className="text-accent-green"/> : <XCircle size={12} className="text-white/10" />}
                                        <span className={t.completed ? 'text-white' : 'text-text-muted'}>{t.title}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="py-8 text-center bg-black/20 rounded-xl">
                                <Calendar size={24} className="mx-auto text-white/5 mb-2" />
                                <p className="text-text-muted text-[10px] uppercase font-black">No accountability log for this date.</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Score Timeline Chart */}
                  <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-accent-purple pl-3">Cohort Performance Rank</h3>
                    <div className="h-40 w-full bg-neutral-900 border border-white/5 rounded-2xl p-4 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={profile.scoreTimeline}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                                    labelStyle={{ color: '#aaa', fontSize: '8px', fontWeight: 'bold', marginBottom: '4px' }}
                                />
                                <Area type="monotone" dataKey="weeklyScore" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Assessment History */}
                  <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-accent-amber pl-3">Assessment History</h3>
                    <div className="flex bg-neutral-900 p-1 rounded-xl border border-white/5 w-full">
                      <button 
                         onClick={() => setActiveHistoryTab('mcq')}
                         className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeHistoryTab === 'mcq' ? 'bg-white/5 text-white' : 'text-text-muted'}`}
                      >MCQ Quizzes</button>
                      <button 
                         onClick={() => setActiveHistoryTab('coding')}
                         className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeHistoryTab === 'coding' ? 'bg-white/5 text-white' : 'text-text-muted'}`}
                      >Coding Challenges</button>
                    </div>

                    <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {activeHistoryTab === 'mcq' ? (
                            <table className="w-full text-left">
                                <thead className="sticky top-0 bg-bg-primary text-[8px] font-black text-text-muted uppercase tracking-widest border-b border-white/5">
                                    <tr>
                                        <th className="py-2">Quiz Name</th>
                                        <th className="py-2">Score</th>
                                        <th className="py-2">Verdict</th>
                                        <th className="py-2 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {profile.quizHistory.map((q: any, i: number) => (
                                        <tr key={i} className="text-[10px] font-bold">
                                            <td className="py-3 text-white truncate max-w-[120px]">{q.title}</td>
                                            <td className="py-3 font-black">{q.score}%</td>
                                            <td className="py-3">
                                                <span className={q.passed ? 'text-accent-green' : 'text-accent-error'}>
                                                    {q.passed ? 'SECURED' : 'DENIED'}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right text-text-muted">{format(new Date(q.attemptedAt), 'MMM d')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="sticky top-0 bg-bg-primary text-[8px] font-black text-text-muted uppercase tracking-widest border-b border-white/5">
                                    <tr>
                                        <th className="py-2">Problem</th>
                                        <th className="py-2">Lang</th>
                                        <th className="py-2">Status</th>
                                        <th className="py-2 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {profile.codingHistory.map((c: any, i: number) => (
                                        <tr key={i} className="text-[10px] font-bold">
                                            <td className="py-3 text-white truncate max-w-[120px]">{c.title}</td>
                                            <td className="py-3 text-text-muted uppercase">{c.language}</td>
                                            <td className="py-3">
                                                <span className={c.status === 'accepted' ? 'text-accent-green' : 'text-accent-amber'}>
                                                    {c.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right text-text-muted">{format(new Date(c.attemptedAt), 'MMM d')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {((activeHistoryTab === 'mcq' && profile.quizHistory.length === 0) || (activeHistoryTab === 'coding' && profile.codingHistory.length === 0)) && (
                            <div className="py-10 text-center text-text-muted text-[10px] font-black uppercase opacity-20">No history available</div>
                        )}
                    </div>
                  </div>

                  {/* Weekly Reviews */}
                  <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-accent-green pl-3">Historical Weekly Reviews</h3>
                    <div className="space-y-4">
                        {profile.weeklyReviews.map((review: any, i: number) => (
                            <ReviewCard key={i} review={review} />
                        ))}
                        {profile.weeklyReviews.length === 0 && (
                            <div className="py-10 text-center bg-neutral-900 border border-white/5 rounded-2xl">
                                <Award size={24} className="mx-auto text-white/5 mb-2" />
                                <p className="text-text-muted text-[10px] uppercase font-black">No reviews submitted yet.</p>
                            </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
                <div className="w-16 h-16 bg-accent-error/10 text-accent-error rounded-2xl flex items-center justify-center">
                    <XCircle size={32} />
                </div>
                <p className="text-text-muted font-bold text-sm">Failed to retrieve student profile.</p>
                <button onClick={fetchProfile} className="btn-primary h-12 px-8">Retry Fetch</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Modal */}
      <AnimatePresence>
        {showMessageModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-neutral-900 border border-white/10 rounded-3xl p-8 max-w-md w-full space-y-6 shadow-2xl"
            >
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold font-outfit text-white">Direct Intervention</h3>
                        <p className="text-text-muted text-xs mt-1">Intervening with: {profile?.student.name}</p>
                    </div>
                    <button onClick={() => setShowMessageModal(false)} className="p-2 hover:bg-white/5 rounded-xl"><XCircle size={20}/></button>
                </div>

                <textarea 
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Provide performance feedback or guidance..."
                    className="w-full h-32 bg-black/40 border border-white/5 rounded-2xl p-4 text-sm font-medium outline-none focus:border-accent-blue transition-all"
                />

                <button 
                    onClick={handleSendMessage}
                    disabled={sending || !message.trim()}
                    className="w-full btn-primary h-12 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px]"
                >
                    {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} 
                    Dispatch Guidance
                </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

const ReviewCard = ({ review }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-neutral-900 border border-white/5 rounded-2xl overflow-hidden">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-all"
            >
                <div className="text-left">
                    <p className="text-[10px] font-black uppercase text-accent-green tracking-widest">Week of {format(new Date(review.weekStartDate), 'MMM d, yyyy')}</p>
                    <p className="text-xs font-bold mt-0.5">Accountability Review</p>
                </div>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden border-t border-white/5"
                    >
                        <div className="p-6 space-y-6 bg-black/20">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[8px] font-black uppercase text-text-muted mb-2 tracking-widest">Accomplished</p>
                                    <p className="text-xs leading-relaxed">{review.completed}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black uppercase text-text-muted mb-2 tracking-widest">Blockers</p>
                                    <p className="text-xs leading-relaxed">{review.incomplete}</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <p className="text-[8px] font-black uppercase text-accent-purple mb-2 tracking-widest">AI Audit Summary</p>
                                <blockquote className="p-4 bg-accent-purple/5 border-l-2 border-accent-purple text-xs leading-relaxed italic">
                                    "{review.feedbackSummary || review.aiFeedback}"
                                </blockquote>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[8px] font-black uppercase text-accent-green mb-2 tracking-widest">Next Week Roadmap</p>
                                <div className="space-y-2">
                                    {(review.nextWeekRoadmap || []).map((item: string, idx: number) => (
                                        <div key={idx} className="flex gap-2 text-[11px] font-bold">
                                            <span className="text-accent-green">→</span>
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Badge = ({ label, color }: any) => {
  const styles: any = {
    blue: 'bg-accent-blue/10 border-accent-blue/20 text-accent-blue',
    purple: 'bg-accent-purple/10 border-accent-purple/20 text-accent-purple'
  };
  return (
    <div className={`px-2 py-1 rounded-md border text-[8px] font-black uppercase tracking-widest ${styles[color]}`}>
      {label}
    </div>
  );
};

export default StudentProfileDrawer;
