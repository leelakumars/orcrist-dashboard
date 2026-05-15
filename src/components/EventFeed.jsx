import { useEffect, useRef } from 'react';
import styles from './EventFeed.module.css';
import { SEVERITY_META, TYPE_META } from '../data/mockData';

function formatTime(iso) {
  const d = new Date(iso);
  return d.toISOString().replace('T', ' ').slice(0, 16) + 'Z';
}

export default function EventFeed({ incidents, selectedId, onSelect }) {
  const listRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      const idx = incidents.findIndex(i => i.id === selectedId);
      if (e.key === 'j' && idx < incidents.length - 1) onSelect(incidents[idx + 1]);
      if (e.key === 'k' && idx > 0) onSelect(incidents[idx - 1]);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [incidents, selectedId, onSelect]);

  return (
    <div className={styles.feed}>
      <div className={styles.header}>
        <span>EVENTS</span>
        <span className={styles.count}>{incidents.length}</span>
        <span className={styles.hint}>J / K to step</span>
      </div>
      <div className={styles.list} ref={listRef}>
        {incidents.map(inc => {
          const sev = SEVERITY_META[inc.severity];
          const typ = TYPE_META[inc.type];
          const active = inc.id === selectedId;
          return (
            <button
              key={inc.id}
              className={`${styles.row} ${active ? styles.active : ''}`}
              onClick={() => onSelect(inc)}
            >
              <span className={styles.typeIcon} style={{ color: typ.color }}>{typ.icon}</span>
              <div className={styles.body}>
                <div className={styles.title}>{inc.title}</div>
                <div className={styles.meta}>
                  <span className={styles.source}>{inc.source}</span>
                  <span className={styles.ts}>{formatTime(inc.timestamp)}</span>
                </div>
              </div>
              <span className={styles.sevDot} style={{ background: sev.color }} title={sev.label} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
