import { useState } from 'react';
import styles from './RightPanel.module.css';
import EventFeed from './EventFeed';
import DetailPanel from './DetailPanel';
import OverviewPanel from './OverviewPanel';

const TABS = ['OVERVIEW', 'EVENTS', 'DETAIL'];

export default function RightPanel({ incidents, selectedIncident, onSelect }) {
  const [tab, setTab] = useState('OVERVIEW');

  return (
    <div className={styles.panel}>
      <div className={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.active : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
            {t === 'EVENTS' && (
              <span className={styles.badge}>{incidents.length}</span>
            )}
          </button>
        ))}
      </div>
      <div className={styles.content}>
        {tab === 'OVERVIEW' && <OverviewPanel incidents={incidents} selectedIncident={selectedIncident} onSelect={onSelect} />}
        {tab === 'EVENTS'   && <EventFeed incidents={incidents} selectedId={selectedIncident?.id} onSelect={(inc) => { onSelect(inc); setTab('DETAIL'); }} />}
        {tab === 'DETAIL'   && <DetailPanel incident={selectedIncident} />}
      </div>
    </div>
  );
}
