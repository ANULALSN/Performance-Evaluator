import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trophy, 
  Users, 
  Target, 
  Clock, 
  Download, 
  Search, 
  Filter,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../api';
import type { QuizAttempt } from '../../types';

interface QuizResultsViewProps {
  quizId: string;
}

const QuizResultsView: React.FC<QuizResultsViewProps> = ({ quizId }) => {
  const [results, setResults] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ avgScore: 0, passRate: 0, total: 0 });

  const fetchResults = useCallback(async () => {
    try {
      const { data } = await api.get(`/admin/quizzes/${quizId}/results`);
      setResults(data);
      
      if (data.length > 0) {
        const total = data.length;
        const avgScore = data.reduce((acc: number, cur: any) => acc + cur.score, 0) / total;
        const passedCount = data.filter((r: any) => r.passed).length;
        setStats({ avgScore: Math.round(avgScore), passRate: Math.round((passedCount / total) * 100), total });
      }
    } catch (err) {
      console.error('Failed to fetch results', err);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleExport = async () => {
     try {
        const res = await api.get('/export/quiz-results', { responseType: 'blob' });
        const url = URL.createObjectURL(res.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quiz_results_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
     } catch (err) {
        alert('Export failed');
     }
  };

  if (loading) return null;

  return (
    <div className="space-y-10">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <StatsCard label="Average Accuracy" value={`${stats.avgScore}%`} icon={Target} color="purple" />
         <StatsCard label="Cohort Pass Rate" value={`${stats.passRate}%`} icon={CheckCircle2} color="green" />
         <StatsCard label="Total Attempts" value={stats.total} icon={Users} color="blue" />
      </div>

      {/* Results Table */}
      <div className="glass overflow-hidden border-white/5 bg-neutral-900/40 shadow-2xl">
         <div className="p-8 border-b border-white/5 flex flex-wrap gap-4 items-center justify-between">
            <h3 className="text-xl font-bold font-outfit">Detailed Performance Roster</h3>
            <button 
              onClick={handleExport}
              className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
            >
               <Download size={16} /> Export Results to CSV
            </button>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-white/2 text-[10px] font-black uppercase tracking-widest text-text-muted border-b border-white/5">
                     <th className="px-8 py-6">Student</th>
                     <th className="px-8 py-6">Status</th>
                     <th className="px-8 py-6">Accuracy</th>
                     <th className="px-8 py-6">Time Took</th>
                     <th className="px-8 py-6">Submission Date</th>
                     <th className="px-8 py-6 text-right">Raw Data</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {results.length > 0 ? results.map((attempt) => (
                     <tr key={attempt._id} className="hover:bg-white/2 transition-colors">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center text-accent-blue font-bold text-xs">
                                 {(attempt.studentId as any).name.substring(0, 1) + ((attempt.studentId as any).name.split(' ')[1]?.substring(0, 1) || '')}
                              </div>
                              <div>
                                 <p className="font-bold text-sm">{(attempt.studentId as any).name}</p>
                                 <p className="text-[10px] text-text-muted">{(attempt.studentId as any).email}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                             attempt.passed ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-error/10 text-accent-error'
                           }`}>
                             {attempt.passed ? 'PASSED' : 'FAILED'}
                           </span>
                        </td>
                        <td className="px-8 py-6 font-bold font-outfit text-lg">{attempt.score}%</td>
                        <td className="px-8 py-6 font-mono text-xs text-text-muted">{attempt.timeTaken}s</td>
                        <td className="px-8 py-6 text-xs text-text-muted">{new Date(attempt.attemptedAt).toLocaleString()}</td>
                        <td className="px-8 py-6 text-right">
                           <button className="text-accent-purple font-medium text-xs hover:underline">Inspect Selection</button>
                        </td>
                     </tr>
                  )) : (
                     <tr>
                        <td colSpan={6} className="py-20 text-center text-text-muted italic opacity-50">No students have attempted this quiz yet.</td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

const StatsCard = ({ label, value, icon: Icon, color }: any) => {
   const colors: any = {
      purple: 'bg-accent-purple/10 text-accent-purple border-accent-purple/20',
      green: 'bg-accent-green/10 text-accent-green border-accent-green/20',
      blue: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20'
   };

   return (
      <div className="card-premium h-fit border-white/5">
         <div className="flex justify-between items-start mb-4">
            <div className={`p-4 rounded-xl border ${colors[color]}`}>
               <Icon size={24} />
            </div>
         </div>
         <p className="text-[10px] uppercase font-black tracking-widest text-text-muted mb-1">{label}</p>
         <h4 className="text-4xl font-outfit font-bold">{value}</h4>
      </div>
   );
};

export default QuizResultsView;
