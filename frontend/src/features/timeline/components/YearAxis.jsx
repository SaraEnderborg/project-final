import { useMemo } from "react";
import { useUiStore } from "../../../stores/uiStore";
import styles from "../styles/YearAxis.module.css";

export default function YearAxis() {
  const [startYear, endYear] = useUiStore((s) => s.yearRange);

  const ticks = useMemo(() => {
    const span = endYear - startYear;

    const step = span <= 50 ? 10 : span <= 200 ? 25 : span <= 500 ? 50 : 100;

    const first = Math.ceil(startYear / step) * step;

    const arr = [];
    for (let y = first; y <= endYear; y += step) {
      arr.push(y);
    }

    return arr;
  }, [startYear, endYear]);

  const span = Math.max(1, endYear - startYear);

  return (
    <div className={styles.axis} aria-label="Year axis">
      {ticks.map((y) => {
        const left = ((y - startYear) / span) * 100;

        return (
          <div key={y} className={styles.tick} style={{ left: `${left}%` }}>
            <div className={styles.line} />
            <span className={styles.label}>{y}</span>
          </div>
        );
      })}
    </div>
  );
}
