import { useState, useEffect } from 'react';
import styles from './StatsBar.module.css';
import { INCIDENTS, ASSETS, CORRIDORS, SEVERITY_TREND } from '../data/mockData';

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

function Sparkline({ values, color }) {
  const w = 56, h = 20;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 2) - 1;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const trend = values[values.length - 1] > values[0];
  return (
    <svg width={w} height={h} className={styles.spark}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={(((values.length-1)/(values.length-1))*w).toFixed(1)} cy={(h - ((values[values.length-1]-min)/range)*(h-2)-1).toFixed(1)} r="2.5" fill={color} />
      <text x={w} y={h} textAnchor="end" fontSize="8" fill={color} fontFamily="monospace">
        {trend ? '▲' : '▼'}
      </text>
    </svg>
  );
}

export default function StatsBar({ filteredCount }) {
  const sessionTime = useSessionTime();
  const critical = INCIDENTS.filter(i => i.severity === 'CRITICAL').length;
  const high     = INCIDENTS.filter(i => i.severity === 'HIGH').length;
  const activeAssets = ASSETS.filter(a => a.status === 'ACTIVE').length;
  const degraded     = ASSETS.filter(a => a.status === 'DEGRADED').length;

  return (
    <div className={styles.bar}>

      <div className={styles.card}>
        <div className={styles.cardTop}>
          <span className={styles.cardIcon} style={{ color: 'var(--accent)' }}>—</span>
          <span className={styles.cardLabel}>CORRIDORS MONITORED</span>
        </div>
        <div className={styles.cardValue} style={{ color: 'var(--accent)' }}>{CORRIDORS.length}</div>
        <div className={styles.cardSub}>All active</div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTop}>
          <span className={styles.cardIcon} style={{ color: 'var(--text-primary)' }}>◎</span>
          <span className={styles.cardLabel}>TOTAL INCIDENTS</span>
        </div>
        <div className={styles.cardValue} style={{ color: 'var(--text-primary)' }}>{INCIDENTS.length}</div>
        <div className={styles.cardSub}>{filteredCount} in window</div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTop}>
          <span className={styles.cardIcon} style={{ color: critical > 0 ? 'var(--critical)' : 'var(--high)' }}>⚠</span>
          <span className={styles.cardLabel}>CRITICAL / HIGH</span>
        </div>
        <div className={styles.cardRow}>
          <div className={styles.cardValue} style={{ color: critical > 0 ? 'var(--critical)' : 'var(--high)' }}>
            {critical} / {high}
          </div>
          <Sparkline values={SEVERITY_TREND.CRITICAL} color={critical > 0 ? '#c0392b' : '#c0622b'} />
        </div>
        <div className={styles.cardSub}>7-day critical trend</div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTop}>
          <span className={styles.cardIcon} style={{ color: degraded > 0 ? 'var(--medium)' : 'var(--green)' }}>◈</span>
          <span className={styles.cardLabel}>ACTIVE ASSETS</span>
        </div>
        <div className={styles.cardValue} style={{ color: degraded > 0 ? 'var(--medium)' : 'var(--green)' }}>
          {activeAssets}
        </div>
        <div className={styles.cardSub}>{degraded > 0 ? `${degraded} degraded` : 'All nominal'}</div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTop}>
          <span className={styles.cardIcon} style={{ color: 'var(--text-secondary)' }}>◷</span>
          <span className={styles.cardLabel}>SESSION TIME</span>
        </div>
        <div className={`${styles.cardValue} ${styles.mono}`} style={{ color: 'var(--text-secondary)' }}>
          {sessionTime}
        </div>
        <div className={styles.cardSub}>2026-05-15 UTC</div>
      </div>

    </div>
  );
}
