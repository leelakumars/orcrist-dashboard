import styles from './LayerPanel.module.css';
import { CORRIDORS } from '../data/mockData';

export default function LayerPanel({ layers, onToggle }) {
  const layerDefs = [
    { id: 'incidents', label: 'INCIDENTS', icon: '⚠' },
    { id: 'assets',    label: 'ASSETS',    icon: '◈' },
    { id: 'corridors', label: 'CORRIDORS', icon: '—' },
    { id: 'geofences', label: 'GEOFENCES', icon: '⬡' },
  ];

  return (
    <div className={styles.panel}>
      <div className={styles.header}>LAYERS</div>
      {layerDefs.map(l => (
        <button
          key={l.id}
          className={`${styles.row} ${layers[l.id] ? styles.active : ''}`}
          onClick={() => onToggle(l.id)}
        >
          <span className={styles.icon}>{l.icon}</span>
          <span className={styles.label}>{l.label}</span>
          <span className={`${styles.toggle} ${layers[l.id] ? styles.on : ''}`} />
        </button>
      ))}
      <div className={styles.divider} />
      <div className={styles.header}>CORRIDORS</div>
      {CORRIDORS.map(c => (
        <div key={c.id} className={styles.corridorRow}>
          <span className={styles.swatch} style={{ background: c.color }} />
          <span className={styles.corridorName}>{c.name}</span>
        </div>
      ))}
    </div>
  );
}
