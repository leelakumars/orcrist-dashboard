import { useState } from 'react';
import styles from './TimelineScrubber.module.css';
import { INCIDENTS } from '../data/mockData';

const START_HOUR = 0;
const END_HOUR = 24;

function hourLabel(h) {
  return String(h).padStart(2, '0') + ':00';
}

export default function TimelineScrubber({ timeRange, onTimeRangeChange }) {
  const [dragging, setDragging] = useState(null);

  const pct = (h) => ((h - START_HOUR) / (END_HOUR - START_HOUR)) * 100;

  const eventHours = INCIDENTS.map(i => {
    const d = new Date(i.timestamp);
    return d.getUTCHours() + d.getUTCMinutes() / 60;
  });

  const handleTrackClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const hour = START_HOUR + x * (END_HOUR - START_HOUR);
    const mid = (timeRange[0] + timeRange[1]) / 2;
    if (Math.abs(hour - timeRange[0]) < Math.abs(hour - timeRange[1])) {
      onTimeRangeChange([Math.min(hour, timeRange[1] - 1), timeRange[1]]);
    } else {
      onTimeRangeChange([timeRange[0], Math.max(hour, timeRange[0] + 1)]);
    }
  };

  const hours = [0, 4, 8, 12, 16, 20, 24];

  return (
    <div className={styles.container}>
      <div className={styles.label}>TIMELINE · 2026-05-15 UTC</div>
      <div className={styles.track} onClick={handleTrackClick}>
        <div
          className={styles.selection}
          style={{
            left: `${pct(timeRange[0])}%`,
            width: `${pct(timeRange[1]) - pct(timeRange[0])}%`,
          }}
        />
        {eventHours.map((h, i) => (
          <div
            key={i}
            className={styles.eventTick}
            style={{ left: `${pct(h)}%` }}
          />
        ))}
        {hours.map(h => (
          <div
            key={h}
            className={styles.hourMark}
            style={{ left: `${pct(h)}%` }}
          />
        ))}
      </div>
      <div className={styles.labels}>
        {hours.map(h => (
          <span
            key={h}
            className={styles.hourLabel}
            style={{ left: `${pct(h)}%` }}
          >
            {hourLabel(h)}
          </span>
        ))}
      </div>
      <div className={styles.rangeDisplay}>
        <span>{hourLabel(Math.floor(timeRange[0]))}Z — {hourLabel(Math.floor(timeRange[1]))}Z</span>
        <span className={styles.window}>{Math.round(timeRange[1] - timeRange[0])}h WINDOW</span>
      </div>
    </div>
  );
}
