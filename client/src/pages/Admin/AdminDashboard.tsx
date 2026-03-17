import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  Users, 
  BookMarked, 
  BarChart, 
  Megaphone,
  Plus,
  Search,
  User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ContentBank from './ContentBank';

const AdminDashboard: React.FC = () => {
  const { currentUser } = useAppContext();
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'content' | 'analytics'>('overview');

  const navItems = [
    { id: 'overview', icon: BarChart, label: 'Overview' },
    { id: 'students', icon: Users, label: 'Students' },
    { id: 'content', icon: BookMarked, label: 'Content Bank' },
    { id: 'analytics', icon: Megaphone, label: 'Communications' },
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
          <h2 className="gradient-text" style={{ fontSize: '1.5rem' }}>Admin Control</h2>
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
                background: activeTab === item.id ? 'var(--bg-tertiary)' : 'transparent',
                color: activeTab === item.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === item.id ? 600 : 400,
                textAlign: 'left',
                border: activeTab === item.id ? '1px solid var(--border-color)' : '1px solid transparent'
              }}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
             <UserIcon size={20} color="var(--text-muted)" />
             <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{currentUser?.name}</p>
          </div>
           <button 
            onClick={() => window.location.reload()}
            style={{ width: '100%', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'left', padding: '0.5rem' }}
          >
            Switch Workspace
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: '280px', flex: 1, padding: '2rem 3rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem' }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
             <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input placeholder="Search students, quizzes..." style={{ paddingLeft: '2.5rem', width: '300px' }} />
             </div>
             <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={18} />
                New Quiz
             </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
             key={activeTab}
             initial={{ opacity: 0, x: 10 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -10 }}
             transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                 <div className="card">
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Active Students</p>
                    <p style={{ fontSize: '2rem', fontWeight: 700 }}>142</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--accent-success)', marginTop: '0.5rem' }}>+12% this week</p>
                 </div>
                 <div className="card">
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Avg Completion</p>
                    <p style={{ fontSize: '2rem', fontWeight: 700 }}>84%</p>
                 </div>
                 <div className="card">
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Pending Evals</p>
                    <p style={{ fontSize: '2rem', fontWeight: 700 }}>28</p>
                 </div>
                 <div className="card">
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Drop-off Alert</p>
                    <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-error)' }}>3</p>
                 </div>

                 {/* Recent Activity Table */}
                 <div className="card" style={{ gridColumn: 'span 4', marginTop: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Recent Quiz Attempts</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                       <thead>
                          <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                             <th style={{ padding: '1rem' }}>Student</th>
                             <th style={{ padding: '1rem' }}>Quiz</th>
                             <th style={{ padding: '1rem' }}>Score</th>
                             <th style={{ padding: '1rem' }}>Status</th>
                             <th style={{ padding: '1rem' }}>Action</th>
                          </tr>
                       </thead>
                       <tbody>
                          {[
                            { name: 'John Doe', quiz: 'React Basics', score: '90%', status: 'Graded' },
                            { name: 'Jane Smith', quiz: 'React Basics', score: 'Pending', status: 'Review Needed' },
                            { name: 'Mike Ross', quiz: 'Node Intro', score: '75%', status: 'Graded' }
                          ].map((row, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                               <td style={{ padding: '1rem' }}>{row.name}</td>
                               <td style={{ padding: '1rem' }}>{row.quiz}</td>
                               <td style={{ padding: '1rem' }}>{row.score}</td>
                               <td style={{ padding: '1rem' }}>
                                  <span style={{ 
                                    padding: '0.2rem 0.6rem', 
                                    borderRadius: '1rem', 
                                    fontSize: '0.75rem',
                                    background: row.status === 'Graded' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                    color: row.status === 'Graded' ? 'var(--accent-success)' : 'var(--accent-warning)'
                                  }}>
                                    {row.status}
                                  </span>
                               </td>
                               <td style={{ padding: '1rem' }}><button style={{ background: 'transparent', color: 'var(--accent-primary)' }}>Review</button></td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
            )}
            
            {activeTab === 'content' && <ContentBank />}
            
            {activeTab !== 'overview' && activeTab !== 'content' && (
              <div className="card glass" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <p style={{ color: 'var(--text-muted)' }}>{activeTab} module implementation in progress...</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminDashboard;
