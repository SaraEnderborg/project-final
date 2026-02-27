import { LAYER_ACCENT } from "../constants";
import EventDot from "./EventDot";
import styles from "../styles/TimelineRow.module.css";

export default function TimelineRow({
  layer,
  events,
  selectedEvent,
  onEventClick,
}) {
  const accent = LAYER_ACCENT[layer.slug] ?? "#888";

  return (
    <div className={styles.wrapper}>
      <div className={styles.label} style={{ "--accent": accent }}>
        {layer.name}
        <span className={styles.count}>{events.length} events</span>
      </div>
      <div className={styles.track}>
        <div className={styles.centerLine} />
        {events.map((event) => (
          <EventDot
            key={event._id}
            event={event}
            onClick={onEventClick}
            isSelected={selectedEvent?._id === event._id}
          />
        ))}
      </div>
    </div>
  );
}
