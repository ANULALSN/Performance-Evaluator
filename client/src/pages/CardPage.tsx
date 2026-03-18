import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Loader2, AlertTriangle } from 'lucide-react';
import api from '../api';
import StudentCard from '../components/student/StudentCard';
import CardDownload from '../components/student/CardDownload';
import type { CardData } from '../components/student/StudentCard';

const rarityLabel: Record<string, { text: string; color: string; desc: string }> = {
  common:    { text: 'Common',    color: '#4a4a6a', desc: 'Keep going — every legend started here.' },
  uncommon:  { text: 'Uncommon',  color: '#4a9eff', desc: 'You\'ve built real momentum!' },
  rare:      { text: 'Rare',      color: '#9d4edd', desc: 'A purple aura of consistency.' },
  epic:      { text: 'Epic',      color: '#ffd700', desc: 'Top 20% of the cohort. Gold tier.' },
  legendary: { text: 'Legendary', color: '#ff0080', desc: 'One of the all-time greats on SIPP.' },
};

const CardPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!studentId) return;
    const fetch = async () => {
      try {
        // Use direct axios to avoid auth interceptor redirects on public page
        const { data } = await api.get(`card/${studentId}`);
        setCardData(data);

        // Set OG meta tags dynamically
        document.title = `${data.name}'s SIPP Card — Level ${data.level}`;
        const setMeta = (prop: string, content: string, isName = false) => {
          let el = document.querySelector(`meta[${isName ? 'name' : 'property'}="${prop}"]`);
          if (!el) {
            el = document.createElement('meta');
            el.setAttribute(isName ? 'name' : 'property', prop);
            document.head.appendChild(el);
          }
          el.setAttribute('content', content);
        };
        setMeta('og:title', `${data.name}'s SIPP Card`);
        setMeta('og:description', `Level ${data.level} · ${data.streak}-day streak · ${data.cardRarity.toUpperCase()} tier`);
        setMeta('og:type', 'website');
        setMeta('twitter:card', 'summary', true);
        setMeta('twitter:title', `${data.name}'s SIPP Card`, true);
        setMeta('twitter:description', `Level ${data.level} · ${data.streak} day streak on SIPP`, true);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Student card not found.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center gap-4">
        <Loader2 size={40} className="text-accent-purple animate-spin" />
        <p className="text-text-muted font-medium">Loading SIPP Card…</p>
      </div>
    );
  }

  if (error || !cardData) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center gap-6 p-8">
        <AlertTriangle size={48} className="text-accent-amber" />
        <h1 className="text-2xl font-bold">Card Not Found</h1>
        <p className="text-text-muted text-center max-w-sm">{error || 'This card may not exist or has been removed.'}</p>
        <Link
          to="/auth"
          className="px-8 py-3 rounded-xl font-bold text-sm text-white"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
        >
          Join SIPP
        </Link>
      </div>
    );
  }

  const rarity = rarityLabel[cardData.cardRarity] || rarityLabel.common;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 py-16"
      style={{
        background: 'radial-gradient(ellipse at top, #12062b 0%, #0a0a0a 60%)',
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-12"
      >
        <div className="w-10 h-10 bg-accent-purple rounded-xl flex items-center justify-center">
          <Zap className="text-white fill-white" size={22} />
        </div>
        <span className="text-2xl font-outfit font-extrabold tracking-tighter text-white">SIPP</span>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="mb-8"
      >
        <StudentCard data={cardData} />
      </motion.div>

      {/* Rarity explanation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-8 text-center"
      >
        <span
          className="text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full"
          style={{ background: `${rarity.color}22`, color: rarity.color, border: `1px solid ${rarity.color}55` }}
        >
          ◆ {rarity.text} Tier
        </span>
        <p className="text-text-muted text-sm mt-2">{rarity.desc}</p>
      </motion.div>

      {/* Download & share */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-12"
      >
        <CardDownload data={cardData} />
      </motion.div>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-3 gap-4 max-w-[400px] w-full mb-12"
      >
        {[
          { label: 'Level', value: `LV.${cardData.level}` },
          { label: 'Streak', value: `${cardData.streak}d 🔥` },
          { label: 'Rank', value: `#${cardData.rank}` },
        ].map(s => (
          <div
            key={s.label}
            className="text-center py-4 px-3 rounded-2xl border border-white/5"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <p className="text-xs text-text-muted font-bold uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-xl font-black text-white">{s.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Join CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-center"
      >
        <p className="text-text-muted text-sm mb-4">Want your own SIPP Card?</p>
        <Link
          to="/auth"
          className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-base text-white transition-all hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            boxShadow: '0 8px 30px rgba(124,58,237,0.4)',
          }}
        >
          <Zap size={18} />
          Join SIPP Free
        </Link>
        <p className="text-text-muted text-xs mt-4 opacity-60">sipp.acadeno.com</p>
      </motion.div>
    </div>
  );
};

export default CardPage;
