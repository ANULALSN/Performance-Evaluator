import React from 'react';
import { BrainCircuit, Clock, ChevronRight } from 'lucide-react';

const QuizSection: React.FC = () => {
  const quizzes = [
    { id: 'q1', title: 'React Hooks Mastery', questions: 10, time: 15, difficulty: 'Medium' },
    { id: 'q2', title: 'Advanced CSS Patterns', questions: 8, time: 10, difficulty: 'Hard' }
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Quizzes</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Test your knowledge and earn accountability points.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {quizzes.map(quiz => (
          <div key={quiz.id} className="card glass">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                <BrainCircuit size={24} color="var(--accent-primary)" />
              </div>
              <span style={{ 
                fontSize: '0.7rem', 
                padding: '0.25rem 0.6rem', 
                background: quiz.difficulty === 'Hard' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                color: quiz.difficulty === 'Hard' ? 'var(--accent-error)' : 'var(--accent-success)',
                borderRadius: '1rem',
                fontWeight: 700
              }}>
                {quiz.difficulty}
              </span>
            </div>
            
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{quiz.title}</h3>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={14} />
                {quiz.time} mins
              </span>
              <span>•</span>
              <span>{quiz.questions} Questions</span>
            </div>

            <button className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              Start Quiz
              <ChevronRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizSection;
