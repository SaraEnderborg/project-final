import { CATEGORY_COLORS, dateToPercent } from "../constants";
import styles from "../styles/EventDot.module.css";

export default function EventDot({ event, onClick, isSelected }) {
  const color = CATEGORY_COLORS[event.category] ?? "#888";
  const left = dateToPercent(event.startDate);

  return (
    <div
      className={`${styles.dot} ${isSelected ? styles.selected : ""}`}
      onClick={() => onClick(event)}
      title={event.title}
      style={{
        left,
        "--color": color,
        "--left": `${left}%`,
      }}
    />
  );
}
