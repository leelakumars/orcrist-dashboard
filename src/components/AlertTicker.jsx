import { useRef, useEffect } from 'react';
import styles from './AlertTicker.module.css';
import { ALERT_TICKER, SEVERITY_META } from '../data/mockData';

// Duplicate the list so the scroll loops seamlessly
const ITEMS = [...ALERT_TICKER, ...ALERT_TICKER];

export default function AlertTicker() {
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let x = 0;
    const speed = 0.4; // px per frame
    let raf;
    const animate = () => {
      x -= speed;
      // Reset when we've scrolled half the total width (one full copy)
      if (Math.abs(x) >= track.scrollWidth / 2) x = 0;
      track.style.transform = `translateX(${x}px)`;
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={styles.bar}>
      <span className={styles.label}>LIVE ALERTS</span>
      <div className={styles.viewport}>
        <div className={styles.track} ref={trackRef}>
          {ITEMS.map((item, i) => {
            const sev = SEVERITY_META[item.severity];
            return (
              <span key={i} className={styles.item}>
                <span className={styles.sevDot} style={{ background: sev.color }} />
                <span className={styles.sevLabel} style={{ color: sev.color }}>{item.severity}</span>
                <span className={styles.text}>{item.text}</span>
                <span className={styles.sep}>·</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
