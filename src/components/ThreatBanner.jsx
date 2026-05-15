import styles from './ThreatBanner.module.css';
import { INCIDENTS } from '../data/mockData';

const LEVELS = [
  { key: 'LOW',      color: '#3a8a5c', bg: 'rgba(58,138,92,0.08)',   label: 'LOW',      desc: 'Normal operations. No active critical incidents.' },
  { key: 'ELEVATED', color: '#b8860b', bg: 'rgba(184,134,11,0.08)',  label: 'ELEVATED', desc: 'Multiple high-severity incidents active. Increased vigilance.' },
  { key: 'HIGH',     color: '#c0622b', bg: 'rgba(192,98,43,0.08)',   label: 'HIGH',     desc: 'Critical incidents active. Assets on alert posture.' },
  { key: 'CRITICAL', color: '#c0392b', bg: 'rgba(192,57,43,0.1)',    label: 'CRITICAL', desc: 'Multiple critical incidents. Immediate response required.' },
];

function getThreatLevel() {
  const criticals = INCIDENTS.filter(i => i.severity === 'CRITICAL').length;
  const highs     = INCIDENTS.filter(i => i.severity === 'HIGH').length;
  if (criticals >= 3) return LEVELS[3];
  if (criticals >= 1) return LEVELS[2];
  if (highs >= 3)     return LEVELS[1];
  return LEVELS[0];
}

export default function ThreatBanner() {
  const level = getThreatLevel();

  return (
    <div className={styles.banner} style={{ background: level.bg, borderColor: level.color + '44' }}>
      <div className={styles.left}>
        <span className={styles.dot} style={{ background: level.color }} />
        <span className={styles.levelLabel}>THREAT LEVEL</span>
        <span className={styles.levelValue} style={{ color: level.color }}>{level.label}</span>
      </div>
      <span className={styles.desc}>{level.desc}</span>
      <div className={styles.bars}>
        {LEVELS.map((l, i) => (
          <div
            key={l.key}
            className={styles.bar}
            style={{
              background: l.color,
              opacity: LEVELS.indexOf(level) >= i ? 0.9 : 0.15,
            }}
          />
        ))}
      </div>
    </div>
  );
}
