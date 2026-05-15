import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import styles from './MapView.module.css';
import { CORRIDORS, INCIDENTS, ASSETS, SEVERITY_META, SEVERITY_WEIGHT } from '../data/mockData';

const TILE_STYLE = 'https://tiles.openfreemap.org/styles/dark';

const INCIDENTS_GEOJSON = {
  type: 'FeatureCollection',
  features: INCIDENTS.map(inc => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: inc.location },
    properties: {
      id: inc.id,
      severity: inc.severity,
      type: inc.type,
      title: inc.title,
      source: inc.source,
      weight: SEVERITY_WEIGHT[inc.severity],
      color: SEVERITY_META[inc.severity].color,
    },
  })),
};

function corridorPolygon(coords, widthDeg = 0.08) {
  const left = coords.map(([lng, lat]) => [lng - widthDeg * 0.6, lat + widthDeg]);
  const right = [...coords].reverse().map(([lng, lat]) => [lng + widthDeg * 0.6, lat - widthDeg]);
  return [...left, ...right, left[0]];
}

export default function MapView({ selectedIncident, layers, onSelectIncident }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const assetMarkersRef = useRef([]);
  const pulseMarkersRef = useRef([]);
  const popupRef = useRef(null);

  const clearAssetMarkers = useCallback(() => {
    assetMarkersRef.current.forEach(m => m.remove());
    assetMarkersRef.current = [];
  }, []);

  const clearPulseMarkers = useCallback(() => {
    pulseMarkersRef.current.forEach(m => m.remove());
    pulseMarkersRef.current = [];
  }, []);

  const addAssetMarkers = useCallback((map) => {
    if (!layers.assets) return;
    ASSETS.forEach(asset => {
      const isDegraded = asset.status === 'DEGRADED';
      const color = isDegraded ? '#F59E0B' : '#10B981';
      const el = document.createElement('div');
      el.style.cssText = `
        width:12px;height:12px;
        background:${color};
        border:2px solid ${color}99;
        border-radius:2px;
        transform:rotate(45deg);
        cursor:pointer;
        box-shadow:0 0 8px ${color}66;
      `;
      const popup = new maplibregl.Popup({ closeButton: false, offset: 12, className: 'sentinel-popup' })
        .setHTML(`
          <div style="font-size:12px;font-family:system-ui;color:#e2e8f0;padding:7px 10px;background:#181c22;border:1px solid #2a3140;border-radius:4px;min-width:150px">
            <div style="font-size:10px;font-weight:700;letter-spacing:0.08em;color:${color};margin-bottom:3px">${asset.type} · ${asset.status}</div>
            <div style="font-weight:600">${asset.name}</div>
          </div>
        `);
      el.addEventListener('mouseenter', () => popup.setLngLat(asset.location).addTo(map));
      el.addEventListener('mouseleave', () => popup.remove());
      const m = new maplibregl.Marker({ element: el }).setLngLat(asset.location).addTo(map);
      assetMarkersRef.current.push(m);
    });
  }, [layers.assets]);

  const addPulseMarker = useCallback((map, incident) => {
    const sev = SEVERITY_META[incident.severity];
    const el = document.createElement('div');
    el.className = styles.pulseWrap;
    el.innerHTML = `
      <div class="${styles.pulseRing}" style="border-color:${sev.color}"></div>
      <div class="${styles.pulseRing} ${styles.pulseRing2}" style="border-color:${sev.color}"></div>
      <div class="${styles.pulseDot}" style="background:${sev.color};box-shadow:0 0 12px ${sev.color}"></div>
    `;
    const m = new maplibregl.Marker({ element: el, anchor: 'center' })
      .setLngLat(incident.location)
      .addTo(map);
    pulseMarkersRef.current.push(m);
  }, []);

  useEffect(() => {
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: TILE_STYLE,
      center: [13.9, 52.1],
      zoom: 6.8,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    const popup = new maplibregl.Popup({ closeButton: false, className: 'sentinel-popup', offset: 8 });
    popupRef.current = popup;

    map.on('load', () => {
      // ── Corridor polygon fills ──────────────────────────────────────────
      CORRIDORS.forEach(c => {
        map.addSource(`${c.id}-poly`, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: { type: 'Polygon', coordinates: [corridorPolygon(c.coordinates)] },
          },
        });
        map.addLayer({
          id: `${c.id}-fill`,
          type: 'fill',
          source: `${c.id}-poly`,
          paint: { 'fill-color': c.color, 'fill-opacity': 0.07 },
        });
        map.addLayer({
          id: `${c.id}-outline`,
          type: 'line',
          source: `${c.id}-poly`,
          paint: { 'line-color': c.color, 'line-width': 1.5, 'line-opacity': 0.5 },
        });

        // Centre dashed line
        map.addSource(c.id, {
          type: 'geojson',
          data: { type: 'Feature', geometry: { type: 'LineString', coordinates: c.coordinates } },
        });
        map.addLayer({
          id: `${c.id}-line`,
          type: 'line',
          source: c.id,
          paint: {
            'line-color': c.color,
            'line-width': 2,
            'line-opacity': 0.9,
            'line-dasharray': [5, 3],
          },
        });
      });

      // ── Heatmap layer (behind clusters) ────────────────────────────────
      map.addSource('incidents-heat', {
        type: 'geojson',
        data: INCIDENTS_GEOJSON,
      });
      map.addLayer({
        id: 'incident-heat',
        type: 'heatmap',
        source: 'incidents-heat',
        maxzoom: 10,
        paint: {
          'heatmap-weight': ['get', 'weight'],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 5, 0.6, 10, 1.5],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 5, 30, 10, 50],
          'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0.7, 10, 0],
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0,   'rgba(0,0,0,0)',
            0.2, 'rgba(74,158,255,0.4)',
            0.4, 'rgba(245,158,11,0.6)',
            0.7, 'rgba(249,115,22,0.8)',
            1.0, 'rgba(239,68,68,1)',
          ],
        },
      });

      // ── Cluster source ──────────────────────────────────────────────────
      map.addSource('incidents', {
        type: 'geojson',
        data: INCIDENTS_GEOJSON,
        cluster: true,
        clusterMaxZoom: 9,
        clusterRadius: 52,
      });

      // Cluster circle
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'incidents',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step', ['get', 'point_count'],
            '#4A9EFF', 4,
            '#F97316', 8,
            '#EF4444',
          ],
          'circle-radius': ['step', ['get', 'point_count'], 20, 4, 28, 8, 36],
          'circle-opacity': 0.85,
          'circle-stroke-width': 2,
          'circle-stroke-color': [
            'step', ['get', 'point_count'],
            '#4A9EFF44', 4,
            '#F9731644', 8,
            '#EF444444',
          ],
        },
      });

      // Cluster label
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'incidents',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 13,
        },
        paint: { 'text-color': '#ffffff' },
      });

      // Individual unclustered points
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'incidents',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': [
            'match', ['get', 'severity'],
            'CRITICAL', 11, 'HIGH', 9, 'MEDIUM', 7, 6,
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': ['get', 'color'],
          'circle-opacity': 0.9,
          'circle-stroke-opacity': 0.4,
        },
      });

      // Click: expand cluster
      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0].properties.cluster_id;
        map.getSource('incidents').getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          map.easeTo({ center: features[0].geometry.coordinates, zoom });
        });
      });

      // Hover: show popup on unclustered
      map.on('mouseenter', 'unclustered-point', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        const props = e.features[0].properties;
        const sev = SEVERITY_META[props.severity];
        popup.setLngLat(e.features[0].geometry.coordinates)
          .setHTML(`
            <div style="font-size:12px;font-family:system-ui;color:#e2e8f0;padding:8px 10px;background:#181c22;border:1px solid #2a3140;border-radius:4px;min-width:160px">
              <div style="font-size:10px;font-weight:700;letter-spacing:0.08em;color:${sev.color};margin-bottom:3px">${sev.label} · ${props.type}</div>
              <div style="font-weight:600;font-size:13px;margin-bottom:2px">${props.title}</div>
              <div style="font-size:11px;color:#4A9EFF;font-weight:600">${props.source}</div>
              <div style="font-size:10px;color:#4a5568;font-family:monospace;margin-top:2px">${props.id.toUpperCase()}</div>
            </div>
          `)
          .addTo(map);
      });

      map.on('mouseleave', 'unclustered-point', () => {
        map.getCanvas().style.cursor = '';
        popup.remove();
      });

      // Click: select incident
      map.on('click', 'unclustered-point', (e) => {
        const props = e.features[0].properties;
        const inc = INCIDENTS.find(i => i.id === props.id);
        if (inc) onSelectIncident(inc);
      });

      map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = ''; });
    });

    mapRef.current = map;

    return () => {
      clearAssetMarkers();
      clearPulseMarkers();
      popup.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Assets layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const add = () => { clearAssetMarkers(); addAssetMarkers(map); };
    if (!map.isStyleLoaded()) map.once('load', add);
    else add();
  }, [layers.assets, addAssetMarkers, clearAssetMarkers]);

  // Fly to selected + pulse ring
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedIncident) return;
    clearPulseMarkers();
    const go = () => {
      map.flyTo({ center: selectedIncident.location, zoom: Math.max(map.getZoom(), 10), duration: 900, essential: true });
      addPulseMarker(map, selectedIncident);
    };
    if (!map.isStyleLoaded()) map.once('load', go);
    else go();
  }, [selectedIncident]);

  // Corridor visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const vis = layers.corridors ? 'visible' : 'none';
    CORRIDORS.forEach(c => {
      [`${c.id}-fill`, `${c.id}-outline`, `${c.id}-line`].forEach(lid => {
        if (map.getLayer(lid)) map.setLayoutProperty(lid, 'visibility', vis);
      });
    });
  }, [layers.corridors]);

  // Incident layer visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const vis = layers.incidents ? 'visible' : 'none';
    ['clusters','cluster-count','unclustered-point','incident-heat'].forEach(lid => {
      if (map.getLayer(lid)) map.setLayoutProperty(lid, 'visibility', vis);
    });
  }, [layers.incidents]);

  return <div ref={containerRef} className={styles.map} />;
}
