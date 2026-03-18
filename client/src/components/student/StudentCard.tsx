import React from 'react';
import { motion } from 'framer-motion';

// ─── Types ──────────────────────────────────────────────────────────────────
export interface CardData {
  _id: string;
  name: string;
  techStack: string;
  skillLevel: string;
  cardRarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  cardTitle: string;
  level: number;
  xp: number;
  totalXpEarned: number;
  xpToNextLevel: number;
  consistencyScore: number;
  weeklyScore: number;
  streak: number;
  weaknessTags?: string[];
  badges: { id: string; label: string; color: string }[];
  rank: number;
  totalStudents: number;
  stats: { power: number; speed: number; streak: number; knowledge: number };
  joinedDate?: string;
  lastActiveAt?: string;
}

// ─── Rarity Config ───────────────────────────────────────────────────────────
const rarityConfig = {
  common: {
    label: 'COMMON',
    badge: '#4a4a6a',
    gradient: 'linear-gradient(145deg, #1a1a2e, #16213e)',
    border: '2px solid #4a4a6a',
    glow: 'none',
    barColor: '#4a4a6a',
    shimmer: false,
    particles: false,
    rainbow: false,
  },
  uncommon: {
    label: 'UNCOMMON',
    badge: '#4a9eff',
    gradient: 'linear-gradient(145deg, #0d1b4b, #1a3a6b)',
    border: '2px solid #4a9eff',
    glow: '0 0 12px rgba(74,158,255,0.25)',
    barColor: '#4a9eff',
    shimmer: false,
    particles: false,
    rainbow: false,
  },
  rare: {
    label: 'RARE',
    badge: '#9d4edd',
    gradient: 'linear-gradient(145deg, #1a0533, #2d1566)',
    border: '2px solid #9d4edd',
    glow: '0 0 20px rgba(157,78,221,0.4)',
    barColor: '#9d4edd',
    shimmer: true,
    particles: false,
    rainbow: false,
  },
  epic: {
    label: 'EPIC',
    badge: '#ffd700',
    gradient: 'linear-gradient(145deg, #1a1200, #3d2800)',
    border: '2px solid #ffd700',
    glow: '0 0 30px rgba(255,215,0,0.35)',
    barColor: '#ffd700',
    shimmer: false,
    particles: true,
    rainbow: false,
  },
  legendary: {
    label: 'LEGENDARY',
    badge: 'url(#rainbowGrad)',
    gradient: 'linear-gradient(145deg, #0a0a0a, #1a1a1a)',
    border: '3px solid transparent',
    glow: '0 0 40px rgba(255,0,128,0.4), 0 0 80px rgba(64,224,208,0.2)',
    barColor: '#ff0080',
    shimmer: true,
    particles: true,
    rainbow: true,
  },
};

// ─── Tech stack avatar gradient ────────────────────────────────────────────
const techGradients: Record<string, string> = {
  Python: 'linear-gradient(135deg, #11998e, #38ef7d)',
  JavaScript: 'linear-gradient(135deg, #f7971e, #ffd200)',
  'Node.js': 'linear-gradient(135deg, #56ab2f, #a8e063)',
  React: 'linear-gradient(135deg, #2980b9, #6dd5fa)',
  'Full Stack': 'linear-gradient(135deg, #667eea, #764ba2)',
  'AI/ML': 'linear-gradient(135deg, #c471ed, #f64f59)',
  General: 'linear-gradient(135deg, #7f7fd5, #86a8e7)',
};

function getAvatarGradient(techStack: string) {
  return techGradients[techStack] || techGradients['General'];
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

// ─── Animated stat bar ────────────────────────────────────────────────────
const StatBar: React.FC<{ label: string; value: number; color: string; delay: number }> = ({
  label,
  value,
  color,
  delay,
}) => (
  <div className="flex items-center gap-2" style={{ fontSize: 11 }}>
    <span style={{ color: '#888', fontWeight: 900, letterSpacing: 1, minWidth: 28, fontSize: 10 }}>
      {label}
    </span>
    <div
      style={{
        flex: 1,
        height: 6,
        background: 'rgba(255,255,255,0.07)',
        borderRadius: 4,
        overflow: 'hidden',
      }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.2, delay, ease: 'easeOut' }}
        style={{ height: '100%', background: color, borderRadius: 4 }}
      />
    </div>
    <span style={{ color: '#ccc', fontWeight: 700, minWidth: 24, textAlign: 'right', fontSize: 10 }}>
      {value}
    </span>
  </div>
);

