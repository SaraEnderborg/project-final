import { useEffect, useMemo, useRef, useState } from "react";
import { useUiStore } from "../../../stores/uiStore";
import styles from "../styles/YearAxis.module.css";

export default function YearAxis() {
  const [startYear, endYear] = useUiStore((s) => s.yearRange);
  const visualZoom = useUiStore((s) => s.visualZoom);

  const axisRef = useRef(null);
  const [axisWidth, setAxisWidth] = useState(0);

  useEffect(() => {
    if (!axisRef.current) return;
    const el = axisRef.current;

    const measure = () =>
      setAxisWidth(Math.max(0, el.getBoundingClientRect().width));
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();

    return () => ro.disconnect();
  }, []);

  const span = Math.max(1, endYear - startYear);

  const ticks = useMemo(() => {
    const step = span <= 50 ? 10 : span <= 200 ? 25 : span <= 500 ? 50 : 100;
    const first = Math.ceil(startYear / step) * step;

    const arr = [];
    for (let y = first; y <= endYear; y += step) arr.push(y);
    return arr;
  }, [startYear, endYear, span]);

  const canvasWidth = axisWidth
    ? Math.round(axisWidth * Math.max(1, visualZoom))
    : 0;

  return (
    <div className={styles.axis} aria-label="Year axis" ref={axisRef}>
      <div
        className={styles.canvas}
        style={{ width: canvasWidth ? `${canvasWidth}px` : "100%" }}
      >
        {ticks.map((y) => {
          const leftPx = ((y - startYear) / span) * canvasWidth;

          return (
            <div
              key={y}
              className={styles.tick}
              style={{ left: `${leftPx}px` }}
            >
              <div className={styles.line} />
              <span className={styles.label}>{y}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
