import { useState, useCallback } from 'react';
import styles from './App.module.css';
import TopBar from './components/TopBar';
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
  geofences: false,
};

export default function App() {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  const [timeRange, setTimeRange] = useState([0, 24]);

  const toggleLayer = useCallback((id) => {
    setLayers(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const filteredIncidents = INCIDENTS.filter(inc => {
    const d = new Date(inc.timestamp);
    const h = d.getUTCHours() + d.getUTCMinutes() / 60;
    return h >= timeRange[0] && h <= timeRange[1];
  });

  const handleSelect = useCallback((inc) => {
    setSelectedIncident(inc);
  }, []);

  return (
    <div className={styles.shell}>
      <TopBar isLive={true} />
      <StatsBar filteredCount={filteredIncidents.length} />

      <div className={styles.body}>

        {/* Left layer rail */}
        <aside className={styles.layerRail}>
          <LayerPanel layers={layers} onToggle={toggleLayer} />
        </aside>

        {/* Center: map top + table bottom */}
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

        {/* Right: tabbed panel */}
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
