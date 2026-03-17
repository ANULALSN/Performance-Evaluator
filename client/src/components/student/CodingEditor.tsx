import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import { 
  X, 
  Clock, 
  AlertTriangle, 
  Flag,
  Loader2,
  Play,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Terminal
} from 'lucide-react';
import api from '../../api';
import type { CodingProblem } from '../../types';

interface CodingEditorProps {
  problemId: string;
  onClose: () => void;
}

const CodingEditor: React.FC<CodingEditorProps> = ({ problemId, onClose }) => {
  const [problem, setProblem] = useState<CodingProblem | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<'javascript' | 'python'>('javascript');
  const [code, setCode] = useState('');
  const [codes, setCodes] = useState({ javascript: '', python: '' });
  const [timeLeft, setTimeLeft] = useState(0);
  const [violations, setViolations] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHints, setShowHints] = useState(false);

  const timerRef = useRef<any>(null);

  const fetchProblem = useCallback(async () => {
    try {
      const { data } = await api.get(`coding-problems/${problemId}`);
      setProblem(data);
      setTimeLeft(data.timeLimit);
      setCodes({
        javascript: data.starterCode.javascript,
        python: data.starterCode.python
      });
      setCode(data.starterCode.javascript);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load challenge');
      onClose();
    } finally {
      setLoading(false);
    }
  }, [problemId, onClose]);

  useEffect(() => {
    fetchProblem();
  }, [fetchProblem]);

  const handleRun = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setResults(null);
    try {
      const { data } = await api.post(`coding-problems/${problemId}/run`, {
        code,
        language
      });
      setResults(data.results);
      if (data.error) {
          alert(data.message);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Run failed');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = useCallback(async (isAuto = false) => {
    if (isSubmitting) return;
    if (!isAuto && !window.confirm("Submit your solution? All test cases (including hidden) will be evaluated.")) return;

    setIsSubmitting(true);
    try {
      const { data } = await api.post(`coding-problems/${problemId}/submit`, {
        code,
        language,
        timeTaken: problem ? problem.timeLimit - timeLeft : 0,
        hintsUsed
      });
      setSubmission(data);
      if (isAuto) {
        (window as any).toast?.('Challenge auto-submitted due to violations.', 'warning');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  }, [problemId, code, language, problem, timeLeft, hintsUsed, isSubmitting]);

  // Timer & Violations Logic
  useEffect(() => {
    if (problem && !submission) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); }
  }, [problem, submission, handleSubmit]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !submission && !loading) {
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
  }, [submission, handleSubmit, loading]);

  const handleLanguageSwitch = (newLang: 'javascript' | 'python') => {
    if (code !== codes[language]) {
      if (!window.confirm("Unsaved changes in current language will be preserved in memory. Switch?")) return;
    }
    setCodes(prev => ({ ...prev, [language]: code }));
    setLanguage(newLang);
    setCode(codes[newLang]);
    setResults(null);
  };

  const handleReset = () => {
    if (window.confirm("Reset current code to starter template?")) {
      setCode(language === 'javascript' ? problem!.starterCode.javascript : problem!.starterCode.python);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading || !problem) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-bg-primary flex flex-col overflow-hidden"
    >
      {/* Header */}
      <header className="h-16 border-b border-white/5 px-6 flex items-center justify-between bg-bg-secondary/50 backdrop-blur-xl">
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent-blue/10 rounded-lg flex items-center justify-center text-accent-blue">
                 <Terminal size={18} />
              </div>
              <h2 className="font-outfit font-bold text-sm tracking-tight">{problem.title}</h2>
           </div>
           <div className="w-px h-6 bg-white/5"></div>
           <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-xs ${
             timeLeft < 300 ? 'bg-accent-error/10 border-accent-error/30 text-accent-error' : 'bg-white/5 border-white/5 text-text-muted'
           }`}>
             <Clock size={14} />
             <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
           </div>
        </div>

        <div className="flex items-center gap-4">
           {violations > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-accent-amber/10 border border-accent-amber/30 text-accent-amber rounded-lg text-[10px] font-black uppercase tracking-tighter">
                 <Flag size={12} /> Violation {violations}/3
              </div>
           )}
           <button 
             onClick={() => (submission || window.confirm("Exit challenge? Progress will be lost.")) && onClose()}
             className="p-2 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-all"
           >
             <X size={20} />
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
            className="absolute top-20 left-1/2 -translate-x-1/2 z-[110] px-4 py-2 bg-accent-amber text-bg-primary rounded-xl shadow-2xl flex items-center gap-3 font-bold"
          >
            <AlertTriangle size={18} />
            <div className="text-xs">
               <p>Tab switch detected! 3 Violations = Submission</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Details */}
        <div className="w-[40%] border-r border-white/5 flex flex-col overflow-y-auto p-8 space-y-8">
           <div>
              <div className="flex items-center gap-3 mb-4">
                 <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                     problem.difficulty === 'easy' ? 'bg-accent-green/10 text-accent-green' :
                     problem.difficulty === 'medium' ? 'bg-accent-amber/10 text-accent-amber' :
                     'bg-accent-error/10 text-accent-error'
                 }`}>{problem.difficulty}</span>
                 <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{problem.techStack} Module</span>
              </div>
              <div className="prose prose-invert prose-sm max-w-none">
                 <ReactMarkdown>{problem.description}</ReactMarkdown>
              </div>
           </div>

           {problem.constraints.length > 0 && (
              <div className="space-y-3">
                 <h4 className="text-xs font-black uppercase tracking-widest text-text-muted">Constraints</h4>
                 <ul className="space-y-2">
                    {problem.constraints.map((c, i) => (
                       <li key={i} className="text-xs text-text-secondary flex gap-2">
                          <span className="text-accent-blue">•</span> {c}
                       </li>
                    ))}
                 </ul>
              </div>
           )}

           <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-text-muted">Test Cases</h4>
              <div className="space-y-3">
                 {problem.testCases.map((tc, i) => (
                    <div key={i} className="bg-white/2 border border-white/5 rounded-xl p-4 space-y-3">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase tracking-tight text-text-muted">Case {i + 1}</span>
                          {tc.isHidden && <span className="text-[10px] px-2 py-0.5 bg-white/5 text-text-muted rounded flex items-center gap-1.5"><Flag size={10}/> Hidden</span>}
                       </div>
                       <div className="space-y-2">
                          <div>
                             <p className="text-[10px] text-text-muted mb-1 opacity-60">INPUT</p>
                             <code className="text-xs bg-black/40 px-2 py-1 rounded block">{tc.input}</code>
                          </div>
                          {!tc.isHidden && (
                             <div>
                                <p className="text-[10px] text-text-muted mb-1 opacity-60">EXPECTED OUTPUT</p>
                                <code className="text-xs bg-black/40 px-2 py-1 rounded block text-accent-green">{tc.expectedOutput}</code>
                             </div>
                          )}
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="space-y-3">
              <button 
                 onClick={() => setShowHints(!showHints)}
                 className="flex items-center gap-2 text-xs font-bold text-accent-purple hover:underline"
              >
                 <HelpCircle size={14}/> {showHints ? 'Hide Hints' : 'Need a hint?'}
              </button>
              {showHints && (
                 <div className="space-y-2">
                    {problem.hints.map((h, i) => (
                       <div key={i} className="p-3 bg-accent-purple/5 border border-accent-purple/10 rounded-lg text-xs leading-relaxed">
                          {hintsUsed > i ? h : (
                             <button 
                                onClick={() => {
                                   if (window.confirm("Reveal this hint for -1 point penalty?")) {
                                      setHintsUsed(prev => prev + 1);
                                   }
                                }}
                                className="flex items-center gap-2 text-accent-purple hover:underline"
                             >
                                Reveal Hint {i + 1} (-1 Pts)
                             </button>
                          )}
                       </div>
                    ))}
                 </div>
              )}
           </div>
        </div>

        {/* Right Panel: Editor + Results */}
        <div className="flex-1 flex flex-col overflow-hidden bg-neutral-950">
           {/* Editor Toolbar */}
           <div className="h-14 border-b border-white/5 px-4 flex items-center justify-between bg-white/2">
              <div className="flex bg-neutral-900 rounded-lg p-1">
                 <button 
                    onClick={() => handleLanguageSwitch('javascript')}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${language === 'javascript' ? 'bg-accent-blue text-white' : 'text-text-muted hover:text-white'}`}
                 >
                    JavaScript
                 </button>
                 <button 
                    onClick={() => handleLanguageSwitch('python')}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${language === 'python' ? 'bg-accent-blue text-white' : 'text-text-muted hover:text-white'}`}
                 >
                    Python
                 </button>
              </div>

              <div className="flex items-center gap-3">
                 <button onClick={handleReset} className="p-2 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-all" title="Reset Code">
                    <RotateCcw size={18} />
                 </button>
                 <button 
                    disabled={isRunning || isSubmitting || !!submission}
                    onClick={handleRun}
                    className="flex items-center gap-2 px-4 py-1.5 bg-accent-green/10 border border-accent-green/30 text-accent-green rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-accent-green hover:text-white transition-all disabled:opacity-30"
                 >
                    {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />} Run Code
                 </button>
                 <button 
                    disabled={isRunning || isSubmitting || !!submission}
                    onClick={() => handleSubmit()}
                    className="flex items-center gap-2 px-4 py-1.5 bg-accent-purple text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-30"
                 >
                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Submit Challenge
                 </button>
              </div>
           </div>

           {/* Monaco Editor */}
           <div className="flex-1 overflow-hidden relative">
              <Editor
                 height="100%"
                 theme="vs-dark"
                 language={language}
                 value={code}
                 onChange={(v) => setCode(v || '')}
                 options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 20 },
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    renderLineHighlight: 'all',
                    readOnly: !!submission
                 }}
              />
           </div>

           {/* Results Tray */}
           <AnimatePresence>
              {(results || submission) && (
                 <motion.div 
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    className="h-72 border-t border-white/10 bg-neutral-900 overflow-y-auto"
                 >
                    <div className="p-6 space-y-6">
                       <div className="flex items-center justify-between sticky top-0 bg-neutral-900 py-2 z-10 border-b border-white/5 mb-4">
                          <h4 className="text-xs font-black uppercase tracking-widest text-text-muted">
                             {submission ? 'Final Evaluation Results' : 'Code Execution Output'}
                          </h4>
                          {submission && (
                               <div className="flex items-center gap-4">
                                   <div className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                                       submission.status === 'accepted' ? 'bg-accent-green text-white' : 
                                       submission.status === 'partial' ? 'bg-accent-amber text-white' : 'bg-accent-error text-white'
                                   }`}>
                                       {submission.status} — {submission.pointsAwarded} PTS
                                   </div>
                                   <button onClick={onClose} className="text-[10px] font-bold text-accent-blue hover:underline">Back to Challenges</button>
                               </div>
                          )}
                          {!submission && <button onClick={() => setResults(null)} className="p-1 text-text-muted hover:text-white"><X size={16}/></button>}
                       </div>

                       <div className="space-y-4 pb-8">
                          {(submission ? submission.testResults : results).map((res: any, i: number) => (
                             <div key={i} className="bg-white/2 border border-white/5 rounded-xl p-4 flex gap-4">
                                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${res.passed ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-error/10 text-accent-error'}`}>
                                   {res.passed ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                                </div>
                                <div className="flex-1 space-y-3">
                                   <div className="flex justify-between items-center">
                                      <p className="text-[10px] font-bold text-text-muted uppercase italic">Case {i + 1} {res.isHidden && <span className="text-accent-purple">(Hidden Case)</span>}</p>
                                      {res.passed ? <span className="text-[10px] font-black text-accent-green">CORRECT MATCH</span> : <span className="text-[10px] font-black text-accent-error">ASSERTION FAILED</span>}
                                   </div>
                                   <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-1">
                                         <p className="text-[8px] font-black text-text-muted uppercase">Your Output</p>
                                         <code className="text-xs bg-black/40 px-2 py-1 rounded block">{res.actualOutput || 'null'}</code>
                                      </div>
                                      <div className="space-y-1">
                                         <p className="text-[8px] font-black text-text-muted uppercase">Expected Output</p>
                                         <code className="text-xs bg-black/40 px-2 py-1 rounded block text-accent-green">{res.expectedOutput || 'null'}</code>
                                      </div>
                                   </div>
                                   {submission && res.explanation && (
                                       <div className="bg-white/5 px-3 py-2 rounded-lg text-xs italic text-text-muted border-l-2 border-accent-purple">
                                           "{res.explanation}"
                                       </div>
                                   )}
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default CodingEditor;
