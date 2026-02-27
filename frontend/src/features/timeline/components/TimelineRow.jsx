import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import dotStyles from "../styles/EventDot.module.css";
import styles from "../styles/TimelineRow.module.css";
import { LAYER_ACCENT, CATEGORY_COLORS, dateToPercent } from "../constants";
import EventDot from "./EventDot";

const CLUSTER_PX = 10; // hur nära (i px) events måste ligga för att klustras
const EXPLODE_SPACING = 12; // px mellan dots i explode
const EXPLODE_DY = 12; // vertikal offset upp/ner
const MAX_EXPLODE = 24; // säkerhetscap så det inte exploderar 200 dots

function getClusterColor(events) {
  const cats = new Set(events.map((e) => e.category));
  if (cats.size === 1) {
    const cat = [...cats][0];
    return CATEGORY_COLORS[cat] ?? "#888";
  }
  return "#b0b0b0"; // mixed
}

export default function TimelineRow({
  layer,
  events,
  selectedEvent,
  onEventClick,
}) {
  const accent = LAYER_ACCENT[layer.slug] ?? "#888";
  const trackRef = useRef(null);

  const [trackWidth, setTrackWidth] = useState(0);
  const [explodedKey, setExplodedKey] = useState(null);

  // Measure track width (ResizeObserver)
  useEffect(() => {
    if (!trackRef.current) return;

    const el = trackRef.current;

    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setTrackWidth(rect.width);
    });

    ro.observe(el);

    // init
    const rect = el.getBoundingClientRect();
    setTrackWidth(rect.width);

    return () => ro.disconnect();
  }, []);

  // Pixel-based clustering (screen proximity)
  const clusters = useMemo(() => {
    if (!events || events.length === 0) return [];

    // fallback: no clustering until we know width
    if (!trackWidth) {
      return events.map((e) => ({
        key: e._id,
        type: "single",
        leftPercent: dateToPercent(e.startDate),
        events: [e],
      }));
    }

    const items = events
      .map((e) => {
        const leftPercent = dateToPercent(e.startDate);
        const xPx = (leftPercent / 100) * trackWidth;
        return { e, leftPercent, xPx };
      })
      .sort((a, b) => a.xPx - b.xPx);

    const groups = [];
    let group = [items[0]];

    for (let i = 1; i < items.length; i++) {
      const prev = items[i - 1];
      const curr = items[i];

      if (curr.xPx - prev.xPx <= CLUSTER_PX) {
        group.push(curr);
      } else {
        groups.push(group);
        group = [curr];
      }
    }
    groups.push(group);

    return groups.map((g, idx) => {
      const leftAvgPx = g.reduce((sum, it) => sum + it.xPx, 0) / g.length;
      const leftPercent = (leftAvgPx / trackWidth) * 100;
      const eventsInCluster = g.map((it) => it.e);

      // stable-ish key: layer + group index + approx px + size
      const key = `${layer._id}-${idx}-${Math.round(leftAvgPx)}-${eventsInCluster.length}`;

      return {
        key,
        type: eventsInCluster.length === 1 ? "single" : "cluster",
        leftPercent,
        events: eventsInCluster,
      };
    });
  }, [events, trackWidth, layer._id]);

  // Close explosion if cluster no longer exists
  useEffect(() => {
    if (!explodedKey) return;
    const stillExists = clusters.some(
      (c) => c.key === explodedKey && c.type === "cluster",
    );
    if (!stillExists) setExplodedKey(null);
  }, [clusters, explodedKey]);

  const toggleExplode = useCallback((key) => {
    setExplodedKey((prev) => (prev === key ? null : key));
  }, []);

  // Click outside to close exploded cluster
  useEffect(() => {
    if (!explodedKey) return;

    const onDocMouseDown = (e) => {
      const trackEl = trackRef.current;
      if (!trackEl) return;

      if (!trackEl.contains(e.target)) {
        setExplodedKey(null);
      }
    };

    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [explodedKey]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.label} style={{ "--accent": accent }}>
        {layer.name}
        <span className={styles.count}>{events.length} events</span>
      </div>

      <div className={styles.track} ref={trackRef}>
        <div className={styles.centerLine} />

        {clusters.map((c) => {
          if (c.type === "single") {
            const event = c.events[0];
            return (
              <EventDot
                key={event._id}
                event={event}
                onClick={onEventClick}
                isSelected={selectedEvent?._id === event._id}
              />
            );
          }

          const isExploded = explodedKey === c.key;

          // Cluster dot
          const clusterColor = getClusterColor(c.events);

          // Exploded items (cap + sort)
          const explodedEvents = c.events
            .slice()
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
            .slice(0, MAX_EXPLODE);

          const hiddenCount = Math.max(
            0,
            c.events.length - explodedEvents.length,
          );

          return (
            <div key={c.key}>
              <EventDot
                event={{
                  _id: c.key,
                  title: `${c.events.length} events`,
                  startDate: new Date(), // unused (vi använder leftOverride)
                  category: "mixed",
                }}
                onClick={() => toggleExplode(c.key)}
                isSelected={false}
                title={
                  isExploded
                    ? "Click to collapse"
                    : `${c.events.length} events (click to expand)`
                }
                dataCount={c.events.length}
                colorOverride={clusterColor}
                leftOverride={c.leftPercent}
                className={dotStyles.cluster}
              />

              {/* Exploded dots */}
              {isExploded &&
                explodedEvents.map((event, i, arr) => {
                  const mid = (arr.length - 1) / 2;
                  const dx = Math.round((i - mid) * EXPLODE_SPACING);
                  const dy = i % 2 === 0 ? -EXPLODE_DY : EXPLODE_DY;

                  return (
                    <EventDot
                      key={event._id}
                      event={event}
                      onClick={(e) => {
                        onEventClick(e);
                        // valfritt: stäng explosion när man väljer ett event
                        // setExplodedKey(null);
                      }}
                      isSelected={selectedEvent?._id === event._id}
                      offset={{ dx, dy }}
                      leftOverride={c.leftPercent}
                    />
                  );
                })}

              {/* Optional: “+N more” hint (om cap slår in) */}
              {isExploded && hiddenCount > 0 && (
                <EventDot
                  event={{
                    _id: `${c.key}-more`,
                    title: `+${hiddenCount} more`,
                    startDate: new Date(),
                    category: "mixed",
                  }}
                  onClick={() => {}}
                  isSelected={false}
                  title={`+${hiddenCount} more (increase MAX_EXPLODE to show)`}
                  dataCount={`+${hiddenCount}`}
                  colorOverride={"#777"}
                  leftOverride={c.leftPercent}
                  offset={{ dx: 0, dy: -28 }}
                  className={dotStyles.cluster}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
