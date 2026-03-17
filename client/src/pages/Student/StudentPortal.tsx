import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  CheckSquare, 
  BrainCircuit, 
  BarChart3, 
  User as UserIcon,
  LogOut,
  Bell
} from 'lucide-react';
import StudentDashboard from './StudentDashboard';
import DailyTasks from './DailyTasks';
import QuizSection from './QuizSection';
import ProgressStats from './ProgressStats';
import { motion, AnimatePresence } from 'framer-motion';

const StudentPortal: React.FC = () => {
  const { currentUser, stats } = useAppContext();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'quiz' | 'stats'>('dashboard');

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'tasks', icon: CheckSquare, label: 'Daily Tasks' },
    { id: 'quiz', icon: BrainCircuit, label: 'Quizzes' },
    { id: 'stats', icon: BarChart3, label: 'Progress' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '280px', 
        borderRight: '1px solid var(--border-color)',
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        background: 'var(--bg-primary)'
      }}>
        <div style={{ marginBottom: '3rem', paddingLeft: '0.5rem' }}>
          <h2 className="gradient-text" style={{ fontSize: '1.5rem' }}>Student Innovator</h2>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '0.5rem',
                background: activeTab === item.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                color: activeTab === item.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === item.id ? 600 : 400,
                textAlign: 'left'
              }}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              background: 'var(--bg-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserIcon size={20} color="var(--text-muted)" />
            </div>
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{currentUser?.name}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{currentUser?.cohort}</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem', 
              color: 'var(--accent-error)',
              padding: '0.5rem'
            }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: '280px', flex: 1, padding: '2rem 3rem' }}>
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '3rem'
        }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Welcome back, {currentUser?.name.split(' ')[0]}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div className="card" style={{ padding: '0.5rem 1rem', display: 'flex', gap: '1.5rem' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Points</p>
                <p style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{stats?.cumulativeScore || 0}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Streak</p>
                <p style={{ fontWeight: 700, color: 'var(--accent-secondary)' }}>{stats?.streak || 0} 🔥</p>
              </div>
            </div>
            <button className="glass" style={{ padding: '0.75rem', borderRadius: '50%' }}>
              <Bell size={20} />
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && <StudentDashboard />}
            {activeTab === 'tasks' && <DailyTasks />}
            {activeTab === 'quiz' && <QuizSection />}
            {activeTab === 'stats' && <ProgressStats />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default StudentPortal;
