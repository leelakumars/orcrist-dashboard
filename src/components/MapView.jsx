import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import styles from './MapView.module.css';
import { CORRIDORS, INCIDENTS, ASSETS, GEOFENCES, ASSET_PATHS, SEVERITY_META, SEVERITY_WEIGHT } from '../data/mockData';

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

function corridorPolygon(coords, widthDeg = 0.18) {
  const left  = coords.map(([lng, lat]) => [lng - widthDeg * 0.55, lat + widthDeg]);
  const right = [...coords].reverse().map(([lng, lat]) => [lng + widthDeg * 0.55, lat - widthDeg]);
  return [...left, ...right, left[0]];
}

// Interpolate a position along a path given a 0–1 progress value
function interpolatePath(path, t) {
  const total = path.length - 1;
  const scaled = t * total;
  const i = Math.min(Math.floor(scaled), total - 1);
  const frac = scaled - i;
  const a = path[i], b = path[i + 1];
  return [a[0] + (b[0] - a[0]) * frac, a[1] + (b[1] - a[1]) * frac];
}

// Bearing between two points (degrees)
function bearing(a, b) {
  const dLng = b[0] - a[0];
  const dLat = b[1] - a[1];
  return (Math.atan2(dLng, dLat) * 180) / Math.PI;
}

