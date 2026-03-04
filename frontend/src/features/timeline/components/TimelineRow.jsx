import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import dotStyles from "../styles/EventDot.module.css";
import styles from "../styles/TimelineRow.module.css";
import { LAYER_ACCENT, CATEGORY_COLORS, dateToPercent } from "../constants";
import EventDot from "./EventDot";

const CLUSTER_PX = 8; // lite tightare än 10 för att undvika mega-clusters
const EXPLODE_DY = 12; // vertikalt varannan upp/ner
const EXPLODE_DX = 10; // bara om flera har exakt samma x
const MAX_EXPLODE = 60; // visa fler i explode

function getClusterColor(events) {
  const cats = new Set(events.map((x) => x.event.category));
  if (cats.size === 1) {
    const cat = [...cats][0];
    return CATEGORY_COLORS[cat] ?? "#888";
  }
  return "#b0b0b0";
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

  useEffect(() => {
    if (!trackRef.current) return;

    const el = trackRef.current;

    const measure = () => {
      const w = el.getBoundingClientRect().width;
      setTrackWidth(Math.max(0, w - 20));
    };

    const ro = new ResizeObserver(() => {
      const w = el.getBoundingClientRect().width;
      setTrackWidth(Math.max(0, w - 20));
    });

    ro.observe(el);
    setTrackWidth(el.getBoundingClientRect().width);

    return () => ro.disconnect();
  }, []);

  const clusters = useMemo(() => {
    if (!events || events.length === 0) return [];

    // If we can't measure yet, render singles (no clustering) to avoid weirdness
    if (!trackWidth) {
      return events.map((e) => ({
        key: e._id,
        type: "single",
        leftPercent: dateToPercent(e.startDate),
        items: [{ event: e, leftPercent: dateToPercent(e.startDate) }],
      }));
    }

    const items = events
      .map((e) => {
        const leftPercent = dateToPercent(e.startDate);
        const xPx = (leftPercent / 100) * trackWidth;
        return { event: e, leftPercent, xPx };
      })
      .sort((a, b) => a.xPx - b.xPx);

    const groups = [];
    let group = [items[0]];
    let groupStartX = items[0].xPx;

    for (let i = 1; i < items.length; i++) {
      const curr = items[i];

      if (curr.xPx - groupStartX <= CLUSTER_PX) {
        group.push(curr);
      } else {
        groups.push(group);
        group = [curr];
        groupStartX = curr.xPx;
      }
    }
    groups.push(group);

    return groups.map((g, idx) => {
      const leftAvgPx = g.reduce((sum, it) => sum + it.xPx, 0) / g.length;
      const leftPercent = (leftAvgPx / trackWidth) * 100;

      const key = `${layer._id}-${idx}-${Math.round(leftAvgPx)}-${g.length}`;

      return {
        key,
        type: g.length === 1 ? "single" : "cluster",
        leftPercent,
        items: g,
      };
    });
  }, [events, trackWidth, layer._id]);

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

  // Click outside closes explosion
  useEffect(() => {
    if (!explodedKey) return;

    const onDocMouseDown = (e) => {
      const trackEl = trackRef.current;
      if (!trackEl) return;
      if (!trackEl.contains(e.target)) setExplodedKey(null);
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
            const it = c.items[0];
            return (
              <EventDot
                key={it.event._id}
                event={it.event}
                onClick={onEventClick}
                isSelected={selectedEvent?._id === it.event._id}
                leftOverride={it.leftPercent}
              />
            );
          }

          const isExploded = explodedKey === c.key;

          const clusterColor = getClusterColor(c.items);
          const count = c.items.length;

          // sort for explode
          const explodedItems = c.items
            .slice()
            .sort((a, b) => a.xPx - b.xPx)
            .slice(0, MAX_EXPLODE);

          const hiddenCount = Math.max(0, count - explodedItems.length);

          // cluster dot
          return (
            <div key={c.key}>
              <EventDot
                event={{
                  _id: c.key,
                  title: `${count} events`,
                  startDate: new Date(), // unused (leftOverride)
                  category: "mixed",
                }}
                onClick={() => toggleExplode(c.key)}
                isSelected={false}
                title={
                  isExploded
                    ? "Click to collapse"
                    : `${count} events (click to expand)`
                }
                dataCount={count}
                colorOverride={clusterColor}
                leftOverride={c.leftPercent}
                className={dotStyles.cluster}
              />
              {isExploded &&
                explodedItems.map((it, i) => {
                  const sameX = explodedItems.filter(
                    (x) => Math.abs(x.xPx - it.xPx) < 0.5,
                  );
                  let dx = 0;
                  if (sameX.length > 1) {
                    const j = sameX.findIndex(
                      (x) => x.event._id === it.event._id,
                    );
                    const mid = (sameX.length - 1) / 2;
                    dx = Math.round((j - mid) * EXPLODE_DX);
                  }

                  const dy = i % 2 === 0 ? -EXPLODE_DY : EXPLODE_DY;

                  return (
                    <EventDot
                      key={it.event._id}
                      event={it.event}
                      onClick={onEventClick}
                      isSelected={selectedEvent?._id === it.event._id}
                      leftOverride={it.leftPercent}
                      offset={{ dx, dy }}
                    />
                  );
                })}

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
