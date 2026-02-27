import { CATEGORY_COLORS, dateToPercent } from "../constants";
import styles from "../styles/EventDot.module.css";

export default function EventDot({
  event,
  onClick,
  isSelected,
  offset,
  className,
  title,
  dataCount,
  colorOverride,
  leftOverride,
}) {
  const color = colorOverride ?? CATEGORY_COLORS[event.category] ?? "#888";
  const left = leftOverride ?? dateToPercent(event.startDate);

  return (
    <div
      className={`${styles.dot} ${className ?? ""} ${
        isSelected ? styles.selected : ""
      }`}
      onClick={() => onClick(event)}
      title={title ?? event.title}
      data-count={dataCount}
      style={{
        "--color": color,
        "--left": `${left}%`,
        "--dx": offset?.dx ? `${offset.dx}px` : "0px",
        "--dy": offset?.dy ? `${offset.dy}px` : "0px",
      }}
    />
  );
}
