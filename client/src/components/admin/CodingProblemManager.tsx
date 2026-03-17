import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { 
  Save, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Info,
  Clock,
  Zap,
  Layout,
  FileCode,
  CheckCircle,
  Hash,
  Loader2
} from 'lucide-react';
import api from '../../api';
import type { CodingProblem, CodingTestCase } from '../../types';

interface CodingProblemBuilderProps {
  problemId?: string;
  onSave: () => void;
}

const OptionSelect = ({ icon: Icon, label, value, options, onChange }: any) => (
   <div className="space-y-1">
      <p className="text-[10px] font-black uppercase text-text-muted flex items-center gap-1.5"><Icon size={12}/> {label}</p>
      <select 
         value={value}
         onChange={e => onChange(e.target.value)}
         className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs font-bold outline-none capitalize"
      >
         {options.map((opt: string) => <option key={opt} value={opt} className="bg-bg-secondary">{opt}</option>)}
      </select>
   </div>
);

const ListManager = ({ title, items, onAdd, onChange, onRemove }: any) => (
   <div className="glass p-8 border-white/5 space-y-6">
      <div className="flex justify-between items-center">
         <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">{title}</h3>
         <button onClick={onAdd} className="text-accent-blue hover:underline text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
            <Plus size={12}/> New Entry
         </button>
      </div>
      <div className="space-y-3">
         {items.map((item: string, i: number) => (
            <div key={i} className="flex gap-3">
               <input 
                  type="text"
                  value={item}
                  onChange={e => onChange(i, e.target.value)}
                  placeholder="..."
                  className="flex-1 bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs font-medium text-white outline-none"
               />
               <button onClick={() => onRemove(i)} className="p-2 text-accent-error hover:bg-accent-error/10 rounded-lg transition-all">
                  <Trash2 size={14} />
               </button>
            </div>
         ))}
      </div>
   </div>
);

