import styles from './ThreatBanner.module.css';
import { INCIDENTS } from '../data/mockData';

const LEVELS = [
  { key: 'LOW',      color: '#10B981', bg: 'rgba(16,185,129,0.1)',  label: 'LOW',      desc: 'Normal operations. No active critical incidents.' },
  { key: 'ELEVATED', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', label: 'ELEVATED', desc: 'Multiple high-severity incidents active. Increased vigilance.' },
  { key: 'HIGH',     color: '#F97316', bg: 'rgba(249,115,22,0.1)', label: 'HIGH',     desc: 'Critical incidents active. Assets on alert posture.' },
  { key: 'CRITICAL', color: '#EF4444', bg: 'rgba(239,68,68,0.12)', label: 'CRITICAL', desc: 'Multiple critical incidents. Immediate response required.' },
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
