import { useState, useCallback } from 'react';
import styles from './App.module.css';
import TopBar from './components/TopBar';
import LayerPanel from './components/LayerPanel';
import MapView from './components/MapView';
import EventFeed from './components/EventFeed';
import DetailPanel from './components/DetailPanel';
import TimelineScrubber from './components/TimelineScrubber';
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

      <div className={styles.body}>
        <aside className={styles.layerRail}>
          <LayerPanel layers={layers} onToggle={toggleLayer} />
        </aside>

        <div className={styles.mapArea}>
          <MapView
            selectedIncident={selectedIncident}
            layers={layers}
            onSelectIncident={handleSelect}
          />
          <TimelineScrubber timeRange={timeRange} onTimeRangeChange={setTimeRange} />
        </div>

        <aside className={styles.rightPanel}>
          <div className={styles.feedArea}>
            <EventFeed
              incidents={filteredIncidents}
              selectedId={selectedIncident?.id}
              onSelect={handleSelect}
            />
          </div>
          <div className={styles.detailArea}>
            <DetailPanel incident={selectedIncident} />
          </div>
        </aside>
      </div>
    </div>
  );
}
