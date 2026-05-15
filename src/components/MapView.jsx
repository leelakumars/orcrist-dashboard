import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import styles from './MapView.module.css';
import { CORRIDORS, INCIDENTS, ASSETS, SEVERITY_META, TYPE_META } from '../data/mockData';

const TILE_STYLE = 'https://tiles.openfreemap.org/styles/dark';

function severityToSize(sev) {
  return { CRITICAL: 14, HIGH: 11, MEDIUM: 9, LOW: 7 }[sev] ?? 9;
}

export default function MapView({ selectedIncident, layers, onSelectIncident }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
  }, []);

  const renderMarkers = useCallback(() => {
    if (!mapRef.current) return;
    clearMarkers();

    if (layers.incidents) {
      INCIDENTS.forEach(inc => {
        const sev = SEVERITY_META[inc.severity];
        const typ = TYPE_META[inc.type];
        const el = document.createElement('div');
        const size = severityToSize(inc.severity);
        const isSelected = selectedIncident?.id === inc.id;

        el.style.cssText = `
          width: ${size + (isSelected ? 6 : 0)}px;
          height: ${size + (isSelected ? 6 : 0)}px;
          border-radius: 50%;
          background: ${sev.color};
          border: 2px solid ${isSelected ? '#fff' : sev.color + '88'};
          box-shadow: 0 0 ${isSelected ? 12 : 6}px ${sev.color}88;
          cursor: pointer;
          transition: all 0.15s;
        `;
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelectIncident(inc);
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(inc.location)
          .addTo(mapRef.current);

        const popup = new maplibregl.Popup({
          closeButton: false,
          closeOnClick: false,
          className: 'sentinel-popup',
          offset: 12,
        }).setHTML(`
          <div style="font-size:11px;font-family:system-ui;color:#e2e8f0;padding:6px 8px;background:#181c22;border:1px solid #2a3140;border-radius:4px;min-width:140px">
            <div style="font-size:9px;font-weight:700;letter-spacing:0.1em;color:${sev.color};margin-bottom:3px">${sev.label} · ${inc.type}</div>
            <div style="font-weight:600;margin-bottom:2px">${inc.title}</div>
            <div style="font-size:10px;color:#8899aa;font-family:monospace">${inc.id.toUpperCase()}</div>
          </div>
        `);

        el.addEventListener('mouseenter', () => popup.setLngLat(inc.location).addTo(mapRef.current));
        el.addEventListener('mouseleave', () => popup.remove());

        markersRef.current.push(marker);
      });
    }

    if (layers.assets) {
      ASSETS.forEach(asset => {
        const el = document.createElement('div');
        const isDegraded = asset.status === 'DEGRADED';
        el.style.cssText = `
          width: 10px; height: 10px;
          background: ${isDegraded ? '#F59E0B' : '#10B981'};
          border: 2px solid ${isDegraded ? '#F59E0B88' : '#10B98188'};
          border-radius: 2px;
          transform: rotate(45deg);
          cursor: default;
        `;
        const m = new maplibregl.Marker({ element: el })
          .setLngLat(asset.location)
          .setPopup(new maplibregl.Popup({ closeButton: false, offset: 10 })
            .setHTML(`<div style="font-size:11px;color:#e2e8f0;background:#181c22;padding:5px 8px;border:1px solid #2a3140;border-radius:4px"><b>${asset.name}</b><br/><span style="font-size:10px;color:#8899aa">${asset.type} · ${asset.status}</span></div>`))
          .addTo(mapRef.current);
        markersRef.current.push(m);
      });
    }
  }, [layers, selectedIncident, onSelectIncident, clearMarkers]);

  useEffect(() => {
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: TILE_STYLE,
      center: [13.9, 52.2],
      zoom: 7.5,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    map.on('load', () => {
      CORRIDORS.forEach(corridor => {
        map.addSource(corridor.id, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: corridor.coordinates },
          },
        });
        map.addLayer({
          id: `${corridor.id}-glow`,
          type: 'line',
          source: corridor.id,
          paint: {
            'line-color': corridor.color,
            'line-width': 8,
            'line-opacity': 0.15,
          },
        });
        map.addLayer({
          id: corridor.id,
          type: 'line',
          source: corridor.id,
          paint: {
            'line-color': corridor.color,
            'line-width': 2,
            'line-opacity': 0.9,
            'line-dasharray': [4, 2],
          },
        });
      });
    });

    mapRef.current = map;

    return () => {
      clearMarkers();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!map.isStyleLoaded()) {
      map.once('load', renderMarkers);
    } else {
      renderMarkers();
    }
  }, [renderMarkers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedIncident) return;
    map.flyTo({
      center: selectedIncident.location,
      zoom: Math.max(map.getZoom(), 9),
      duration: 800,
      essential: true,
    });
  }, [selectedIncident]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    CORRIDORS.forEach(c => {
      if (map.getLayer(c.id)) {
        map.setLayoutProperty(c.id, 'visibility', layers.corridors ? 'visible' : 'none');
        map.setLayoutProperty(`${c.id}-glow`, 'visibility', layers.corridors ? 'visible' : 'none');
      }
    });
  }, [layers.corridors]);

  return <div ref={containerRef} className={styles.map} />;
}
