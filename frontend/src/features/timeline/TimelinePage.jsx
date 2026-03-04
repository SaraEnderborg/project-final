import { useState, useEffect, useCallback } from "react";
import { useLayers } from "../layers/hooks";
import { useLayerEvents } from "../layers/hooks";
import TimelineRow from "./components/TimelineRow";
import YearAxis from "./components/YearAxis";
import EventPanel from "./components/EventPanel";
import styles from "./styles/TimelinePage.module.css";
import { useUiStore } from "../../stores/uiStore";

function ActiveLayer({
  layerId,
  layers,
  selectedEvent,
  onEventClick,
  category,
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
  const layers = layersData ?? [];

  const selectedLayerIds = useUiStore((s) => s.selectedLayerIds);
  const categoryByLayerId = useUiStore((s) => s.categoryByLayerId);
  const [startYear, endYear] = useUiStore((s) => s.yearRange);

  const [selectedEvent, setSelectedEvent] = useState(null);

  // Default-select first layer once layers have loaded
  useEffect(() => {
    if (layers.length > 0 && selectedLayerIds.length === 0) {
      // Use store setter logic (toggle first layer)
      //  avoid importing toggleLayer here by using setState directly:
      // simplest: just set it in store via setState
      useUiStore.setState({ selectedLayerIds: [layers[0]._id] });
    }
  }, [layers, selectedLayerIds.length]);

  const handleEventClick = useCallback((event) => {
    setSelectedEvent((prev) => (prev?._id === event._id ? null : event));
  }, []);

  if (isLoading) return <p className={styles.status}>Loading layers...</p>;
  if (isError)
    return <p className={styles.statusError}>Failed to load layers.</p>;

  return (
    <div className={`${styles.page} ${styles.safeWrap}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Historical Timeline</h1>
        <p className={styles.subtitle}>
          Europe · {startYear}–{endYear}
        </p>
      </div>

      <div className={styles.timeline}>
        {selectedLayerIds.length === 0 && (
          <p className={styles.status}>
            Select a layer in the sidebar to begin.
          </p>
        )}

        {selectedLayerIds.map((id) => (
          <ActiveLayer
            key={id}
            layerId={id}
            layers={layers}
            selectedEvent={selectedEvent}
            onEventClick={handleEventClick}
            category={categoryByLayerId[id] ?? ""}
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
