import { useState, useCallback, useEffect } from "react";
import { useLayers } from "../layers/hooks";
import { useLayerEvents } from "../layers/hooks";
import LayerSelector from "./components/LayerSelector";
import TimelineRow from "./components/TimelineRow";
import YearAxis from "./components/YearAxis";
import EventPanel from "./components/EventPanel";
import styles from "./styles/TimelinePage.module.css";

function ActiveLayer({ layerId, layers, selectedEvent, onEventClick }) {
  const layer = layers.find((l) => l._id === layerId);
  const { data, isLoading, isError } = useLayerEvents(layerId);

  if (!layer) return null;
  if (isLoading)
    return <p className={styles.status}>Loading {layer.name}...</p>;
  if (isError)
    return <p className={styles.statusError}>Failed to load {layer.name}</p>;

  return (
    <TimelineRow
      layer={layer}
      events={data?.events ?? []}
      selectedEvent={selectedEvent}
      onEventClick={onEventClick}
    />
  );
}

export default function TimelinePage() {
  const { data: layersData, isLoading, isError } = useLayers();
  const [selectedLayerIds, setSelectedLayerIds] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

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
