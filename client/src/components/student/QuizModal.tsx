import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronRight, 
  Clock, 
  AlertTriangle, 
  Flag,
  Loader2,
  CheckCircle,
  Trophy
} from 'lucide-react';
import api from '../../api';
import type { Quiz } from '../../types';
import ResultScreen from './ResultScreen';

interface QuizModalProps {
  quizId: string;
  onClose: () => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ quizId, onClose }) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; selectedIndex: number }[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [violations, setViolations] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [showWarning, setShowWarning] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchQuiz = useCallback(async () => {
    try {
      const { data } = await api.get(`quizzes/${quizId}`);
      setQuiz(data);
      setTimeLeft(data.timeLimit);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load quiz');
      onClose();
    } finally {
      setLoading(false);
    }
  }, [quizId, onClose]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  const handleSubmit = useCallback(async (isAuto = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const { data } = await api.post(`quizzes/${quizId}/attempt`, {
        answers,
        timeTaken: quiz ? (quiz.timeLimit > 0 ? quiz.timeLimit - timeLeft : timeLeft) : 0
      });
      setResults(data);
      if (isAuto) {
        (window as any).toast?.('Assessment auto-submitted due to time or violation.', 'warning');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Submission failed');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }, [quiz, quizId, answers, timeLeft, onClose, isSubmitting]);

  // Timer Logic
  useEffect(() => {
    if (quiz && !results) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (quiz.timeLimit > 0) {
            if (prev <= 1) {
              clearInterval(timerRef.current!);
              handleSubmit(true);
              return 0;
            }
            return prev - 1;
          }
          return prev + 1; // Count up if no limit
        });
      }, 1000);
    }
    return () => {
       if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [quiz, results, handleSubmit]);

  // Tab Switching Detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !results) {
        setViolations(v => {
          const newVal = v + 1;
          if (newVal >= 3) {
            handleSubmit(true);
            return newVal;
          }
          setShowWarning(true);
          setTimeout(() => setShowWarning(false), 3000);
          return newVal;
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [results, handleSubmit]);

  const handleSelectOption = (index: number) => {
    const newAnswers = [...answers];
    const existingIndex = newAnswers.findIndex(a => a.questionId === quiz?.questions[currentQuestionIndex]._id);
    
    if (existingIndex > -1) {
      newAnswers[existingIndex].selectedIndex = index;
    } else {
      newAnswers.push({ 
        questionId: quiz?.questions[currentQuestionIndex]._id || '', 
        selectedIndex: index 
      });
    }
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      if (window.confirm("Submit Assessment? You cannot change answers after submitting.")) {
        handleSubmit();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return null;
  if (!quiz) return null;

  if (results) {
    return (
       <div className="fixed inset-0 z-[100] bg-bg-primary overflow-y-auto">
          <ResultScreen results={results} quiz={quiz} onBack={onClose} />
       </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const selectedOption = answers.find(a => a.questionId === currentQuestion._id)?.selectedIndex;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-bg-primary flex flex-col"
    >
      {/* Quiz Header */}
      <header className="h-20 border-b border-white/5 px-10 flex items-center justify-between bg-bg-secondary/50 backdrop-blur-xl">
        <div className="flex items-center gap-6">
           <div>
              <h2 className="font-outfit font-bold text-lg leading-tight">{quiz.title}</h2>
              <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-0.5">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
           </div>
           <div className="w-px h-8 bg-white/5"></div>
           <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
             quiz.timeLimit > 0 && timeLeft < 30 ? 'bg-accent-error/10 border-accent-error/30 text-accent-error animate-pulse' : 'bg-white/5 border-white/5 text-text-muted'
           }`}>
             <Clock size={18} />
             <span className="font-mono font-bold text-lg">{formatTime(timeLeft)}</span>
           </div>
        </div>

        <div className="flex items-center gap-4">
           {violations > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-accent-amber/10 border border-accent-amber/30 text-accent-amber rounded-xl text-xs font-black uppercase tracking-tighter">
                 <Flag size={14} /> Violation {violations}/3
              </div>
           )}
           <button 
             onClick={() => window.confirm("Exit assessment? Progress will be lost.") && onClose()}
             className="p-3 text-text-muted hover:text-white hover:bg-white/5 rounded-xl transition-all"
           >
             <X size={24} />
           </button>
        </div>
      </header>

      {/* Warning Overlay */}
      <AnimatePresence>
        {showWarning && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-[110] px-6 py-4 bg-accent-amber text-bg-primary rounded-2xl shadow-2xl flex items-center gap-4 font-bold"
          >
            <AlertTriangle size={24} />
            <div>
               <p className="text-sm">Tab switching detected!</p>
               <p className="text-[10px] uppercase font-black tracking-widest opacity-80">3 Violations = Auto Submission</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quiz Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full py-20 px-10 flex flex-col justify-center">
         <motion.div
           key={currentQuestionIndex}
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           className="space-y-12"
         >
            <h3 className="text-4xl font-outfit font-bold leading-tight">{currentQuestion.question}</h3>

            <div className="grid grid-cols-1 gap-4">
               {currentQuestion.options.map((option, idx) => (
                 <button
                   key={idx}
                   onClick={() => handleSelectOption(idx)}
                   className={`group p-6 rounded-2xl border text-left flex items-center gap-6 transition-all ${
                     selectedOption === idx 
                       ? 'bg-accent-purple/10 border-accent-purple scale-[1.01]' 
                       : 'bg-neutral-900 border-white/5 border-b-white/10 hover:border-white/20'
                   }`}
                 >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all ${
                       selectedOption === idx ? 'bg-accent-purple text-white' : 'bg-neutral-800 text-text-muted group-hover:bg-neutral-700'
                    }`}>
                       {String.fromCharCode(65 + idx)}
                    </div>
                    <span className={`text-xl font-medium ${selectedOption === idx ? 'text-white' : 'text-text-muted group-hover:text-text-primary'}`}>{option}</span>
                 </button>
               ))}
            </div>
         </motion.div>
      </main>

      {/* Quiz Footer */}
      <footer className="h-24 border-t border-white/5 px-10 flex items-center justify-between">
         <div className="flex gap-2">
            {quiz.questions.map((_, i) => (
               <div key={i} className={`w-12 h-1 bg-white/5 rounded-full overflow-hidden`}>
                  <div className={`h-full bg-accent-purple transition-all duration-300 ${i <= currentQuestionIndex ? 'w-full' : 'w-0'}`}></div>
               </div>
            ))}
         </div>

         <button
           disabled={selectedOption === undefined || isSubmitting}
           onClick={handleNext}
           className="btn-primary h-14 px-12 text-sm font-bold flex items-center gap-3 disabled:opacity-20"
         >
            {isSubmitting ? <Loader2 className="animate-spin" /> : (currentQuestionIndex === quiz.questions.length - 1 ? 'Submit Assessment' : 'Proceed to Next')}
            {!isSubmitting && <ChevronRight size={18} />}
         </button>
      </footer>
    </motion.div>
  );
};

export default QuizModal;
