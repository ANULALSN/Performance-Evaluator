import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { BookOpen, Code2, Bug, CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

const DailyTasks: React.FC = () => {
  const { tasks, completeTask } = useAppContext();

  const getIcon = (type: string) => {
    switch(type) {
      case 'concept': return <BookOpen size={20} color="var(--accent-primary)" />;
      case 'feature': return <Code2 size={20} color="var(--accent-secondary)" />;
      case 'debug': return <Bug size={20} color="var(--accent-error)" />;
      default: return null;
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>The 3-Task Rule</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Focus on these three specific objectives for today.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {tasks.map((task, index) => (
          <motion.div 
            key={task.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card"
            style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '1.5rem',
              opacity: task.status === 'completed' ? 0.7 : 1,
              transition: 'opacity 0.3s'
            }}
          >
            <button 
              onClick={() => task.status === 'pending' && completeTask(task.id)}
              style={{ padding: '0.25rem', marginTop: '0.25rem', background: 'transparent' }}
            >
              {task.status === 'completed' ? (
                <CheckCircle2 size={24} color="var(--accent-success)" />
              ) : (
                <Circle size={24} color="var(--text-muted)" />
              )}
            </button>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem', 
                  fontSize: '0.7rem', 
                  padding: '0.25rem 0.6rem', 
                  background: 'var(--bg-tertiary)', 
                  borderRadius: '1rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: 'var(--text-secondary)'
                }}>
                  {getIcon(task.type)}
                  {task.type}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Task {index + 1}</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>{task.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>{task.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {tasks.length > 0 && tasks.every(t => t.status === 'completed') && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ 
            marginTop: '3rem', 
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))',
            padding: '2rem',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
            border: '1px solid var(--accent-primary)'
          }}
        >
          <h3 className="gradient-text" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Perfect Completion!</h3>
          <p style={{ color: 'var(--text-secondary)' }}>All tasks finished. +3 Consistency Score awarded.</p>
        </motion.div>
      )}
    </div>
  );
};

export default DailyTasks;
