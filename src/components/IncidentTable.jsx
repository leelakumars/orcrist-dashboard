import styles from './IncidentTable.module.css';
import { SEVERITY_META, TYPE_META } from '../data/mockData';

function fmt(iso) {
  return new Date(iso).toISOString().replace('T', ' ').slice(0, 16) + 'Z';
}

const COLS = ['ID', 'TYPE', 'TITLE', 'SEVERITY', 'SOURCE', 'CORRIDOR', 'ANALYST', 'TIMESTAMP', 'LINKED'];

export default function IncidentTable({ incidents, selectedId, onSelect }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.title}>INCIDENT LOG</span>
        <span className={styles.count}>{incidents.length} records</span>
        <div className={styles.actions}>
          <button className={styles.btn}>↓ EXPORT</button>
          <button className={styles.btn}>⚙ FILTER</button>
        </div>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {COLS.map(c => <th key={c}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {incidents.map(inc => {
              const sev = SEVERITY_META[inc.severity];
              const typ = TYPE_META[inc.type];
              const active = inc.id === selectedId;
              return (
                <tr
                  key={inc.id}
                  className={active ? styles.active : ''}
                  onClick={() => onSelect(inc)}
                >
                  <td className={styles.mono}>{inc.id.toUpperCase()}</td>
                  <td>
                    <span className={styles.typeChip} style={{ color: typ.color }}>
                      {typ.icon} {inc.type}
                    </span>
                  </td>
                  <td className={styles.titleCell}>{inc.title}</td>
                  <td>
                    <span className={styles.sevChip} style={{ background: sev.color + '22', color: sev.color }}>
                      {sev.label}
                    </span>
                  </td>
                  <td className={styles.sourceCell}>{inc.source}</td>
                  <td>{inc.corridor.replace('corridor-', '').toUpperCase()}</td>
                  <td>{inc.analyst}</td>
                  <td className={styles.mono}>{fmt(inc.timestamp)}</td>
                  <td>
                    <span className={styles.linkedBadge}>{inc.linked.length}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
