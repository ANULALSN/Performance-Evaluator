import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Send,
  XCircle,
  Loader2,
  MessageSquare,
  Zap,
  AlertCircle 
} from 'lucide-react';
import api from '../../api';

interface Flag {
  _id: string;
  studentId: string;
  studentName: string;
  type: string;
  severity: "critical" | "warning" | "positive";
  message: string;
  detectedAt: string;
  metadata?: any;
}

const InterventionCenter: React.FC = () => {
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    const fetchData = async () => {
        try {
            const { data } = await api.get('admin/interventions');
            setSummary(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDismiss = async (studentId: string) => {
        try {
            await api.post(`admin/interventions/${studentId}/dismiss`);
            fetchData();
        } catch (err) {
            alert('Dismiss failed');
        }
    };

    const handleSendMessage = async () => {
        if (!message.trim() || !selectedStudent) return;
        setSending(true);
        try {
            await api.post(`admin/interventions/${selectedStudent.id}/notify`, { message });
            setSelectedStudent(null);
            setMessage('');
            alert('Sent successfully');
        } catch (err) {
            alert('Failed to send');
        } finally {
            setSending(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-accent-blue" size={32} />
            <p className="text-text-muted font-bold text-xs uppercase tracking-widest leading-none">Syncing Intel...</p>
        </div>
    );

    const MetricPill = ({ label, value, color }: any) => (
        <div className="glass px-6 py-4 flex flex-col gap-1 border-white/5">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{label}</span>
            <span className={`text-xl font-bold font-outfit ${color}`}>{value}</span>
        </div>
    );

    return (
        <div className="space-y-10">
            {/* Top Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <MetricPill label="Total Students" value={summary?.stats.totalStudents} color="text-white" />
                <MetricPill label="Critical Alerts" value={summary?.stats.criticalCount} color="text-accent-error" />
                <MetricPill label="Active Warnings" value={summary?.stats.warningCount} color="text-accent-amber" />
                <MetricPill label="Peforming Well" value={summary?.stats.positiveCount} color="text-accent-green" />
                <MetricPill label="Avg XP Score" value={Math.round(summary?.stats.avgConsistencyScore)} color="text-accent-purple" />
            </div>

            {/* Three Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Column 1: Critical */}
                <InterventionColumn 
                    title="Critical Response" 
                    icon={AlertCircle} 
                    color="accent-error"
                    flags={summary?.critical || []} 
                    onAction={(s: any) => setSelectedStudent(s)}
                    onDismiss={handleDismiss}
                    actionLabel="Send Message"
                />

                {/* Column 2: Warnings */}
                <InterventionColumn 
                    title="Strategic Warnings" 
                    icon={AlertTriangle} 
                    color="accent-amber"
                    flags={summary?.warning || []} 
                    onAction={(s: any) => setSelectedStudent(s)}
                    onDismiss={handleDismiss}
                    actionLabel="Monitor"
                />

                {/* Column 3: Positive */}
                <InterventionColumn 
                    title="High Performance" 
                    icon={Zap} 
                    color="accent-green"
                    flags={summary?.positive || []} 
                    onAction={async (s: any) => {
                        await api.post(`admin/interventions/${s.id}/notify`, { message: `Top work ${s.name}! Keep crushing the goals.` });
                        alert('Reward message sent!');
                    }}
                    onDismiss={handleDismiss}
                    actionLabel="Reward"
                />
            </div>

            {/* Send Message Modal */}
            <AnimatePresence>
                {selectedStudent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-neutral-900 border border-white/10 rounded-3xl p-8 max-w-md w-full space-y-6 shadow-2xl shadow-black"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold font-outfit">Intervene: {selectedStudent.name}</h3>
                                    <p className="text-text-muted text-xs mt-1">Direct message for immediate follow-up.</p>
                                </div>
                                <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-white/5 rounded-xl"><XCircle size={20}/></button>
                            </div>

                            <textarea 
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                placeholder="Type your mentorship guidance..."
                                className="w-full h-32 bg-black/40 border border-white/5 rounded-2xl p-4 text-sm font-medium outline-none focus:border-accent-blue transition-all"
                            />

                            <button 
                                onClick={handleSendMessage}
                                disabled={sending || !message.trim()}
                                className="w-full btn-primary h-12 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px]"
                            >
                                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} 
                                Send via Platform
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

interface ColumnProps {
    title: string;
    icon: any;
    color: string;
    flags: Flag[];
    onAction: (student: any) => void;
    onDismiss: (id: string) => void;
    actionLabel: string;
}

const InterventionColumn: React.FC<ColumnProps> = ({ title, icon: Icon, color, flags, onAction, onDismiss, actionLabel }) => (
    <div className={`p-8 rounded-3xl border border-${color}/20 bg-neutral-900/40 space-y-8 min-h-[500px]`}>
        <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <Icon size={16} className={`text-${color}`} /> {title}
            </h3>
            <span className={`px-2 py-0.5 rounded bg-${color}/10 text-${color} text-[8px] font-black`}>{flags.length}</span>
        </div>

        <div className="space-y-4">
            {flags.length > 0 ? flags.map((f, i) => (
                <motion.div 
                    key={f._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-5 bg-black/20 border border-white/5 rounded-2xl space-y-4 group hover:border-white/10 transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl bg-${color}/10 flex items-center justify-center text-${color} font-bold text-xs`}>
                            {f.studentName.substring(0, 1) + (f.studentName.split(' ')[1]?.substring(0, 1) || '')}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-bold text-sm truncate">{f.studentName}</p>
                            <p className="text-[10px] text-text-muted truncate mb-1">{f.message}</p>
                            {f.metadata?.daysInactive !== undefined && (
                                <p className="text-[9px] font-black uppercase tracking-widest text-accent-error opacity-60">Inactive {f.metadata.daysInactive} days</p>
                            )}
                            {f.metadata?.daysRegistered !== undefined && (
                                <p className="text-[9px] font-black uppercase tracking-widest text-accent-error opacity-60">Joined {f.metadata.daysRegistered} days ago</p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button 
                            onClick={() => onAction({ id: f.studentId, name: f.studentName })}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-${color}/10 text-${color} text-[10px] font-black uppercase tracking-tight hover:bg-${color} hover:text-bg-primary transition-all`}
                        >
                            <MessageSquare size={12}/> {actionLabel}
                        </button>
                        <button 
                            onClick={() => onDismiss(f.studentId)}
                            className="w-10 flex items-center justify-center rounded-lg bg-white/5 text-text-muted hover:bg-accent-error/10 hover:text-accent-error transition-all"
                        >
                            <XCircle size={14}/>
                        </button>
                    </div>
                </motion.div>
            )) : (
                <div className="py-16 text-center border-2 border-dashed border-white/5 rounded-2xl">
                    <p className="text-text-muted text-xs italic opacity-40">No active {title.toLowerCase()} 🎉</p>
                </div>
            )}
        </div>
    </div>
);

export default InterventionCenter;
