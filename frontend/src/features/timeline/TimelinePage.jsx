import { useState, useCallback, useEffect } from "react";
import { useLayers } from "../layers/hooks";
import { useLayerEvents } from "../layers/hooks";
import LayerSelector from "./components/LayerSelector";
import TimelineRow from "./components/TimelineRow";
import YearAxis from "./components/YearAxis";
import EventPanel from "./components/EventPanel";
import styles from "./styles/TimelinePage.module.css";
function ActiveLayer({
  layerId,
  layers,
  selectedEvent,
  onEventClick,
  category,
  onCategoryChange,
}) {
  const layer = layers.find((l) => l._id === layerId);

  const { data, isLoading, isError } = useLayerEvents(layerId, {
    category: category || undefined,
  });

  if (!layer) return null;

  if (isLoading)
    return <p className={styles.status}>Loading {layer.name}...</p>;

  if (isError)
    return <p className={styles.statusError}>Failed to load {layer.name}</p>;

  return (
    <>
      {/* CATEGORY FILTER */}
      <div className={styles.layerControls}>
        <label className={styles.controlLabel}>
          Category
          <select
            className={styles.select}
            value={category ?? ""}
            onChange={(e) => onCategoryChange(layerId, e.target.value)}
          >
            <option value="">All</option>

            {(layer.categories ?? []).map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>

        <span className={styles.countInline}>
          {data?.events?.length ?? 0} events
        </span>
      </div>
      {/* TIMELINE */}
      <TimelineRow
        layer={layer}
        events={data?.events ?? []}
        selectedEvent={selectedEvent}
        onEventClick={onEventClick}
      />
    </>
  );
}

export default function TimelinePage() {
  const { data: layersData, isLoading, isError } = useLayers();
  const [selectedLayerIds, setSelectedLayerIds] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [categoryByLayerId, setCategoryByLayerId] = useState({});

  const layers = layersData ?? [];

  useEffect(() => {
    if (layers.length > 0 && selectedLayerIds.length === 0) {
      setSelectedLayerIds([layers[0]._id]);
    }
  }, [layers]);

  const handleToggleLayer = useCallback((id) => {
    setSelectedLayerIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [...prev.slice(1), id];
      return [...prev, id];
    });
  }, []);

  const handleEventClick = useCallback((event) => {
    setSelectedEvent((prev) => (prev?._id === event._id ? null : event));
  }, []);

  const handleCategoryChange = useCallback((layerId, value) => {
    setCategoryByLayerId((prev) => ({ ...prev, [layerId]: value || null }));
  }, []);

  if (isLoading) return <p className={styles.status}>Loading layers...</p>;
  if (isError)
    return <p className={styles.statusError}>Failed to load layers.</p>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Historical Timeline</h1>
        <p className={styles.subtitle}>Europe · 1500–2000</p>
      </div>

      <LayerSelector
        layers={layers}
        selectedIds={selectedLayerIds}
        onToggle={handleToggleLayer}
      />

      <div className={styles.timeline}>
        {selectedLayerIds.length === 0 && (
          <p className={styles.status}>Select a layer above to begin.</p>
        )}
        {selectedLayerIds.map((id) => (
          <ActiveLayer
            key={id}
            layerId={id}
            layers={layers}
            selectedEvent={selectedEvent}
            onEventClick={handleEventClick}
            category={categoryByLayerId[id] ?? ""}
            onCategoryChange={handleCategoryChange}
          />
        ))}
        <YearAxis />
      </div>

      <EventPanel
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
