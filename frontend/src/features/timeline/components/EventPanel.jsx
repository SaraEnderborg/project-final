import { CATEGORY_COLORS, formatYear } from "../constants";
import styles from "../styles/EventPanel.module.css";

export default function EventPanel({ event, onClose }) {
  if (!event) return null;
  const color = CATEGORY_COLORS[event.category] ?? "#888";

  return (
    <div className={styles.panel} style={{ "--color": color }}>
      <button className={styles.closeBtn} onClick={onClose}>
        ✕
      </button>

      <div className={styles.category}>{event.category.replace(/_/g, " ")}</div>

      <h3 className={styles.title}>{event.title}</h3>

      <div className={styles.meta}>
        {formatYear(event.startDate)}
        {event.endDate && ` – ${formatYear(event.endDate)}`}
        {event.location && ` · ${event.location}`}
      </div>

      {event.summary && <p className={styles.summary}>{event.summary}</p>}

      {event.sources?.length > 0 && (
        <div className={styles.sources}>
          {event.sources.map((s, i) => (
            <a
              key={i}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className={styles.sourceLink}
            >
              ↗ {s.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
