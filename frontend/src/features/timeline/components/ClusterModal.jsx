import { useEffect } from "react";
import styles from "../styles/ClusterModal.module.css";

export default function ClusterModal({ cluster, onClose, onEventClick }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!cluster) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h3>{cluster.items.length} Events in Cluster</h3>
          <button onClick={onClose} className={styles.closeBtn}>
            ×
          </button>
        </header>
        <div className={styles.list}>
          {cluster.items.map((item) => (
            <button
              key={item.event._id}
              className={styles.eventItem}
              onClick={() => {
                onEventClick(item.event);
                onClose();
              }}
            >
              <span className={styles.title}>{item.event.title}</span>
              <span className={styles.date}>
                {new Date(item.event.startDate).getFullYear()}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