export default function MapView({ selectedIncident, layers, onSelectIncident }) {
  const containerRef    = useRef(null);
  const mapRef          = useRef(null);
  const assetMarkersRef = useRef({});   // keyed by asset id
  const pulseMarkersRef = useRef([]);
  const animFrameRef    = useRef(null);
  const progressRef     = useRef({});   // keyed by asset id — 0 to 1
  const popupRef        = useRef(null);

  const clearPulseMarkers = useCallback(() => {
    pulseMarkersRef.current.forEach(m => m.remove());
    pulseMarkersRef.current = [];
  }, []);

  const addPulseMarker = useCallback((map, incident) => {
    const sev = SEVERITY_META[incident.severity];
    const el = document.createElement('div');
    el.className = styles.pulseWrap;
    el.innerHTML = `
      <div class="${styles.pulseRing}"  style="border-color:${sev.color}"></div>
      <div class="${styles.pulseRing} ${styles.pulseRing2}" style="border-color:${sev.color}"></div>
      <div class="${styles.pulseDot}"  style="background:${sev.color};box-shadow:0 0 14px ${sev.color}"></div>
    `;
    pulseMarkersRef.current.push(
      new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(incident.location)
        .addTo(map)
    );
  }, []);

  // Build or update a single animated asset marker
  const upsertAssetMarker = useCallback((map, asset, lngLat, rotateDeg) => {
    const isDegraded = asset.status === 'DEGRADED';
    const color = isDegraded ? '#F59E0B' : '#10B981';
    const isMoving = !!ASSET_PATHS[asset.id];

    if (!assetMarkersRef.current[asset.id]) {
      const el = document.createElement('div');
      el.dataset.assetId = asset.id;

      if (isMoving) {
        // Plane / arrow shape for moving assets
        el.style.cssText = `
          width:0; height:0;
          border-left:6px solid transparent;
          border-right:6px solid transparent;
          border-bottom:14px solid ${color};
          filter: drop-shadow(0 0 6px ${color}99);
          cursor:pointer;
          transform-origin: center bottom;
        `;
      } else {
        // Diamond for static / ground assets
        el.style.cssText = `
          width:14px; height:14px;
          background:${color};
          border:2px solid ${color}99;
          border-radius:2px;
          transform:rotate(45deg);
          cursor:pointer;
          box-shadow:0 0 10px ${color}88;
        `;
      }

      const popup = new maplibregl.Popup({ closeButton: false, offset: 14, className: 'sentinel-popup' })
        .setHTML(`
          <div style="font-size:12px;font-family:system-ui;color:#e2e8f0;padding:8px 10px;background:#181c22;border:1px solid #2a3140;border-radius:4px;min-width:150px">
            <div style="font-size:10px;font-weight:700;letter-spacing:0.08em;color:${color};margin-bottom:3px">${asset.type} · ${asset.status}</div>
            <div style="font-weight:600">${asset.name}</div>
          </div>
        `);
      el.addEventListener('mouseenter', () => popup.setLngLat(assetMarkersRef.current[asset.id].getLngLat()).addTo(map));
      el.addEventListener('mouseleave', () => popup.remove());

      assetMarkersRef.current[asset.id] = new maplibregl.Marker({ element: el, anchor: isMoving ? 'bottom' : 'center' })
        .setLngLat(lngLat)
        .addTo(map);
    } else {
      assetMarkersRef.current[asset.id].setLngLat(lngLat);
      if (isMoving) {
        const el = assetMarkersRef.current[asset.id].getElement();
        el.style.transform = `rotate(${rotateDeg}deg)`;
      }
    }
  }, []);

  const clearAssetMarkers = useCallback(() => {
    Object.values(assetMarkersRef.current).forEach(m => m.remove());
    assetMarkersRef.current = {};
  }, []);

  // Animation loop — moves UAVs along their paths every frame
  const startAnimation = useCallback((map) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    // Initialise progress for moving assets
    ASSETS.forEach(asset => {
      if (ASSET_PATHS[asset.id] && progressRef.current[asset.id] === undefined) {
        progressRef.current[asset.id] = Math.random(); // stagger start positions
      }
    });

    const tick = () => {
      ASSETS.forEach(asset => {
        const pathDef = ASSET_PATHS[asset.id];
        if (!layers.assets) return;

        if (pathDef) {
          // Advance progress, loop back to 0
          progressRef.current[asset.id] = (progressRef.current[asset.id] + pathDef.speed) % 1;
          const t = progressRef.current[asset.id];
          const lngLat = interpolatePath(pathDef.path, t);

          // Bearing for rotation
          const t2 = Math.min(t + 0.01, 1);
          const next = interpolatePath(pathDef.path, t2);
          const rot = bearing(lngLat, next);

          upsertAssetMarker(map, asset, lngLat, rot);
        } else {
          // Static asset — just place once
          if (!assetMarkersRef.current[asset.id]) {
            upsertAssetMarker(map, asset, asset.location, 0);
          }
        }
      });

      animFrameRef.current = requestAnimationFrame(tick);
    };

    tick();
  }, [layers.assets, upsertAssetMarker]);

  useEffect(() => {
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: TILE_STYLE,
      center: [13.9, 52.1],
      zoom: 6.5,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    const popup = new maplibregl.Popup({ closeButton: false, className: 'sentinel-popup', offset: 8 });
    popupRef.current = popup;

    map.on('load', () => {

      // ── Corridor polygon fills ──────────────────────────────────────────
      CORRIDORS.forEach(c => {
        map.addSource(`${c.id}-poly`, {
          type: 'geojson',
          data: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [corridorPolygon(c.coordinates)] } },
        });
        map.addLayer({ id:`${c.id}-fill`,    type:'fill', source:`${c.id}-poly`, paint:{ 'fill-color':c.color, 'fill-opacity':0.1 } });
        map.addLayer({ id:`${c.id}-outline`, type:'line', source:`${c.id}-poly`, paint:{ 'line-color':c.color, 'line-width':1.5, 'line-opacity':0.55 } });

        map.addSource(c.id, {
          type: 'geojson',
          data: { type: 'Feature', geometry: { type: 'LineString', coordinates: c.coordinates } },
        });
        map.addLayer({ id:`${c.id}-line`, type:'line', source:c.id, paint:{ 'line-color':c.color, 'line-width':2.5, 'line-opacity':0.95, 'line-dasharray':[5,3] } });

        // ── Corridor name label at midpoint ─────────────────────────────
        const mid = c.coordinates[Math.floor(c.coordinates.length / 2)];
        map.addSource(`${c.id}-label`, {
          type: 'geojson',
          data: { type: 'Feature', geometry: { type: 'Point', coordinates: mid }, properties: { name: c.name.toUpperCase() } },
        });
        map.addLayer({
          id: `${c.id}-label`,
          type: 'symbol',
          source: `${c.id}-label`,
          layout: {
            'text-field': ['get', 'name'],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 11,
            'text-letter-spacing': 0.15,
            'text-offset': [0, -2.2],
            'text-anchor': 'bottom',
          },
          paint: {
            'text-color': c.color,
            'text-halo-color': 'rgba(0,0,0,0.8)',
            'text-halo-width': 2,
            'text-opacity': 0.9,
          },
        });
      });

      // ── Geofence zones ──────────────────────────────────────────────────
      GEOFENCES.forEach(gf => {
        map.addSource(gf.id, {
          type: 'geojson',
          data: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [gf.coordinates] }, properties: { label: gf.label } },
        });
        map.addLayer({
          id: `${gf.id}-fill`,
          type: 'fill',
          source: gf.id,
          paint: { 'fill-color': gf.color, 'fill-opacity': 0.08 },
          layout: { visibility: 'visible' },
        });
        map.addLayer({
          id: `${gf.id}-border`,
          type: 'line',
          source: gf.id,
          paint: { 'line-color': gf.color, 'line-width': 1.5, 'line-opacity': 0.7, 'line-dasharray': [3, 2] },
          layout: { visibility: 'visible' },
        });
        // Label at centroid (approximate)
        const lngs = gf.coordinates.map(c => c[0]);
        const lats = gf.coordinates.map(c => c[1]);
        const cx = (Math.min(...lngs) + Math.max(...lngs)) / 2;
        const cy = (Math.min(...lats) + Math.max(...lats)) / 2;
        map.addSource(`${gf.id}-label`, {
          type: 'geojson',
          data: { type: 'Feature', geometry: { type: 'Point', coordinates: [cx, cy] }, properties: { label: gf.label } },
        });
        map.addLayer({
          id: `${gf.id}-label`,
          type: 'symbol',
          source: `${gf.id}-label`,
          layout: {
            'text-field': ['get', 'label'],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 10,
            'text-letter-spacing': 0.1,
          },
          paint: {
            'text-color': gf.color,
            'text-halo-color': 'rgba(0,0,0,0.85)',
            'text-halo-width': 2,
            'text-opacity': 0.8,
          },
        });
      });

      // ── Heatmap ─────────────────────────────────────────────────────────
      map.addSource('incidents-heat', { type:'geojson', data:INCIDENTS_GEOJSON });
      map.addLayer({
        id: 'incident-heat',
        type: 'heatmap',
        source: 'incidents-heat',
        maxzoom: 11,
        paint: {
          'heatmap-weight': ['get', 'weight'],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 4, 1, 9, 3],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 4, 40, 9, 80],
          'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0.85, 9, 0.6, 11, 0],
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0,    'rgba(0,0,0,0)',
            0.15, 'rgba(14,30,60,0.6)',
            0.35, 'rgba(74,158,255,0.55)',
            0.55, 'rgba(245,158,11,0.75)',
            0.75, 'rgba(249,115,22,0.9)',
            1.0,  'rgba(239,68,68,1)',
          ],
        },
      });

      // ── Cluster source ───────────────────────────────────────────────────
      map.addSource('incidents', { type:'geojson', data:INCIDENTS_GEOJSON, cluster:true, clusterMaxZoom:9, clusterRadius:55 });

      map.addLayer({
        id: 'cluster-halo', type:'circle', source:'incidents', filter:['has','point_count'],
        paint: {
          'circle-color': ['step',['get','point_count'],'#4A9EFF',5,'#F97316',10,'#EF4444'],
          'circle-radius': ['step',['get','point_count'],30,5,40,10,50],
          'circle-opacity': 0.18,
        },
      });
      map.addLayer({
        id: 'clusters', type:'circle', source:'incidents', filter:['has','point_count'],
        paint: {
          'circle-color': ['step',['get','point_count'],'#4A9EFF',5,'#F97316',10,'#EF4444'],
          'circle-radius': ['step',['get','point_count'],20,5,28,10,36],
          'circle-opacity': 0.9,
          'circle-stroke-width': 2,
          'circle-stroke-color': ['step',['get','point_count'],'#4A9EFF',5,'#F97316',10,'#EF4444'],
          'circle-stroke-opacity': 0.4,
        },
      });
      map.addLayer({
        id: 'cluster-count', type:'symbol', source:'incidents', filter:['has','point_count'],
        layout: { 'text-field':'{point_count_abbreviated}', 'text-font':['Open Sans Bold','Arial Unicode MS Bold'], 'text-size':14 },
        paint: { 'text-color':'#ffffff' },
      });
      map.addLayer({
        id: 'unclustered-glow', type:'circle', source:'incidents', filter:['!',['has','point_count']],
        paint: {
          'circle-color': ['get','color'],
          'circle-radius': ['match',['get','severity'],'CRITICAL',22,'HIGH',18,'MEDIUM',14,11],
          'circle-opacity': 0.15,
        },
      });
      map.addLayer({
        id: 'unclustered-point', type:'circle', source:'incidents', filter:['!',['has','point_count']],
        paint: {
          'circle-color': ['get','color'],
          'circle-radius': ['match',['get','severity'],'CRITICAL',12,'HIGH',10,'MEDIUM',8,6],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-opacity': 0.3,
          'circle-opacity': 0.95,
        },
      });

      // Cluster click expand
      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers:['clusters'] });
        const clusterId = features[0].properties.cluster_id;
        map.getSource('incidents').getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          map.easeTo({ center:features[0].geometry.coordinates, zoom:zoom+0.5 });
        });
      });

      map.on('mouseenter', 'unclustered-point', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        const props = e.features[0].properties;
        const sev = SEVERITY_META[props.severity];
        popup.setLngLat(e.features[0].geometry.coordinates).setHTML(`
          <div style="font-size:12px;font-family:system-ui;color:#e2e8f0;padding:8px 10px;background:#181c22;border:1px solid #2a3140;border-radius:4px;min-width:170px">
            <div style="font-size:10px;font-weight:700;letter-spacing:0.08em;color:${sev.color};margin-bottom:4px">${sev.label} · ${props.type}</div>
            <div style="font-weight:600;font-size:13px;margin-bottom:3px">${props.title}</div>
            <div style="font-size:11px;color:#4A9EFF;font-weight:600;margin-bottom:2px">${props.source}</div>
            <div style="font-size:10px;color:#4a5568;font-family:monospace">${props.id.toUpperCase()}</div>
          </div>
        `).addTo(map);
      });
      map.on('mouseleave', 'unclustered-point', () => { map.getCanvas().style.cursor=''; popup.remove(); });
      map.on('click', 'unclustered-point', (e) => {
        e.preventDefault();
        const inc = INCIDENTS.find(i => i.id === e.features[0].properties.id);
        if (inc) onSelectIncident(inc);
      });
      map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor='pointer'; });
      map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor=''; });
    });

    mapRef.current = map;

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      clearAssetMarkers();
      clearPulseMarkers();
      popup.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Start/restart animation when map loads or layers change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!map.isStyleLoaded()) { map.once('load', () => startAnimation(map)); return; }
    if (!layers.assets) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      clearAssetMarkers();
      return;
    }
    startAnimation(map);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [layers.assets, startAnimation, clearAssetMarkers]);

  // Fly + pulse on selection
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedIncident) return;
    clearPulseMarkers();
    const go = () => {
      map.flyTo({ center:selectedIncident.location, zoom:Math.max(map.getZoom(), 10), duration:900, essential:true });
      addPulseMarker(map, selectedIncident);
    };
    if (!map.isStyleLoaded()) map.once('load', go); else go();
  }, [selectedIncident]);

  // Corridor visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const vis = layers.corridors ? 'visible' : 'none';
    CORRIDORS.forEach(c => {
      [`${c.id}-fill`,`${c.id}-outline`,`${c.id}-line`,`${c.id}-label`].forEach(lid => {
        if (map.getLayer(lid)) map.setLayoutProperty(lid, 'visibility', vis);
      });
    });
  }, [layers.corridors]);

  // Incident visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const vis = layers.incidents ? 'visible' : 'none';
    ['cluster-halo','clusters','cluster-count','unclustered-glow','unclustered-point','incident-heat'].forEach(lid => {
      if (map.getLayer(lid)) map.setLayoutProperty(lid, 'visibility', vis);
    });
  }, [layers.incidents]);

  // Geofence visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const vis = layers.geofences ? 'visible' : 'none';
    GEOFENCES.forEach(gf => {
      [`${gf.id}-fill`,`${gf.id}-border`,`${gf.id}-label`].forEach(lid => {
        if (map.getLayer(lid)) map.setLayoutProperty(lid, 'visibility', vis);
      });
    });
  }, [layers.geofences]);

  return <div ref={containerRef} className={styles.map} />;
}
