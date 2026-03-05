import { useEffect, useState } from "react";
import styles from "../styles/ZoomBar.module.css";
import { useUiStore } from "../../../stores/uiStore";

function clampYear(n, min, max) {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

export default function ZoomBar({ minYear = 1500, maxYear = 2000 }) {
  const [start, end] = useUiStore((s) => s.yearRange);
  const setYearRange = useUiStore((s) => s.setYearRange);
  const resetYearRange = useUiStore((s) => s.resetYearRange);
  const visualZoom = useUiStore((s) => s.visualZoom);
  const setVisualZoom = useUiStore((s) => s.setVisualZoom);
  const resetVisualZoom = useUiStore((s) => s.resetVisualZoom);

  // draft strings so typing feels normal
  const [draftStart, setDraftStart] = useState(String(start));
  const [draftEnd, setDraftEnd] = useState(String(end));

  // keep drafts in sync when store changes (e.g. Reset)
  useEffect(() => {
    setDraftStart(String(start));
    setDraftEnd(String(end));
  }, [start, end]);

  const commit = (nextStartStr, nextEndStr) => {
    const nextStart = clampYear(Number(nextStartStr), minYear, maxYear);
    const nextEnd = clampYear(Number(nextEndStr), minYear, maxYear);

    // keep order
    const s = Math.min(nextStart, nextEnd);
    const e = Math.max(nextStart, nextEnd);

    setYearRange([s, e]);
  };

  return (
    <div className={styles.bar} aria-label="Timeline zoom controls">
      <div className={styles.group}>
        <label className={styles.label}>
          From
          <input
            className={styles.input}
            type="number"
            inputMode="numeric"
            value={draftStart}
            min={minYear}
            max={maxYear}
            onFocus={(e) => e.target.select()}
            onChange={(e) => setDraftStart(e.target.value)}
            onBlur={() => commit(draftStart, draftEnd)}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
          />
        </label>

        <label className={styles.label}>
          To
          <input
            className={styles.input}
            type="number"
            inputMode="numeric"
            value={draftEnd}
            min={minYear}
            max={maxYear}
            onFocus={(e) => e.target.select()}
            onChange={(e) => setDraftEnd(e.target.value)}
            onBlur={() => commit(draftStart, draftEnd)}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
          />
        </label>
      </div>

      <label className={styles.zoomLabel}>
        Visual zoom
        <input
          className={styles.zoomSlider}
          type="range"
          min="1"
          max="4"
          step="0.25"
          value={visualZoom}
          onChange={(e) => setVisualZoom(Number(e.target.value))}
        />
        <span className={styles.zoomValue}>{visualZoom.toFixed(2)}×</span>
      </label>

      <button
        type="button"
        className={styles.reset}
        onClick={() => {
          resetYearRange();
          +resetVisualZoom();
        }}
      >
        Reset
      </button>
    </div>
  );
}
