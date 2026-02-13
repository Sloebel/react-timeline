import type { ClusterItem, ItemPosition, TimelineItem } from '../types';

export class ClusterGenerator {
  private clusterItem: ClusterItem = {
    start: 0,
    end: 0,
    items: [],
  };

  get item() {
    return this.clusterItem;
  }

  get itemsInCluster() {
    return this.clusterItem.items.length;
  }

  create = (item: TimelineItem, nextItem: TimelineItem) => {
    const start = item.start < nextItem.start ? item.start : nextItem.start;
    const end = nextItem.end > item.end ? nextItem.end : item.end;
    const items = [item, nextItem];

    this.clusterItem = {
      start,
      end,
      items,
    };
  };

  addItem = (item: TimelineItem) => {
    const cluster = this.clusterItem;
    const start = item.start < cluster.start ? item.start : cluster.start;
    const end = item.end;
    const items = [...cluster.items, item];

    this.clusterItem = {
      start,
      end,
      items,
    };
  };

  reset = () => {
    this.clusterItem = {
      start: 0,
      end: 0,
      items: [],
    };
  };
}

const criteria = (
  itemPosition: ItemPosition,
  nextItemPosition: ItemPosition
): boolean =>
  itemPosition.left + itemPosition.width - nextItemPosition.left >= 1;

export const clusterProvider = {
  criteria,
};
