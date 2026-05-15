import { useState } from 'react';
import styles from './LayerPanel.module.css';
import { CORRIDORS } from '../data/mockData';

export default function LayerPanel({ layers, onToggle, onSearch }) {
  const [query, setQuery] = useState('');

  const layerDefs = [
    { id: 'incidents', label: 'INCIDENTS', icon: '⚠' },
    { id: 'assets',    label: 'ASSETS',    icon: '◈' },
    { id: 'corridors', label: 'CORRIDORS', icon: '—' },
    { id: 'geofences', label: 'GEOFENCES', icon: '⬡' },
  ];

  const handleSearch = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className={styles.panel}>

      {/* Search */}
      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}>⌕</span>
        <input
          className={styles.searchInput}
          placeholder="Search incidents..."
          value={query}
          onChange={handleSearch}
        />
        {query && (
          <button className={styles.clearBtn} onClick={clearSearch}>✕</button>
        )}
      </div>

      <div className={styles.divider} />

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
