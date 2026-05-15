import { useState, useEffect } from 'react';
import styles from './StatsBar.module.css';
import { INCIDENTS, ASSETS, CORRIDORS } from '../data/mockData';

function useSessionTime() {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
  const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
  const s = String(elapsed % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function StatsBar({ filteredCount }) {
  const sessionTime = useSessionTime();
  const critical = INCIDENTS.filter(i => i.severity === 'CRITICAL').length;
  const high = INCIDENTS.filter(i => i.severity === 'HIGH').length;
  const activeAssets = ASSETS.filter(a => a.status === 'ACTIVE').length;
  const degraded = ASSETS.filter(a => a.status === 'DEGRADED').length;

  const cards = [
    {
      label: 'CORRIDORS MONITORED',
      value: CORRIDORS.length,
      sub: 'All active',
      color: 'var(--accent)',
      icon: '—',
    },
    {
      label: 'TOTAL INCIDENTS',
      value: INCIDENTS.length,
      sub: `${filteredCount} in window`,
      color: 'var(--text-primary)',
      icon: '◎',
    },
    {
      label: 'CRITICAL / HIGH',
      value: `${critical} / ${high}`,
      sub: 'Require attention',
      color: critical > 0 ? 'var(--critical)' : 'var(--high)',
      icon: '⚠',
    },
    {
      label: 'ACTIVE ASSETS',
      value: activeAssets,
      sub: degraded > 0 ? `${degraded} degraded` : 'All nominal',
      color: degraded > 0 ? 'var(--medium)' : 'var(--green)',
      icon: '◈',
    },
    {
      label: 'SESSION TIME',
      value: sessionTime,
      sub: '2026-05-15 UTC',
      color: 'var(--text-secondary)',
      icon: '◷',
      mono: true,
    },
  ];

  return (
    <div className={styles.bar}>
      {cards.map((card, i) => (
        <div key={i} className={styles.card}>
          <div className={styles.cardTop}>
            <span className={styles.cardIcon} style={{ color: card.color }}>{card.icon}</span>
            <span className={styles.cardLabel}>{card.label}</span>
          </div>
          <div className={`${styles.cardValue} ${card.mono ? styles.mono : ''}`} style={{ color: card.color }}>
            {card.value}
          </div>
          <div className={styles.cardSub}>{card.sub}</div>
        </div>
      ))}
    </div>
  );
}
