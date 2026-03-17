import React, { useState, useEffect } from 'react';
import { Brain, Clock, ChevronRight, CheckCircle2, AlertCircle, Trophy, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api';
import type { Quiz } from '../../types';
import QuizModal from './QuizModal';

const QuizList: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

  const fetchQuizzes = async () => {
    try {
      const { data } = await api.get('quizzes');
      setQuizzes(data);
    } catch (err) {
      console.error('Failed to fetch quizzes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-12 h-12 border-4 border-accent-purple/20 border-t-accent-purple rounded-full animate-spin"></div>
      <p className="text-text-muted font-medium">Fetching assessments...</p>
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
         <div>
            <h2 className="text-4xl font-bold font-outfit mb-3">Assessment Hub</h2>
            <p className="text-text-muted text-lg max-w-xl">Validate your technical depth. Correct answers award accountability points.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {quizzes.length > 0 ? quizzes.map((quiz, idx) => (
          <motion.div 
            key={quiz._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`card-premium group relative overflow-hidden flex flex-col h-full ${quiz.hasAttempted ? 'border-none bg-neutral-900/40' : ''}`}
          >
            {/* Status Overlays */}
            {quiz.hasAttempted && (
               <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl text-[10px] font-black uppercase tracking-widest ${
                 (quiz.myScore || 0) >= quiz.passingScore ? 'bg-accent-green text-white' : 'bg-accent-error text-white'
               }`}>
                 {(quiz.myScore || 0) >= quiz.passingScore ? 'Passed' : 'Failed'}
               </div>
            )}

            <div className="mb-8">
              <div className="flex justify-between items-start mb-4">
                 <div className="p-3 bg-accent-purple/10 rounded-xl text-accent-purple">
                    <Brain size={24} />
                 </div>
                 <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight border ${
                    quiz.difficulty === 'easy' ? 'bg-accent-green/5 border-accent-green/20 text-accent-green' :
                    quiz.difficulty === 'medium' ? 'bg-accent-amber/5 border-accent-amber/20 text-accent-amber' :
                    'bg-accent-error/5 border-accent-error/20 text-accent-error'
                 }`}>
                    {quiz.difficulty}
                 </div>
              </div>

              <h3 className="text-2xl font-bold font-outfit mb-2 line-clamp-1">{quiz.title}</h3>
              <p className="text-text-muted text-sm line-clamp-2 mb-6">{quiz.description}</p>

              <div className="flex flex-wrap gap-3">
                 <Badge icon={Sparkles} label={quiz.techStack} />
                 <Badge icon={Clock} label={`${Math.floor(quiz.timeLimit / 60)}m Limit`} />
                 <Badge icon={CheckCircle2} label={`${quiz.questionCount} Qs`} />
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
               {quiz.hasAttempted ? (
                 <div className="flex items-center gap-2">
                    <Trophy size={18} className={(quiz.myScore || 0) >= quiz.passingScore ? 'text-accent-amber' : 'text-text-muted'} />
                    <span className="font-outfit font-bold text-lg">{quiz.myScore}%</span>
                 </div>
               ) : (
                 <p className="text-xs font-bold text-text-muted">Available Now</p>
               )}

               <button 
                 onClick={() => setSelectedQuizId(quiz._id)}
                 className={`flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all ${
                   quiz.hasAttempted ? 'text-accent-blue hover:underline' : 'btn-primary px-4 py-2 hover:translate-x-1'
                 }`}
               >
                 {quiz.hasAttempted ? 'Review Answers' : 'Take Assessment'}
                 <ChevronRight size={14} className={quiz.hasAttempted ? '' : 'fill-current'} />
               </button>
            </div>
          </motion.div>
        )) : (
          <div className="col-span-full py-24 glass border-dashed flex flex-col items-center gap-4">
             <AlertCircle size={48} className="text-text-muted opacity-20" />
             <p className="text-text-muted font-medium italic">No technical assessments have been pushed by mentors yet.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedQuizId && (
          <QuizModal 
            quizId={selectedQuizId} 
            onClose={() => {
              setSelectedQuizId(null);
              fetchQuizzes();
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const Badge = ({ icon: Icon, label }: any) => (
  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 text-[10px] font-bold text-text-muted uppercase tracking-tighter">
    <Icon size={12} className="shrink-0" />
    {label}
  </div>
);

export default QuizList;