// ─── Particle dots (epic/legendary) ──────────────────────────────────────
const Particles: React.FC = () => (
  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        style={{
          position: 'absolute',
          width: 3,
          height: 3,
          borderRadius: '50%',
          background: i % 3 === 0 ? '#ffd700' : i % 3 === 1 ? '#ff8c00' : '#fff',
          left: `${(i * 8.3) % 100}%`,
          bottom: 0,
          opacity: 0,
        }}
        animate={{
          y: [0, -120 - (i % 5) * 30],
          opacity: [0, 0.8, 0],
        }}
        transition={{
          duration: 3 + (i % 3),
          repeat: Infinity,
          delay: i * 0.4,
          ease: 'easeOut',
        }}
      />
    ))}
  </div>
);

// ─── Shimmer sweep ────────────────────────────────────────────────────────
const Shimmer: React.FC = () => (
  <motion.div
    style={{
      position: 'absolute',
      inset: 0,
      background:
        'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.07) 50%, transparent 60%)',
      pointerEvents: 'none',
    }}
    animate={{ x: ['-100%', '200%'] }}
    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
  />
);

// ─── Rainbow border for legendary ──────────────────────────────────────────
const RainbowBorder: React.FC = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
    style={{
      position: 'absolute',
      inset: -2,
      borderRadius: 20,
      background:
        'conic-gradient(from 0deg, #ff0080, #ff8c00, #40e0d0, #7b2ff7, #ff0080)',
      zIndex: -1,
    }}
  />
);

// ─── Star sparkles for legendary ─────────────────────────────────────────
const Stars: React.FC = () => (
  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        style={{
          position: 'absolute',
          color: ['#fff', '#ffd700', '#ff0080', '#40e0d0'][i % 4],
          fontSize: [8, 10, 12, 8][i % 4],
          left: `${10 + i * 11}%`,
          top: `${10 + ((i * 17) % 60)}%`,
        }}
        animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, delay: i * 0.35 }}
      >
        ✦
      </motion.div>
    ))}
  </div>
);

