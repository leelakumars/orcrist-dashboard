import styles from './OverviewPanel.module.css';
import { INCIDENTS, ASSETS, CORRIDORS, SEVERITY_META, TYPE_META } from '../data/mockData';

function MiniBarChart({ data, title }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className={styles.chart}>
      <div className={styles.chartTitle}>{title}</div>
      <div className={styles.bars}>
        {data.map((d, i) => (
          <div key={i} className={styles.barRow}>
            <span className={styles.barLabel}>{d.label}</span>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{ width: `${(d.value / max) * 100}%`, background: d.color }}
              />
            </div>
            <span className={styles.barValue}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SparkLine({ values, color }) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 80, h = 28;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} className={styles.spark}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export default function OverviewPanel({ incidents, selectedIncident, onSelect }) {
  const sevData = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(s => ({
    label: s,
    value: INCIDENTS.filter(i => i.severity === s).length,
    color: SEVERITY_META[s].color,
  }));

  const typeData = ['MOVEMENT', 'ANOMALY', 'REPORT'].map(t => ({
    label: t,
    value: INCIDENTS.filter(i => i.type === t).length,
    color: TYPE_META[t].color,
  }));

  const corridorData = CORRIDORS.map(c => ({
    label: c.name.replace('Corridor ', ''),
    value: INCIDENTS.filter(i => i.corridor === c.id).length,
    color: c.color,
  }));

  const hourlyActivity = Array.from({ length: 8 }, (_, i) => {
    const startH = i * 3;
    return INCIDENTS.filter(inc => {
      const h = new Date(inc.timestamp).getUTCHours();
      return h >= startH && h < startH + 3;
    }).length;
  });

  const recentIncidents = [...INCIDENTS]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 3);

  return (
    <div className={styles.panel}>

      {/* Hourly activity */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>ACTIVITY — LAST 24H</div>
        <div className={styles.hourlyBars}>
          {hourlyActivity.map((count, i) => (
            <div key={i} className={styles.hourCol}>
              <div
                className={styles.hourBar}
                style={{ height: `${Math.max((count / Math.max(...hourlyActivity, 1)) * 48, 4)}px` }}
                title={`${i * 3}:00–${i * 3 + 3}:00`}
              />
              <span className={styles.hourTick}>{String(i * 3).padStart(2, '0')}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.divider} />

      <MiniBarChart data={sevData} title="BY SEVERITY" />

      <div className={styles.divider} />

      <MiniBarChart data={typeData} title="BY TYPE" />

      <div className={styles.divider} />

      <MiniBarChart data={corridorData} title="BY CORRIDOR" />

      <div className={styles.divider} />

      {/* Asset status */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>ASSET STATUS</div>
        {ASSETS.map(a => (
          <div key={a.id} className={styles.assetRow}>
            <span
              className={styles.assetDot}
              style={{ background: a.status === 'ACTIVE' ? 'var(--green)' : 'var(--medium)' }}
            />
            <span className={styles.assetName}>{a.name}</span>
            <span
              className={styles.assetStatus}
              style={{ color: a.status === 'ACTIVE' ? 'var(--green)' : 'var(--medium)' }}
            >
              {a.status}
            </span>
          </div>
        ))}
      </div>

      <div className={styles.divider} />

      {/* Most recent */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>MOST RECENT</div>
        {recentIncidents.map(inc => {
          const sev = SEVERITY_META[inc.severity];
          return (
            <button key={inc.id} className={styles.recentRow} onClick={() => onSelect(inc)}>
              <span className={styles.recentDot} style={{ background: sev.color }} />
              <span className={styles.recentTitle}>{inc.title}</span>
              <span className={styles.recentSev} style={{ color: sev.color }}>{inc.severity}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
