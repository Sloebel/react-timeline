import type { HoursAxis } from '../../types';

import styles from './grid-lines.module.scss';

interface Props {
  hoursValues: HoursAxis[];
}

const GridLines = ({ hoursValues }: Props) => {
  return (
    <div className={styles.container}>
      {hoursValues.map(({ left, time }, index) => (
        <div
          key={`${index}_${time}`}
          className={styles.line}
          style={{ left }}
        />
      ))}
    </div>
  );
};

export default GridLines;
