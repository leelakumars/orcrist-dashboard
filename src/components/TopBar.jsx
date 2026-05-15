import styles from './TopBar.module.css';

export default function TopBar({ isLive, lastUpdate }) {
  return (
    <header className={styles.bar}>
      <div className={styles.left}>
        <span className={styles.logo}>◈ ORCRIST</span>
        <span className={styles.divider}>|</span>
        <span className={styles.mission}>CORRIDOR MONITORING — ACTIVE SESSION</span>
      </div>
      <div className={styles.right}>
        <span className={styles.user}>OPS ANALYST · J. REYES</span>
        <span className={styles.divider}>|</span>
        {isLive ? (
          <span className={styles.live}><span className={styles.dot} />LIVE</span>
        ) : (
          <span className={styles.cached}><span className={styles.warnDot} />CACHED — {lastUpdate}</span>
        )}
      </div>
    </header>
  );
}
