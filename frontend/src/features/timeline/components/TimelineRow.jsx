import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import dotStyles from "../styles/EventDot.module.css";
import styles from "../styles/TimelineRow.module.css";
import { LAYER_ACCENT, CATEGORY_COLORS, dateToPercent } from "../constants";
import EventDot from "./EventDot";
import { useUiStore } from "../../../stores/uiStore";

const CLUSTER_PX = 8;
const EXPLODE_DY = 12;
const EXPLODE_DX = 10;
const MAX_EXPLODE = 60;
const CLUSTER_SEPARATION_PX = 18;
const STAGGER_DY = 10;

function getClusterColor(items) {
  const cats = new Set(items.map((x) => x.event.category));
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
  const [rangeStartYear, rangeEndYear] = useUiStore((s) => s.yearRange);
  const visualZoom = useUiStore((s) => s.visualZoom);

  const rangeStart = useMemo(
    () => new Date(`${rangeStartYear}-01-01`),
    [rangeStartYear],
  );

  const rangeEnd = useMemo(
    () => new Date(`${rangeEndYear}-12-31`),
    [rangeEndYear],
  );

  const visibleEvents = useMemo(() => {
    if (!events?.length) return [];
    return events.filter((e) => {
      const d = new Date(e.startDate);
      return d >= rangeStart && d <= rangeEnd;
    });
  }, [events, rangeStart, rangeEnd]);

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

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();

    return () => ro.disconnect();
  }, []);

  const canvasWidth = useMemo(() => {
    return trackWidth ? Math.round(trackWidth * Math.max(1, visualZoom)) : 0;
  }, [trackWidth, visualZoom]);

  const clusters = useMemo(() => {
    if (!visibleEvents || visibleEvents.length === 0) return [];

    if (!canvasWidth) {
      return visibleEvents.map((e) => {
        const leftPercent = dateToPercent(e.startDate, rangeStart, rangeEnd);
        return {
          key: e._id,
          type: "single",
          leftPercent,
          items: [{ event: e, leftPercent }],
        };
      });
    }

    const items = visibleEvents
      .map((e) => {
        const leftPercent = dateToPercent(e.startDate, rangeStart, rangeEnd);
        const xPx = (leftPercent / 100) * canvasWidth;

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

    return groups
      .map((g, idx) => {
        const leftAvgPx = g.reduce((sum, it) => sum + it.xPx, 0) / g.length;

        const leftPercent = (leftAvgPx / canvasWidth) * 100;

        const key = `${layer._id}-${idx}-${Math.round(leftAvgPx)}-${g.length}`;

        return {
          key,
          type: g.length === 1 ? "single" : "cluster",
          leftPercent,
          leftAvgPx,
          items: g,
        };
      })
      .map((c, i, arr) => {
        if (c.type !== "cluster") return { ...c, staggerDy: 0 };

        const prev = arr[i - 1];

        if (prev && prev.type === "cluster") {
          const dx = Math.abs(c.leftAvgPx - prev.leftAvgPx);

          if (dx < CLUSTER_SEPARATION_PX) {
            const dir = i % 2 === 0 ? -1 : 1;

            return { ...c, staggerDy: dir * STAGGER_DY };
          }
        }

        return { ...c, staggerDy: 0 };
      });
  }, [visibleEvents, canvasWidth, layer._id, rangeStart, rangeEnd]);

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

        <span className={styles.count}>
          {visibleEvents.length} / {events.length} events
        </span>
      </div>

      <div className={`${styles.track} ${dotStyles.trackHover}`} ref={trackRef}>
        <div
          className={styles.canvas}
          style={{ width: canvasWidth ? `${canvasWidth}px` : "100%" }}
        >
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

            const explodedItems = c.items
              .slice()
              .sort((a, b) => a.xPx - b.xPx)
              .slice(0, MAX_EXPLODE);

            const hiddenCount = Math.max(0, count - explodedItems.length);

            return (
              <div key={c.key}>
                <EventDot
                  event={{
                    _id: c.key,
                    title: `${count} events`,
                    startDate: new Date(),
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
                  offset={{ dx: 0, dy: c.staggerDy ?? 0 }}
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

                    const baseDy = c.staggerDy ?? 0;

                    const dy =
                      baseDy + (i % 2 === 0 ? -EXPLODE_DY : EXPLODE_DY);

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
                    title={`+${hiddenCount} more`}
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
    </div>
  );
}
