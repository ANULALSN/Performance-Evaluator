import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Calendar } from 'lucide-react';
import api from '../../api';

interface HeatmapData {
    date: string;
    level: number;
    score: number;
    checkIn: boolean;
    tasksCompleted: number;
}

interface HeatmapStats {
    totalActiveDays: number;
    longestStreak: number;
    currentStreak: number;
    bestScore: number;
}

const StatItem = ({ label, value }: { label: string, value: string }) => (
    <div className="flex flex-col">
        <span className="text-[9px] uppercase font-black tracking-widest text-text-muted mb-1">{label}</span>
        <span className="text-xl font-bold font-outfit">{value}</span>
    </div>
);

const TooltipIndicator = ({ label, active }: { label: string, active: boolean }) => (
    <div className={`flex items-center justify-between text-[10px] ${active ? 'text-white' : 'text-white/20'}`}>
        <span>{label}</span>
        <span>{active ? '✓' : '—'}</span>
    </div>
);

const LearningHeatmap: React.FC = () => {
    const [viewDays, setViewDays] = useState<90 | 365>(365);
    const [data, setData] = useState<HeatmapData[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoveredDay, setHoveredDay] = useState<HeatmapData | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`student/heatmap?days=${viewDays}`);
            setData(data);
        } catch (err) {
            console.error('Failed to fetch heatmap data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [viewDays]);

    const stats = useMemo<HeatmapStats>(() => {
        if (!data.length) return { totalActiveDays: 0, longestStreak: 0, currentStreak: 0, bestScore: 0 };
        
        let total = 0;
        let best = 0;
        let longest = 0;
        let current = 0;
        let tempStreak = 0;

        // Data is in chronological order
        data.forEach((day, idx) => {
            if (day.level > 0) {
                total++;
                tempStreak++;
                if (day.score > best) best = day.score;
            } else {
                if (tempStreak > longest) longest = tempStreak;
                tempStreak = 0;
            }
            
            // Current streak is the last sequence ending today or yesterday
            if (idx === data.length - 1) {
                current = tempStreak;
            }
        });

        if (tempStreak > longest) longest = tempStreak;

        return {
            totalActiveDays: total,
            longestStreak: longest,
            currentStreak: current,
            bestScore: best
        };
    }, [data]);

    // Grid details
    const cellSize = 12;
    const gap = 2;
    const columns = viewDays === 365 ? 53 : 13; // Approx 53 weeks or 13 weeks
    const rows = 7;

    // Month labels logic
    const monthLabels = useMemo(() => {
        if (!data.length) return [];
        const labels: { text: string; x: number }[] = [];
        let lastMonth = -1;

        data.forEach((day, idx) => {
            const date = new Date(day.date);
            const month = date.getMonth();
            if (month !== lastMonth) {
                const colIndex = Math.floor(idx / 7);
                labels.push({ 
                    text: date.toLocaleString('default', { month: 'short' }), 
                    x: colIndex * (cellSize + gap) 
                });
                lastMonth = month;
            }
        });
        return labels;
    }, [data]);

    const handleMouseEnter = (day: HeatmapData, e: React.MouseEvent) => {
        setHoveredDay(day);
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
            setTooltipPos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top - 40
            });
        }
    };

    const getLevelColor = (level: number) => {
        switch (level) {
            case 1: return 'var(--level-1)';
            case 2: return 'var(--level-2)';
            case 3: return 'var(--level-3)';
            case 4: return 'var(--level-4)';
            default: return 'var(--level-0)';
        }
    };

    return (
        <div className="card-premium space-y-6 overflow-hidden relative" ref={containerRef}>
            <style>{`
                :root {
                    --level-0: rgba(255, 255, 255, 0.04);
                    --level-1: #1e3a5f;
                    --level-2: #1d4ed8;
                    --level-3: #7c3aed;
                    --level-4: #10b981;
                }
            `}</style>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent-purple/10 rounded-lg text-accent-purple">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Learning Activity</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-accent-amber bg-accent-amber/10 px-2 py-0.5 rounded-full">
                                <Flame size={12} fill="currentColor" /> {stats.currentStreak} Day Streak
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                    <button 
                        onClick={() => setViewDays(90)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewDays === 90 ? 'bg-white/10 text-white shadow-sm' : 'text-text-muted hover:text-white'}`}
                    >
                        Last 90 Days
                    </button>
                    <button 
                        onClick={() => setViewDays(365)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewDays === 365 ? 'bg-white/10 text-white shadow-sm' : 'text-text-muted hover:text-white'}`}
                    >
                        Last Year
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="relative py-10 opacity-50 overflow-x-auto">
                    <div className="min-w-fit flex flex-col gap-4 animate-pulse">
                        <div className="flex gap-1">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="h-3 w-12 bg-white/10 rounded" />
                            ))}
                        </div>
                        <div className="grid grid-flow-col grid-rows-7 gap-1">
                            {Array.from({ length: 371 }).map((_, i) => (
                                <div key={i} className="w-3 h-3 bg-white/5 rounded-sm" />
                            ))}
                        </div>
                    </div>
                </div>
            ) : data.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-2xl">
                    <p className="text-text-muted italic">Start your first check-in to see your activity!</p>
                </div>
            ) : (
                <div className="relative">
                    <motion.div 
                        key={viewDays}
                        initial="hidden"
                        animate="show"
                        variants={{
                            show: { transition: { staggerChildren: 0.002 } }
                        }}
                        className="overflow-x-auto pb-4 -mx-1 px-1"
                    >
                        <div className="min-w-fit">
                            <svg 
                                width={columns * (cellSize + gap)} 
                                height={rows * (cellSize + gap) + 40}
                                className="overflow-visible"
                            >
                                {/* Month Labels */}
                                {monthLabels.map((lbl, i) => (
                                    <text 
                                        key={i} 
                                        x={lbl.x} 
                                        y={12} 
                                        fill="var(--text-muted)" 
                                        fontSize="9" 
                                        fontWeight="700"
                                        className="uppercase tracking-tighter"
                                    >
                                        {lbl.text}
                                    </text>
                                ))}

                                {/* Day Labels (Left) */}
                                <text x={-25} y={cellSize + gap + 10} fill="var(--text-muted)" fontSize="8" fontWeight="700">Mon</text>
                                <text x={-25} y={3 * (cellSize + gap) + 10} fill="var(--text-muted)" fontSize="8" fontWeight="700">Wed</text>
                                <text x={-25} y={5 * (cellSize + gap) + 10} fill="var(--text-muted)" fontSize="8" fontWeight="700">Fri</text>

                                {/* Heatmap Cells */}
                                {data.map((day, idx) => {
                                    const colIndex = Math.floor(idx / rows);
                                    const rowIndex = idx % rows;
                                    return (
                                        <motion.rect
                                            key={idx}
                                            variants={{
                                                hidden: { opacity: 0, scale: 0 },
                                                show: { opacity: 1, scale: 1 }
                                            }}
                                            x={colIndex * (cellSize + gap)}
                                            y={rowIndex * (cellSize + gap) + 20}
                                            width={cellSize}
                                            height={cellSize}
                                            rx={2}
                                            fill={getLevelColor(day.level)}
                                            onMouseEnter={(e) => handleMouseEnter(day, e)}
                                            onMouseLeave={() => setHoveredDay(null)}
                                            className="transition-colors duration-200 cursor-pointer hover:stroke-white/30"
                                        />
                                    );
                                })}
                            </svg>
                        </div>
                    </motion.div>

                    <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted">
                            <span>Less</span>
                            <div className="flex gap-1">
                                {[0, 1, 2, 3, 4].map(l => (
                                    <div key={l} className="w-3 h-3 rounded-sm" style={{ backgroundColor: getLevelColor(l) }} />
                                ))}
                            </div>
                            <span>More</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/5">
                        <StatItem label="Active Days" value={String(stats.totalActiveDays)} />
                        <StatItem label="Longest Streak" value={`${stats.longestStreak}d`} />
                        <StatItem label="Current Streak" value={`${stats.currentStreak}d`} />
                        <StatItem label="Personal Best" value={`+${stats.bestScore}`} />
                    </div>
                </div>
            )}

            {/* Tooltip */}
            <AnimatePresence>
                {hoveredDay && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 5 }}
                        className="absolute z-50 pointer-events-none glass px-3 py-2 border shadow-2xl min-w-[140px]"
                        style={{ 
                            left: Math.min(Math.max(tooltipPos.x - 70, 10), (containerRef.current?.offsetWidth || 0) - 150), 
                            top: tooltipPos.y 
                        }}
                    >
                        <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">
                            {new Date(hoveredDay.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="text-xs font-bold flex items-center justify-between">
                            <span>Activity Score</span>
                            <span className="text-accent-blue">+{hoveredDay.score}</span>
                        </div>
                        <div className="mt-1.5 flex flex-col gap-0.5">
                            <TooltipIndicator label="Check-in" active={hoveredDay.checkIn} />
                            <TooltipIndicator label={`Tasks: ${hoveredDay.tasksCompleted}/3`} active={hoveredDay.tasksCompleted > 0} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};



export default LearningHeatmap;
