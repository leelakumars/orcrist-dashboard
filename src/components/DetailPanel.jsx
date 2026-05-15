import styles from './DetailPanel.module.css';
import { SEVERITY_META, TYPE_META, INCIDENTS } from '../data/mockData';

function formatTime(iso) {
  return new Date(iso).toISOString().replace('T', ' ').slice(0, 19) + 'Z';
}

export default function DetailPanel({ incident }) {
  if (!incident) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>◈</span>
        <span>Select an event to inspect</span>
      </div>
    );
  }

  const sev = SEVERITY_META[incident.severity];
  const typ = TYPE_META[incident.type];
  const linked = incident.linked
    .map(id => INCIDENTS.find(i => i.id === id))
    .filter(Boolean);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.typeTag} style={{ color: typ.color }}>{typ.icon} {incident.type}</span>
        <span className={styles.sevBadge} style={{ background: sev.color + '22', color: sev.color }}>
          {sev.label}
        </span>
      </div>

      <div className={styles.title}>{incident.title}</div>
      <div className={styles.id}>{incident.id.toUpperCase()}</div>

      <div className={styles.section}>
        <div className={styles.row}>
          <span className={styles.key}>SOURCE</span>
          <span className={styles.val} style={{ color: 'var(--accent)' }}>{incident.source}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.key}>ANALYST</span>
          <span className={styles.val}>{incident.analyst}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.key}>TIME</span>
          <span className={`${styles.val} ${styles.mono}`}>{formatTime(incident.timestamp)}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.key}>COORDS</span>
          <span className={`${styles.val} ${styles.mono}`}>
            {incident.location[1].toFixed(4)}°N {incident.location[0].toFixed(4)}°E
          </span>
        </div>
        <div className={styles.row}>
          <span className={styles.key}>CORRIDOR</span>
          <span className={styles.val}>{incident.corridor.replace('corridor-', '').toUpperCase()}</span>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.sectionLabel}>DESCRIPTION</div>
      <p className={styles.description}>{incident.description}</p>

      {linked.length > 0 && (
        <>
          <div className={styles.divider} />
          <div className={styles.sectionLabel}>LINKED OBJECTS ({linked.length})</div>
          {linked.map(l => (
            <div key={l.id} className={styles.linkedRow}>
              <span className={styles.linkedIcon} style={{ color: TYPE_META[l.type]?.color }}>
                {TYPE_META[l.type]?.icon}
              </span>
              <span className={styles.linkedTitle}>{l.title}</span>
              <span className={styles.linkedId}>{l.id.toUpperCase()}</span>
            </div>
          ))}
        </>
      )}

      <div className={styles.divider} />
      <button className={styles.actionBtn}>+ ADD TO INVESTIGATION</button>
    </div>
  );
}
