import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Terminal, Zap, Star, CheckCircle2, Loader2, Info } from 'lucide-react';
import api from '../../api';
import type { CodingProblem } from '../../types';
import CodingEditor from './CodingEditor';

interface BadgeProps {
    icon: React.ElementType;
    label: string | number;
}

const Badge: React.FC<BadgeProps> = ({ icon: Icon, label }) => (
    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-lg border border-white/5 text-[10px] font-bold text-text-muted">
        <Icon size={12} />
        {label}
    </div>
);

const CodingProblemList: React.FC = () => {
    const [problems, setProblems] = useState<CodingProblem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);

    const fetchProblems = async () => {
        try {
            const { data } = await api.get('coding-problems');
            if (Array.isArray(data)) {
                setProblems(data);
            }
        } catch (err) {
            console.error('Failed to fetch coding problems', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProblems();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-accent-blue" size={32} />
                <p className="text-text-muted text-xs font-bold uppercase tracking-widest">Loading Challenges...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end pb-4 border-b border-white/5">
                <div>
                    <h2 className="text-xl font-bold font-outfit mb-1 leading-tight">Coding Challenges</h2>
                    <p className="text-text-muted text-xs max-w-xl">Master logic with real-world problems. Instant execution & feedback.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(problems || []).length > 0 ? problems.map((problem, idx) => (
                    <motion.div
                        key={problem._id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`card-premium group relative overflow-hidden flex flex-col h-full min-h-[260px] p-6 ${problem.hasAttempted ? 'bg-neutral-900/40 border-white/5' : 'bg-bg-secondary/40'}`}
                    >
                        {/* Status Overlays */}
                        {problem.hasAttempted && (
                            <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-lg text-[9px] font-black uppercase tracking-widest ${
                                problem.status === 'accepted' ? 'bg-accent-green text-white' : 
                                problem.status === 'partial' ? 'bg-accent-amber text-white' : 'bg-accent-error text-white'
                            }`}>
                                {problem.status}
                            </div>
                        )}

                        <div className="flex flex-col flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-accent-blue/10 rounded-lg text-accent-blue">
                                    <Terminal size={20} />
                                </div>
                                <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tight border ${
                                    problem.difficulty === 'easy' ? 'bg-accent-green/5 border-accent-green/20 text-accent-green' :
                                    problem.difficulty === 'medium' ? 'bg-accent-amber/5 border-accent-amber/20 text-accent-amber' :
                                    'bg-accent-error/5 border-accent-error/20 text-accent-error'
                                }`}>
                                    {problem.difficulty}
                                </div>
                            </div>

                            <h3 className="text-lg font-bold font-outfit mb-2 line-clamp-1 leading-snug">{problem.title}</h3>
                            <p className="text-text-muted text-xs line-clamp-2 mb-6 h-8">{problem.description}</p>

                            <div className="flex flex-wrap gap-2 mb-6">
                                <Badge icon={Code} label={problem.techStack} />
                                <Badge icon={Zap} label={`${problem.pointsReward} Pts`} />
                                <Badge icon={CheckCircle2} label={`${problem.testCases?.length || 0} Tests`} />
                            </div>

                            <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                                {problem.hasAttempted ? (
                                    <div className="flex items-center gap-2">
                                        <Star size={16} className={problem.status === 'accepted' ? 'text-accent-amber' : 'text-text-muted'} />
                                        <span className="font-outfit font-bold text-base">{problem.myScore || 0}%</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-accent-blue/60">
                                        <Info size={12} />
                                        <span className="text-[10px] font-bold uppercase tracking-tight">Available</span>
                                    </div>
                                )}

                                <button
                                    onClick={() => setSelectedProblemId(problem._id)}
                                    className={`flex items-center gap-2 font-black text-[9px] uppercase tracking-widest transition-all ${
                                        problem.hasAttempted ? 'text-accent-blue hover:underline' : 'btn-primary px-4 py-1.5 rounded-lg hover:translate-x-1'
                                    }`}
                                >
                                    {problem.hasAttempted ? 'Review' : 'Solve'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )) : (
                    <div className="col-span-full py-16 text-center glass border-dashed flex flex-col items-center gap-3">
                        <Code size={40} className="text-text-muted opacity-20" />
                        <p className="text-text-muted text-sm italic">No coding challenges available at the moment.</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selectedProblemId && (
                    <CodingEditor
                        problemId={selectedProblemId}
                        onClose={() => {
                            setSelectedProblemId(null);
                            fetchProblems();
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default CodingProblemList;
