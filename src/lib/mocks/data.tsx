import moment from 'moment';

import type { TimelineItem, TimelineRow } from '../types';

const DEFAULT_ROWS_LENGTH = 150;
const DEFAULT_ITEMS_LENGTH = 100;

export interface Data {
  range: {
    start: number;
    end: number;
  };
  rows: TimelineRow[];
}

export const getData = ({
  withEmptyRows,
  withCluster,
}: { withEmptyRows?: boolean; withCluster?: boolean } = {}): Data => {
  const range = {
    start: moment().startOf('day').valueOf(),
    end: Date.now(),
  };

  const rows: TimelineRow[] = Array.from(
    { length: DEFAULT_ROWS_LENGTH },
    (_, index) => {
      const date = new Date(range.start);
      const rowId = index + 1;

      if (withEmptyRows && index % 10 === 0) {
        return {
          rowId,
          order: index,
          items: [],
          className: 'empty-row',
        };
      }

      return {
        rowId,
        order: index,
        items: Array.from(
          { length: DEFAULT_ITEMS_LENGTH },
          (_unused, taskIndex): TimelineItem => {
            if (withCluster && taskIndex % 5 === 0) {
              date.setMinutes(date.getMinutes() - 20);
            } else {
              date.setHours(
                date.getHours() + 4 * (Math.random() < 0.2 ? 1 : 0)
              );
              date.setMinutes(date.getMinutes() + 20);
            }

            const start = new Date(date);

            date.setHours(
              date.getHours() + 1 + Math.floor(Math.random() * 2),
              30
            );
            const end = new Date(date);

            if (end.valueOf() > range.end) {
              range.end = end.valueOf();
            }

            return {
              id: `${index + 1}_${taskIndex + 1}`,
              rowId,
              content:
                !withCluster && <span>{taskIndex + 1}</span>,
              start: start.valueOf(),
              end: end.valueOf(),
            };
          }
        ),
      };
    }
  );

  return {
    range: {
      start: range.start,
      end: range.end,
    },
    rows,
  };
};
