import { dateToPercent } from "../constants";
import styles from "../styles/YearAxis.module.css";

const YEARS = [
  1500, 1550, 1600, 1650, 1700, 1750, 1800, 1850, 1900, 1950, 2000,
];

export default function YearAxis() {
  return (
    <div className={styles.axis}>
      {YEARS.map((year) => (
        <div
          key={year}
          className={styles.tick}
          style={{ "--left": `${dateToPercent(new Date(`${year}-01-01`))}%` }}
        >
          {year}
        </div>
      ))}
    </div>
  );
}
