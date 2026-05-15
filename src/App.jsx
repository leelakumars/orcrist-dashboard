import { useState, useCallback } from 'react';
import styles from './App.module.css';
import TopBar from './components/TopBar';
import AlertTicker from './components/AlertTicker';
import ThreatBanner from './components/ThreatBanner';
import StatsBar from './components/StatsBar';
import LayerPanel from './components/LayerPanel';
import MapView from './components/MapView';
import TimelineScrubber from './components/TimelineScrubber';
import IncidentTable from './components/IncidentTable';
import RightPanel from './components/RightPanel';
import { INCIDENTS } from './data/mockData';

const DEFAULT_LAYERS = {
  incidents: true,
  assets: true,
  corridors: true,
  geofences: true,
};

export default function App() {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  const [timeRange, setTimeRange] = useState([0, 24]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleLayer = useCallback((id) => {
    setLayers(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const filteredIncidents = INCIDENTS.filter(inc => {
    const d = new Date(inc.timestamp);
    const h = d.getUTCHours() + d.getUTCMinutes() / 60;
    const inWindow = h >= timeRange[0] && h <= timeRange[1];
    if (!inWindow) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      inc.title.toLowerCase().includes(q) ||
      inc.source.toLowerCase().includes(q) ||
      inc.type.toLowerCase().includes(q) ||
      inc.severity.toLowerCase().includes(q) ||
      inc.analyst.toLowerCase().includes(q) ||
      inc.id.toLowerCase().includes(q)
    );
  });

  const handleSelect = useCallback((inc) => {
    setSelectedIncident(inc);
  }, []);

  return (
    <div className={styles.shell}>
      <TopBar isLive={true} />
      <AlertTicker />
      <ThreatBanner />
      <StatsBar filteredCount={filteredIncidents.length} />

      <div className={styles.body}>
        <aside className={styles.layerRail}>
          <LayerPanel layers={layers} onToggle={toggleLayer} onSearch={setSearchQuery} />
        </aside>

        <div className={styles.center}>
          <div className={styles.mapArea}>
            <MapView
              selectedIncident={selectedIncident}
              layers={layers}
              onSelectIncident={handleSelect}
            />
            <TimelineScrubber timeRange={timeRange} onTimeRangeChange={setTimeRange} />
          </div>
          <div className={styles.tableArea}>
            <IncidentTable
              incidents={filteredIncidents}
              selectedId={selectedIncident?.id}
              onSelect={handleSelect}
            />
          </div>
        </div>

        <aside className={styles.rightPanel}>
          <RightPanel
            incidents={filteredIncidents}
            selectedIncident={selectedIncident}
            onSelect={handleSelect}
          />
        </aside>
      </div>
    </div>
  );
}