const CodingProblemManager: React.FC<CodingProblemBuilderProps> = ({ problemId, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CodingProblem>>({
    title: '',
    description: '',
    difficulty: 'easy',
    techStack: 'General',
    starterCode: {
      javascript: 'function solution(arr) {\n  // your code here\n}',
      python: 'def solution(arr):\n    # your code here\n    pass'
    },
    testCases: [{ input: '', expectedOutput: '', isHidden: false, explanation: '' }],
    constraints: [''],
    hints: [''],
    timeLimit: 1800,
    pointsReward: 10,
    isActive: false
  });

  const [activeLangTab, setActiveLangTab] = useState<'javascript' | 'python'>('javascript');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (problemId) {
      const fetchProblem = async () => {
        try {
          const { data } = await api.get(`coding-problems/admin/coding-problems/${problemId}`);
          setFormData(data);
        } catch (err) {
          console.error('Failed to fetch problem', err);
        }
      };
      fetchProblem();
    }
  }, [problemId]);

  const handleSave = async (isPublish: boolean) => {
    setLoading(true);
    try {
      const payload = { ...formData, isActive: isPublish };
      if (problemId) {
        await api.put(`coding-problems/admin/coding-problems/${problemId}`, payload);
      } else {
        await api.post('coding-problems/admin/coding-problems', payload);
      }
      onSave();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save problem');
    } finally {
      setLoading(false);
    }
  };

  const addTestCase = () => {
    setFormData(prev => ({
      ...prev,
      testCases: [...(prev.testCases || []), { input: '', expectedOutput: '', isHidden: false, explanation: '' }]
    }));
  };

  const updateTestCase = (index: number, field: keyof CodingTestCase, value: any) => {
    const newTestCases = [...(formData.testCases || [])];
    newTestCases[index] = { ...newTestCases[index], [field]: value };
    setFormData(prev => ({ ...prev, testCases: newTestCases }));
  };

  const removeTestCase = (index: number) => {
    setFormData(prev => ({
      ...prev,
      testCases: prev.testCases?.filter((_, i) => i !== index)
    }));
  };

  const updateArrayField = (field: 'constraints' | 'hints', index: number, value: string) => {
    const newArray = [...(formData[field] || [])];
    newArray[index] = value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field: 'constraints' | 'hints') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), '']
    }));
  };

  const removeArrayItem = (field: 'constraints' | 'hints', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field]?.filter((_, i) => i !== index)
    }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 pb-20 max-w-5xl"
    >
       {/* Top Header Section */}
       <div className="flex justify-between items-start">
          <div className="space-y-4 flex-1">
             <input 
                type="text"
                placeholder="Enter Challenge Title..."
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="bg-transparent text-4xl font-outfit font-black border-none outline-none w-full placeholder:opacity-20 gradient-text p-0"
             />
             <div className="flex gap-6">
                <OptionSelect 
                    icon={Layout} 
                    label="Difficulty" 
                    value={formData.difficulty} 
                    options={['easy', 'medium', 'hard']} 
                    onChange={(v: string) => setFormData({...formData, difficulty: v as any})} 
                />
                <OptionSelect 
                    icon={FileCode} 
                    label="Tech Stack" 
                    value={formData.techStack} 
                    options={['JavaScript', 'Python', 'General']} 
                    onChange={(v: string) => setFormData({...formData, techStack: v as any})} 
                />
                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase text-text-muted flex items-center gap-1.5"><Clock size={12}/> Duration (m)</p>
                   <input 
                      type="number"
                      value={formData.timeLimit! / 60}
                      onChange={e => setFormData({...formData, timeLimit: parseInt(e.target.value) * 60})}
                      className="bg-black/40 border border-white/5 rounded-lg px-3 py-1 text-xs font-bold w-20 text-white outline-none"
                   />
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase text-text-muted flex items-center gap-1.5"><Zap size={12}/> Reward Pts</p>
                   <input 
                      type="number"
                      value={formData.pointsReward}
                      onChange={e => setFormData({...formData, pointsReward: parseInt(e.target.value)})}
                      className="bg-black/40 border border-white/5 rounded-lg px-3 py-1 text-xs font-bold w-20 text-white outline-none"
                   />
                </div>
             </div>
          </div>

          <div className="flex gap-4">
             <button 
                onClick={() => handleSave(false)}
                disabled={loading}
                className="btn-secondary h-12 px-6 text-xs font-bold flex items-center gap-2"
             >
                {loading ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Save as Draft
             </button>
             <button 
                onClick={() => handleSave(true)}
                disabled={loading}
                className="btn-primary h-12 px-6 text-xs font-bold flex items-center gap-2"
             >
                {loading ? <Loader2 className="animate-spin" size={16}/> : <CheckCircle size={16}/>} Publish Challenge
             </button>
          </div>
       </div>

       {/* Description Section */}
       <div className="glass p-8 border-white/5 space-y-4">
          <div className="flex justify-between items-center">
             <h3 className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2"><Info size={14}/> Problem Description (Markdown)</h3>
             <button onClick={() => setShowPreview(!showPreview)} className="text-[10px] font-bold text-accent-blue uppercase tracking-widest px-3 py-1 bg-accent-blue/5 rounded-lg border border-accent-blue/20">
                {showPreview ? 'Edit Source' : 'Preview Layout'}
             </button>
          </div>
          {showPreview ? (
             <div className="prose prose-invert prose-sm max-w-none bg-black/20 p-6 rounded-xl border border-white/5 min-h-[150px]">
                {formData.description || 'No description provided.'}
             </div>
          ) : (
             <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the technical requirements and goal..."
                className="w-full h-40 bg-black/40 border border-white/10 rounded-xl p-4 text-sm font-medium text-white outline-none placeholder:opacity-40"
             />
          )}
       </div>

       {/* Starter Code Section */}
       <div className="glass p-8 border-white/5 space-y-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2"><FileCode size={14}/> Starter Templates</h3>
          <div className="flex bg-neutral-900 rounded-xl p-1 w-fit mb-4">
             <button onClick={() => setActiveLangTab('javascript')} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeLangTab === 'javascript' ? 'bg-accent-blue text-white shadow-xl' : 'text-text-muted hover:text-white'}`}>JavaScript</button>
             <button onClick={() => setActiveLangTab('python')} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeLangTab === 'python' ? 'bg-accent-blue text-white shadow-xl' : 'text-text-muted hover:text-white'}`}>Python</button>
          </div>
          <div className="h-40 relative rounded-xl overflow-hidden border border-white/5">
             <Editor
                height="100%"
                theme="vs-dark"
                language={activeLangTab}
                value={activeLangTab === 'javascript' ? formData.starterCode?.javascript : formData.starterCode?.python}
                onChange={(v: string | undefined) => setFormData({
                   ...formData, 
                   starterCode: { 
                      ...formData.starterCode!, 
                      [activeLangTab]: v || '' 
                   }
                })}
                options={{ fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false }}
             />
          </div>
       </div>

       {/* Dynamic Lists (Constraints & Hints) */}
       <div className="grid grid-cols-2 gap-8">
          <ListManager 
             title="Logical Constraints" 
             items={formData.constraints || []} 
             onAdd={() => addArrayItem('constraints')} 
             onChange={(i: number, v: string) => updateArrayField('constraints', i, v)} 
             onRemove={(i: number) => removeArrayItem('constraints', i)}
          />
          <ListManager 
             title="Strategic Hints" 
             items={formData.hints || []} 
             onAdd={() => addArrayItem('hints')} 
             onChange={(i: number, v: string) => updateArrayField('hints', i, v)} 
             onRemove={(i: number) => removeArrayItem('hints', i)}
          />
       </div>

       {/* Test Cases Section */}
       <div className="space-y-6">
          <div className="flex justify-between items-center">
             <h3 className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2"><Hash size={14}/> Technical Test Suite</h3>
             <button onClick={addTestCase} className="flex items-center gap-2 px-4 py-2 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent-blue hover:text-white transition-all">
                <Plus size={14}/> Add New Assertion
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {formData.testCases?.map((tc, idx) => (
                <div key={idx} className="glass p-6 border-white/10 space-y-4">
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] font-black text-text-muted uppercase tracking-tight">Assertion #{idx + 1}</span>
                         <button 
                            onClick={() => updateTestCase(idx, 'isHidden', !tc.isHidden)}
                            className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${tc.isHidden ? 'text-accent-purple' : 'text-accent-blue'}`}
                         >
                            {tc.isHidden ? (
                               <><EyeOff size={12}/> Locked Case</>
                            ) : (
                               <><Eye size={12}/> Public Case</>
                            )}
                         </button>
                      </div>
                      <button onClick={() => removeTestCase(idx)} className="p-2 text-accent-error hover:bg-accent-error/10 rounded-lg transition-all">
                         <Trash2 size={16} />
                      </button>
                   </div>
                   <div className="space-y-3">
                      <div className="space-y-1">
                         <p className="text-[9px] font-black text-text-muted uppercase opacity-60">Input Arguments</p>
                         <textarea 
                            value={tc.input}
                            onChange={e => updateTestCase(idx, 'input', e.target.value)}
                            placeholder="e.g. [1, 2, 3] or 15"
                            className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs font-mono outline-none"
                         />
                      </div>
                      <div className="space-y-1">
                         <p className="text-[9px] font-black text-text-muted uppercase opacity-60">Expected Return Value</p>
                         <textarea 
                            value={tc.expectedOutput}
                            onChange={e => updateTestCase(idx, 'expectedOutput', e.target.value)}
                            placeholder="e.g. 6 or 'FizzBuzz'"
                            className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs font-mono outline-none text-accent-green"
                         />
                      </div>
                      <div className="space-y-1">
                         <p className="text-[9px] font-black text-text-muted uppercase opacity-60">Validation Logic (Explanation)</p>
                         <textarea 
                            value={tc.explanation}
                            onChange={e => updateTestCase(idx, 'explanation', e.target.value)}
                            placeholder="Why this case is important..."
                            className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-white outline-none italic"
                         />
                      </div>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </motion.div>
  );
};



export default CodingProblemManager;
