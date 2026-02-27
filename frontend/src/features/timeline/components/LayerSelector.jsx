import { LAYER_ACCENT } from "../constants";
import styles from "../styles/LayerSelector.module.css";

export default function LayerSelector({ layers, selectedIds, onToggle }) {
  return (
    <div className={styles.wrapper}>
      {layers.map((layer) => {
        const active = selectedIds.includes(layer._id);
        const accent = LAYER_ACCENT[layer.slug] ?? "#888";
        return (
          <button
            key={layer._id}
            onClick={() => onToggle(layer._id)}
            className={`${styles.btn} ${active ? styles.active : ""}`}
            style={{ "--accent": accent }}
          >
            {layer.name}
          </button>
        );
      })}
    </div>
  );
}
