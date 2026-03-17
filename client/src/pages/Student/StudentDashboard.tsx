import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Send, Sparkles, TrendingUp, AlertCircle } from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const { submitCheckIn, checkIns, stats } = useAppContext();
  const [formData, setFormData] = useState({
    whatLearned: '',
    whatBuilt: '',
    problemFaced: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitCheckIn(formData);
    setFormData({ whatLearned: '', whatBuilt: '', problemFaced: '' });
  };

  const hasCheckedInToday = checkIns.some(c => 
    new Date(c.date).toDateString() === new Date().toDateString()
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
      <section>
        {!hasCheckedInToday ? (
          <div className="card glass" style={{ padding: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: 'var(--accent-primary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                <Send size={24} color="white" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem' }}>Daily Check-in</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Log your progress and get AI feedback.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>What did you learn today?</label>
                <textarea 
                  required
                  rows={2}
                  value={formData.whatLearned}
                  onChange={(e) => setFormData({...formData, whatLearned: e.target.value})}
                  placeholder="E.g. Learned about useEffect cleanup and memory leaks..."
                  style={{ width: '100%', resize: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>What did you build or practice?</label>
                <textarea 
                   required
                  rows={2}
                  value={formData.whatBuilt}
                  onChange={(e) => setFormData({...formData, whatBuilt: e.target.value})}
                  placeholder="E.g. Refactored the API layer to use axios interceptors..."
                  style={{ width: '100%', resize: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>What did you face?</label>
                <textarea 
                   required
                  rows={2}
                   value={formData.problemFaced}
                   onChange={(e) => setFormData({...formData, problemFaced: e.target.value})}
                  placeholder="E.g. Struggled with CORS issues on the backend..."
                  style={{ width: '100%', resize: 'none' }}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                Submit Check-in
                <Send size={16} />
              </button>
            </form>
          </div>
        ) : (
          <div className="card glass" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
             <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <Sparkles size={32} color="var(--accent-success)" />
             </div>
             <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Check-in Complete!</h3>
             <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>You've earned +1 point for today's accountability.</p>
             
             {checkIns[checkIns.length - 1]?.feedback && (
                <div style={{ background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', textAlign: 'left', borderLeft: '4px solid var(--accent-primary)' }}>
                   <p style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>AI FEEDBACK</p>
                   <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{checkIns[checkIns.length - 1].feedback}</p>
                </div>
             )}
          </div>
        )}
      </section>

      <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="card">
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <TrendingUp size={18} color="var(--accent-primary)" />
            Focus Areas
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {stats?.weaknessTags.map((tag: string) => (
              <span key={tag} style={{ 
                padding: '0.4rem 0.8rem', 
                background: 'var(--bg-tertiary)', 
                borderRadius: '2rem',
                fontSize: '0.75rem',
                border: '1px solid var(--border-color)'
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--accent-warning)' }}>
           <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <AlertCircle size={18} color="var(--accent-warning)" />
            Upcoming Deadline
          </h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Weekly review is due this Sunday.</p>
        </div>
      </aside>
    </div>
  );
};

export default StudentDashboard;
