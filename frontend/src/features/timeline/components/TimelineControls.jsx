import { useUiStore } from "../../../stores/uiStore";
import LayerSelector from "./LayerSelector";
import ZoomBar from "./ZoomBar";
import styles from "../styles/TimelineControls.module.css";

export default function TimelineControls({ layers }) {
  const selectedLayerIds = useUiStore((s) => s.selectedLayerIds);
  const toggleLayer = useUiStore((s) => s.toggleLayer);

  const categoryByLayerId = useUiStore((s) => s.categoryByLayerId);
  const setCategoryForLayer = useUiStore((s) => s.setCategoryForLayer);

  const selectedLayers = selectedLayerIds
    .map((id) => layers.find((l) => l._id === id))
    .filter(Boolean);

  return (
    <section className={styles.panel} aria-label="Timeline controls">
      <div className={styles.block}>
        <h3 className={styles.subheading}>Layers</h3>
        <LayerSelector
          layers={layers}
          selectedIds={selectedLayerIds}
          onToggle={toggleLayer}
        />
      </div>

      <div className={styles.block}>
        <h3 className={styles.subheading}>Year range</h3>
        <ZoomBar minYear={1500} maxYear={2000} />
      </div>

      <div className={styles.block}>
        <h3 className={styles.subheading}>Categories</h3>

        {selectedLayers.length === 0 ? (
          <p className={styles.hint}>Select a layer to see category filters.</p>
        ) : (
          <div className={styles.categoryList}>
            {selectedLayers.map((layer) => {
              const value = categoryByLayerId[layer._id] ?? "";
              return (
                <label key={layer._id} className={styles.categoryRow}>
                  <span className={styles.categoryName}>{layer.name}</span>
                  <select
                    className={styles.select}
                    value={value}
                    onChange={(e) =>
                      setCategoryForLayer(layer._id, e.target.value)
                    }
                  >
                    <option value="">All</option>
                    {(layer.categories ?? []).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
