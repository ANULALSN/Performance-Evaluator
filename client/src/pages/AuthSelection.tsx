import React from 'react';
import { useAppContext } from '../context/AppContext';
import { ShieldCheck, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

const AuthSelection: React.FC = () => {
  const { setRole } = useAppContext();

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: '4rem' }}
      >
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }} className="gradient-text">Student Innovator</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem' }}>Full-Stack Performance Platform</p>
      </motion.div>

      <div style={{ 
        display: 'flex', 
        gap: '2rem', 
        maxWidth: '1000px', 
        width: '100%',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <motion.div 
          whileHover={{ scale: 1.02, translateY: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setRole('ADMIN')}
          className="card glass"
          style={{ 
            flex: '1', 
            minWidth: '300px', 
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '3rem',
            textAlign: 'center',
            border: '2px solid transparent',
            transition: 'border-color 0.3s'
          }}
        >
          <div style={{ 
            background: 'rgba(99, 102, 241, 0.1)', 
            padding: '1.5rem', 
            borderRadius: '50%',
            marginBottom: '1.5rem'
          }}>
            <ShieldCheck size={48} color="var(--accent-primary)" />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Admin Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Configure quizzes, review performance, and manage student trajectories.
          </p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02, translateY: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setRole('STUDENT')}
          className="card glass"
          style={{ 
            flex: '1', 
            minWidth: '300px', 
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '3rem',
            textAlign: 'center'
          }}
        >
          <div style={{ 
            background: 'rgba(168, 85, 247, 0.1)', 
            padding: '1.5rem', 
            borderRadius: '50%',
            marginBottom: '1.5rem'
          }}>
            <GraduationCap size={48} color="var(--accent-secondary)" />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Student Portal</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Daily check-ins, tasks, quizzes, and real-time progress tracking.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthSelection;
