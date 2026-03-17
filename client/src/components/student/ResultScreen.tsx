import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  Clock, 
  ChevronLeft,
  Share2,
  ListRestart,
  Sparkles,
  Zap,
  CheckCircle,
  X
} from 'lucide-react';
import type { Quiz, QuizAttempt } from '../../types';

interface ResultScreenProps {
  results: any;
  quiz: Quiz;
  onBack: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ results, quiz, onBack }) => {
  const isPassed = results.passed;

  return (
    <div className="min-h-screen bg-bg-primary py-20 px-10">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-6">
           <motion.div 
             initial={{ scale: 0, rotate: -20 }}
             animate={{ scale: 1, rotate: 0 }}
             className={`w-32 h-32 rounded-full flex items-center justify-center border-4 ${
               isPassed ? 'border-accent-green bg-accent-green/10 text-accent-green' : 'border-accent-error bg-accent-error/10 text-accent-error'
             }`}
           >
             {isPassed ? <Trophy size={64} /> : <XCircle size={64} />}
           </motion.div>

           <div>
              <h2 className="text-4xl font-outfit font-black mb-2 tracking-tighter">
                {results.score}% <span className="text-xl font-bold opacity-30">/ 100%</span>
              </h2>
              <p className={`text-xl font-bold uppercase tracking-widest ${isPassed ? 'text-accent-green' : 'text-accent-error'}`}>
                {isPassed ? 'Assessment Pased' : 'Assessment Failed'}
              </p>
           </div>

           <div className="flex gap-4">
              <Stat icon={CheckCircle2} label="Correct" value={`${results.correctCount}/${results.totalQuestions}`} />
              <Stat icon={Clock} label="Time Taken" value={`${results.timeTaken}s`} />
              <Stat icon={Zap} label="Points" value={isPassed ? `+${results.pointsAwarded}` : '+1'} />
           </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-8">
           <h3 className="text-2xl font-outfit font-bold flex items-center gap-3">
             <ListRestart size={24} className="text-accent-purple" />
             Review & Analysis
           </h3>

           <div className="space-y-6">
              {results.breakdown.map((item: any, idx: number) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={item.questionId} 
                  className="card-premium p-8 space-y-6"
                >
                   <div className="flex justify-between items-start gap-6">
                      <div className="space-y-2 flex-1">
                         <span className="text-[10px] uppercase font-black tracking-widest text-text-muted">Question {idx + 1}</span>
                         <p className="text-lg font-bold leading-relaxed">{item.question}</p>
                      </div>
                      <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        item.isCorrect ? 'bg-accent-green/10 text-accent-green border border-accent-green/30' : 'bg-accent-error/10 text-accent-error border border-accent-error/30'
                      }`}>
                         {item.isCorrect ? <CheckCircle size={24} /> : <X size={24} />}
                      </div>
                   </div>

                   <div className="grid md:grid-cols-2 gap-4">
                      <div className={`p-4 rounded-xl border ${item.isCorrect ? 'bg-accent-green/10 border-accent-green/20' : 'bg-accent-error/10 border-accent-error/20'}`}>
                         <p className="text-[10px] uppercase font-black tracking-widest opacity-60 mb-2">Your Answer</p>
                         <p className="font-bold">{item.yourAnswer}</p>
                      </div>
                      {!item.isCorrect && (
                        <div className="p-4 rounded-xl border bg-accent-green/10 border-accent-green/20">
                           <p className="text-[10px] uppercase font-black tracking-widest opacity-60 mb-2">Correct Answer</p>
                           <p className="font-bold text-accent-green">{item.correctAnswer}</p>
                        </div>
                      )}
                   </div>

                   <div className="p-6 bg-white/5 border border-white/5 rounded-xl">
                      <p className="text-[10px] uppercase font-black tracking-widest text-accent-purple mb-2 flex items-center gap-1.5 ">
                        <Sparkles size={12} /> Mentor Explanation
                      </p>
                      <p className="text-sm text-text-muted leading-relaxed italic">"{item.explanation}"</p>
                   </div>
                </motion.div>
              ))}
           </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-10 border-t border-white/5 flex justify-between items-center">
           <button 
             onClick={onBack}
             className="flex items-center gap-3 text-text-muted hover:text-white transition-all font-bold"
           >
             <ChevronLeft size={20} /> Back to My Quizzes
           </button>

           <div className="flex gap-4">
              <button className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                 <Share2 size={24} />
              </button>
              <button onClick={onBack} className="btn-primary h-14 px-10 text-sm font-bold flex items-center gap-3">
                 Exit Assessment <CheckCircle2 size={20} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ icon: Icon, label, value }: any) => (
  <div className="glass px-6 py-4 rounded-2xl flex items-center gap-4 text-left border-white/5">
     <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-text-muted">
        <Icon size={20} />
     </div>
     <div>
        <p className="text-[10px] uppercase font-black tracking-widest text-text-muted">{label}</p>
        <p className="font-outfit font-bold text-lg leading-tight">{value}</p>
     </div>
  </div>
);

export default ResultScreen;
