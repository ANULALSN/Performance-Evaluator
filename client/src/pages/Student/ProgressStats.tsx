import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { AreaChart, Calendar, Trophy, Zap } from 'lucide-react';

const ProgressStats: React.FC = () => {
  const { stats } = useAppContext();

  const metrics = [
    { label: 'Weekly Score', value: stats?.weeklyScore || 0, icon: Zap, color: 'var(--accent-primary)' },
    { label: 'Cumulative', value: stats?.cumulativeScore || 0, icon: Trophy, color: 'var(--accent-secondary)' },
    { label: 'Active Streak', value: `${stats?.streak || 0} Days`, icon: Calendar, color: 'var(--accent-success)' },
    { label: 'Avg Accuracy', value: '88%', icon: AreaChart, color: 'var(--text-muted)' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Your Progress</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Longitudinal performance tracking and skill analysis.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {metrics.map(m => (
          <div key={m.label} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
               <m.icon size={20} color={m.color} />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{m.label}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{m.value}</p>
          </div>
        ))}
      </div>

      <div className="card glass" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Interactive performance heatmap coming soon...</p>
      </div>
    </div>
  );
};

export default ProgressStats;
