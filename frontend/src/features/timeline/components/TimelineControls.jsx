import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUiStore } from "../../../stores/uiStore";
import LayerSelector from "./LayerSelector";
import { useSavedTimelines } from "../hooks/useSavedTimelines";
import { http } from "../../../api/http";
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

  const setSelectedLayerIds = useUiStore((s) => s.setSelectedLayerIds);
  const setCategoryByLayerId = useUiStore((s) => s.setCategoryByLayerId);
  const setYearRange = useUiStore((s) => s.setYearRange);

  const {
    data: timelines,
    isLoading: timelinesLoading,
    isError: timelinesError,
  } = useSavedTimelines();

  async function loadTimeline(id) {
    try {
      const res = await http.get(`/api/saved-timelines/${id}`);
      const config = res.response?.config;
      if (!config) return;

      setSelectedLayerIds(config.selectedLayerIds ?? []);
      setCategoryByLayerId(config.categoryByLayerId ?? {});
      setYearRange(config.yearRange ?? [1500, 2000]);
    } catch (err) {
      console.error("Failed to load timeline:", err);
    }
  }

  const qc = useQueryClient();

  const yearRange = useUiStore((s) => s.yearRange);

  const [saveName, setSaveName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function saveCurrentTimeline() {
    const name = saveName.trim();
    if (!name) {
      setSaveError("Please enter a name.");
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      await http.post("/api/saved-timelines", {
        name,
        config: {
          selectedLayerIds,
          categoryByLayerId,
          yearRange,
        },
        notes: "",
      });

      setSaveName("");
      // Refresh sidebar list
      qc.invalidateQueries({ queryKey: ["savedTimelines"] });
    } catch (err) {
      console.error("Failed to save timeline:", err);
      setSaveError("Could not save timeline.");
    } finally {
      setIsSaving(false);
    }
  }

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

      <div className={styles.block}>
        <h3 className={styles.subheading}>Save current</h3>

        <div className={styles.saveRow}>
          <label className={styles.srOnly} htmlFor="save-timeline-name">
            Timeline name
          </label>

          <input
            id="save-timeline-name"
            className={styles.input}
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="Name your timeline…"
            autoComplete="off"
          />

          <button
            type="button"
            className={styles.saveButton}
            onClick={saveCurrentTimeline}
            disabled={isSaving}
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
        </div>

        {saveError ? <p className={styles.hint}>{saveError}</p> : null}
      </div>

      <div className={styles.block}>
        <h3 className={styles.subheading}>My timelines</h3>

        {timelinesLoading ? (
          <p className={styles.hint}>Loading…</p>
        ) : timelinesError ? (
          <p className={styles.hint}>Could not load saved timelines.</p>
        ) : !timelines || timelines.length === 0 ? (
          <p className={styles.hint}>No saved timelines yet.</p>
        ) : (
          <ul className={styles.savedList}>
            {timelines.map((t) => (
              <li key={t._id} className={styles.savedItem}>
                <button
                  type="button"
                  className={styles.savedButton}
                  onClick={() => loadTimeline(t._id)}
                >
                  {t.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
