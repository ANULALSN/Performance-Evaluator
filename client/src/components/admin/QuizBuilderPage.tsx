import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Settings, 
  Save, 
  Sparkles, 
  Zap,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  Copy,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api';

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QuizBuilderPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    techStack: 'JavaScript',
    difficulty: 'medium',
    timeLimit: 300,
    passingScore: 60,
    isActive: false
  });

  const [questions, setQuestions] = useState<Question[]>([
    { question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }
  ]);

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    const updatedOptions = [...updated[qIndex].options];
    updatedOptions[oIndex] = value;
    updated[qIndex].options = updatedOptions;
    setQuestions(updated);
  };

  const handleSave = async (publish: boolean) => {
    if (!quizData.title) return alert('Quiz title is required');
    if (questions.some(q => !q.question || q.options.some(o => !o))) {
      return alert('All questions and options must be filled');
    }

    setLoading(true);
    try {
      await api.post('/admin/quizzes', {
        ...quizData,
        questions,
        isActive: publish
      });
      alert(publish ? 'Quiz Saved & Published!' : 'Quiz Saved as Draft');
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save quiz');
    } finally {
      setLoading(false);
    }
  };

  const techStacks = ["Python", "JavaScript", "React", "Node.js", "Full Stack", "AI/ML", "General"];

  return (
    <div className="pb-32 max-w-5xl mx-auto py-12 px-6">
      {/* Header Info */}
      <div className="mb-12 space-y-8">
        <div className="flex justify-between items-start">
           <div className="flex-1 max-w-2xl">
              <input 
                placeholder="Quiz Title" 
                className="bg-transparent border-none text-5xl font-outfit font-black mb-4 outline-none placeholder:opacity-20 w-full"
                value={quizData.title} onChange={e => setQuizData({...quizData, title: e.target.value})}
              />
              <textarea 
                placeholder="Brief description of the assessment goals..."
                className="bg-transparent border-none text-xl text-text-muted resize-none w-full outline-none placeholder:opacity-20"
                rows={2} value={quizData.description} onChange={e => setQuizData({...quizData, description: e.target.value})}
              />
           </div>
           
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setQuizData({...quizData, isActive: !quizData.isActive})}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all font-bold text-xs ${
                  quizData.isActive ? 'bg-accent-green/10 border-accent-green text-accent-green' : 'bg-white/5 border-white/10 text-text-muted'
                }`}
              >
                {quizData.isActive ? 'Live' : 'Draft'}
                <div className={`w-2.5 h-2.5 rounded-full ${quizData.isActive ? 'bg-accent-green animate-pulse' : 'bg-text-muted'}`}></div>
              </button>
           </div>
        </div>

        <div className="grid grid-cols-4 gap-6 glass p-6 bg-neutral-900 shadow-xl border-white/5">
           <ConfigSelect label="Tech Stack" value={quizData.techStack} options={techStacks} onChange={(v: string) => setQuizData({...quizData, techStack: v})} />
           <ConfigSelect label="Difficulty" value={quizData.difficulty} options={['easy', 'medium', 'hard']} onChange={(v: string) => setQuizData({...quizData, difficulty: v})} />
           <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-text-muted">Time Limit (secs)</label>
              <input 
                type="number" className="w-full bg-bg-primary border border-white/5 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent-purple"
                value={quizData.timeLimit} onChange={e => setQuizData({...quizData, timeLimit: parseInt(e.target.value) || 0})}
              />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-text-muted">Pass Score ({quizData.passingScore}%)</label>
              <input 
                type="range" min="0" max="100" className="w-full accent-accent-purple bg-transparent h-6 cursor-pointer"
                value={quizData.passingScore} onChange={e => setQuizData({...quizData, passingScore: parseInt(e.target.value)})}
              />
           </div>
        </div>
      </div>

      {/* Question List */}
      <div className="space-y-8 relative">
        {questions.map((q, qIndex) => (
          <motion.div 
             key={qIndex} 
             initial={{ opacity: 0, scale: 0.98 }}
             animate={{ opacity: 1, scale: 1 }}
             className="card-premium relative"
          >
             <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-accent-purple rounded-xl flex items-center justify-center font-outfit font-black text-white text-lg italic">
                      Q{qIndex + 1}
                   </div>
                   <h4 className="text-text-muted font-bold text-xs uppercase tracking-widest">Question Payload</h4>
                </div>
                <div className="flex gap-2">
                   <button className="p-2 hover:bg-white/5 text-text-muted rounded-lg"><Copy size={18}/></button>
                   <button onClick={() => removeQuestion(qIndex)} className="p-2 hover:bg-accent-error/10 text-accent-error/50 hover:text-accent-error rounded-lg">
                      <Trash2 size={18}/>
                   </button>
                </div>
             </div>

             <textarea 
               placeholder="Enter structural question text here..."
               className="w-full bg-bg-primary border border-white/5 rounded-2xl p-6 text-xl font-bold outline-none focus:border-accent-purple resize-none placeholder:opacity-20"
               rows={3} value={q.question} onChange={e => handleQuestionChange(qIndex, 'question', e.target.value)}
             />

             <div className="grid md:grid-cols-2 gap-4 mt-8">
                {q.options.map((option, oIndex) => (
                   <div 
                     key={oIndex} 
                     className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                       q.correctIndex === oIndex ? 'bg-accent-green/5 border-accent-green' : 'bg-bg-primary border-white/5'
                     }`}
                   >
                      <button 
                        onClick={() => handleQuestionChange(qIndex, 'correctIndex', oIndex)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          q.correctIndex === oIndex ? 'bg-accent-green border-accent-green' : 'border-white/10'
                        }`}
                      >
                         {q.correctIndex === oIndex && <CheckCircle size={14} className="text-bg-primary" />}
                      </button>
                      <input 
                        placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                        className="flex-1 bg-transparent border-none outline-none text-sm font-medium"
                        value={option} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)}
                      />
                   </div>
                ))}
             </div>

             <div className="mt-8 pt-8 border-t border-white/5">
                <div className="flex items-center gap-3 text-accent-purple mb-3">
                   <Sparkles size={16} />
                   <span className="text-[10px] font-black uppercase tracking-widest italic">Mentor Explanation (Visible post-submission)</span>
                </div>
                <textarea 
                  placeholder="Explain the logic behind the correct answer..."
                  className="w-full bg-bg-primary border border-white/5 rounded-xl p-4 text-sm text-text-muted italic outline-none focus:border-accent-purple resize-none"
                  rows={2} value={q.explanation} onChange={e => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                />
             </div>
          </motion.div>
        ))}

        <button 
          onClick={addQuestion}
          className="w-full py-8 border-2 border-dashed border-white/5 hover:border-accent-purple/30 bg-white/[0.02] rounded-3xl flex flex-col items-center justify-center gap-4 text-text-muted hover:text-accent-purple transition-all group"
        >
           <div className="p-4 rounded-2xl bg-white/5 group-hover:bg-accent-purple/10 transition-all">
              <Plus size={32} />
           </div>
           <span className="font-outfit font-bold text-lg">Add Question Module</span>
        </button>
      </div>

      {/* Sticky Bottom Toolbar */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 glass bg-neutral-900/90 shadow-2xl p-4 border-white/10 rounded-3xl flex items-center gap-8 px-8">
         <div className="flex items-center gap-3 pr-8 border-r border-white/10">
            <Zap size={20} className="text-accent-amber" />
            <div>
               <p className="text-[10px] font-black uppercase text-text-muted tracking-widest">Configuration</p>
               <p className="font-bold text-sm tracking-tighter">{questions.length} Question Units</p>
            </div>
         </div>
         
         <div className="flex gap-4">
            <button 
              disabled={loading}
              onClick={() => handleSave(false)}
              className="btn-secondary flex items-center gap-2 border-none font-bold text-sm"
            >
               Save as Draft
            </button>
            <button 
              disabled={loading}
              onClick={() => handleSave(true)}
              className="btn-primary flex items-center gap-3 py-3 px-8 text-sm font-black uppercase tracking-widest"
            >
               {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20}/> Push to Students</>}
            </button>
         </div>
      </div>
    </div>
  );
};

const ConfigSelect = ({ label, value, options, onChange }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] uppercase font-black tracking-widest text-text-muted">{label}</label>
    <select 
      className="w-full bg-bg-primary border border-white/5 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent-purple cursor-pointer"
      value={value} onChange={e => onChange(e.target.value)}
    >
      {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export default QuizBuilderPage;
