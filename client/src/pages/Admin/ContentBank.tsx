import React, { useState } from 'react';
import { Plus, Filter } from 'lucide-react';

const ContentBank: React.FC = () => {
  const [filter, setFilter] = useState('All');

  const questions = [
    { id: '1', text: "What is the result of typeof null?", topic: 'JS Basics', difficulty: 'Easy', type: 'MCQ' },
    { id: '2', text: "Predict the output: console.log(0.1 + 0.2 === 0.3)", topic: 'JS Advanced', difficulty: 'Medium', type: 'Code Prediction' },
    { id: '3', text: "Explain the virtual DOM in React.", topic: 'React', difficulty: 'Hard', type: 'Short Answer' }
  ];

  return (
    <div className="card glass">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} />
            Filter Topics
          </button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['All', 'Easy', 'Medium', 'Hard'].map(d => (
              <button 
                key={d}
                onClick={() => setFilter(d)}
                style={{ 
                  padding: '0.5rem 1rem', 
                  borderRadius: '1rem', 
                  fontSize: '0.8rem',
                  background: filter === d ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: filter === d ? 'white' : 'var(--text-secondary)'
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} />
          Add Question
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {questions.map(q => (
          <div key={q.id} style={{ 
            padding: '1.25rem', 
            background: 'var(--bg-tertiary)', 
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ flex: 1 }}>
               <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>{q.topic}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{q.type}</span>
               </div>
               <p style={{ fontWeight: 500 }}>{q.text}</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
               <span style={{ 
                  fontSize: '0.75rem', 
                  padding: '0.2rem 0.6rem', 
                  borderRadius: '1rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: q.difficulty === 'Hard' ? 'var(--accent-error)' : 'var(--text-secondary)'
               }}>
                  {q.difficulty}
               </span>
               <button style={{ background: 'transparent', color: 'var(--text-muted)' }}>Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentBank;