// ─── Main Card ───────────────────────────────────────────────────────────────
const StudentCard: React.FC<{ data: CardData; compact?: boolean }> = ({ data, compact = false }) => {
  const cfg = rarityConfig[data.cardRarity] || rarityConfig.common;
  const stats = [
    { label: 'PWR', value: data.stats.power },
    { label: 'SPD', value: data.stats.speed },
    { label: 'STK', value: data.stats.streak },
    { label: 'KNW', value: data.stats.knowledge },
  ];

  const xpPercent = Math.min(
    100,
    Math.round(((data.totalXpEarned % 100) / 100) * 100)
  );

  const scale = compact ? 0.72 : 1;

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        width: 400,
        marginBottom: compact ? -160 : 0,
      }}
    >
      <motion.div
        id="student-card"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
        style={{
          width: 400,
          minHeight: 560,
          borderRadius: 18,
          background: cfg.gradient,
          border: cfg.rainbow ? '3px solid transparent' : cfg.border,
          boxShadow: cfg.glow || '0 8px 40px rgba(0,0,0,0.6)',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: "'Inter', 'Outfit', sans-serif",
          color: '#fff',
          padding: '20px',
          boxSizing: 'border-box',
        }}
      >
        {/* Layered background effect */}
        {cfg.rainbow && <RainbowBorder />}
        {cfg.shimmer && <Shimmer />}
        {cfg.particles && <Particles />}
        {cfg.rainbow && <Stars />}

        {/* Inner card content (above effects) */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* ── Top bar: rarity + level ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 8,
                padding: '4px 10px',
                border: `1px solid ${cfg.badge === 'url(#rainbowGrad)' ? '#ff0080' : cfg.badge}`,
              }}
            >
              <span style={{ fontSize: 8, letterSpacing: 2, fontWeight: 900, color: cfg.badge === 'url(#rainbowGrad)' ? '#ff0080' : cfg.badge }}>
                ◆ {cfg.label}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: cfg.barColor, lineHeight: 1 }}>
                LV.{data.level}
              </div>
              <div style={{ fontSize: 8, color: '#666', letterSpacing: 1 }}>
                {data.xpToNextLevel} XP TO NEXT
              </div>
            </div>
          </div>

          {/* XP bar */}
          <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, marginBottom: 18, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
              style={{ height: '100%', background: cfg.barColor, borderRadius: 2 }}
            />
          </div>

          {/* ── Avatar ── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 180, delay: 0.2 }}
              style={{
                width: 84,
                height: 84,
                borderRadius: '50%',
                background: getAvatarGradient(data.techStack),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                fontWeight: 900,
                letterSpacing: -1,
                border: `3px solid ${cfg.badge === 'url(#rainbowGrad)' ? '#ff0080' : cfg.badge}`,
                boxShadow: `0 0 20px ${cfg.badge === 'url(#rainbowGrad)' ? 'rgba(255,0,128,0.4)' : `${cfg.badge}66`}`,
                marginBottom: 12,
                color: '#fff',
                textShadow: '0 2px 8px rgba(0,0,0,0.4)',
              }}
            >
              {getInitials(data.name)}
            </motion.div>

            <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: -0.5, marginBottom: 2 }}>
              {data.name}
            </div>
            <div style={{ color: '#888', fontSize: 12, fontStyle: 'italic', marginBottom: 6 }}>
              "{data.cardTitle}"
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 12 }}>
                {data.techStack === 'React' ? '⚛️' :
                 data.techStack === 'Python' ? '🐍' :
                 data.techStack === 'JavaScript' ? '✨' :
                 data.techStack === 'AI/ML' ? '🤖' :
                 data.techStack === 'Node.js' ? '🟢' :
                 data.techStack === 'Full Stack' ? '🚀' : '💡'}
              </span>
              <span style={{ fontSize: 11, color: '#aaa', fontWeight: 700 }}>{data.techStack} Developer</span>
            </div>
          </div>

          {/* ── Divider ── */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 14 }} />

          {/* ── Stats ── */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9, letterSpacing: 2, fontWeight: 900, color: '#555', marginBottom: 10 }}>
              STATS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stats.map((s, i) => (
                <StatBar key={s.label} label={s.label} value={s.value} color={cfg.barColor} delay={0.4 + i * 0.12} />
              ))}
            </div>
          </div>

          {/* ── Divider ── */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 14 }} />

          {/* ── Key metrics ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 11, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span>🔥 Streak: <strong>{data.streak} days</strong></span>
              <span>📊 Score: <strong>{data.consistencyScore} pts</strong></span>
              <span>🏆 Rank: <strong>#{data.rank} / {data.totalStudents}</strong></span>
            </div>
            {/* Rarity gem */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 60, height: 60, borderRadius: 12,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              fontSize: 28,
            }}>
              {data.cardRarity === 'legendary' ? '👑' :
               data.cardRarity === 'epic' ? '💎' :
               data.cardRarity === 'rare' ? '💜' :
               data.cardRarity === 'uncommon' ? '🔷' : '⬜'}
            </div>
          </div>

          {/* ── Badges ── */}
          {data.badges.length > 0 && (
            <>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 12 }} />
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
                {data.badges.slice(0, 3).map(badge => (
                  <span
                    key={badge.id}
                    style={{
                      fontSize: 9,
                      background: `${badge.color}22`,
                      border: `1px solid ${badge.color}55`,
                      color: badge.color,
                      padding: '3px 8px',
                      borderRadius: 20,
                      fontWeight: 700,
                      letterSpacing: 0.5,
                    }}
                  >
                    {badge.label}
                  </span>
                ))}
                {data.badges.length > 3 && (
                  <span style={{ fontSize: 9, color: '#666', padding: '3px 6px' }}>
                    +{data.badges.length - 3} more
                  </span>
                )}
              </div>
            </>
          )}

          {/* ── Branding watermark ── */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', marginBottom: 10 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 9, color: '#444', letterSpacing: 1.5, fontWeight: 700 }}>
              SIPP · ACADENO.COM
            </div>
            <div style={{ fontSize: 9, color: '#444' }}>
              {data.skillLevel?.toUpperCase()}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentCard;
