import React, { useMemo, useRef } from 'react';

import classNames from 'classnames';

import type {
	ClusterItem,
	ClusterOptions,
	ItemPosition,
	TimeLineClusterItem,
	TimelineItem,
	TimelineItemClick,
	TimelineRow,
	TypeId
} from '../../types';
import useRowHover from '../../hooks/use-row-hover';
import type { TimelineRowHoverEvent } from '../../hooks/use-row-hover';
import Item from '../item/item';
import { ClusterGenerator, clusterProvider } from '../../utils/cluster-provider';

import styles from './grid-row.module.scss';

interface Props {
	row: TimelineRow;
	className?: string;
	style?: React.CSSProperties;
	calcItemPosition: (start: number, end: number) => ItemPosition;
	onItemClick: (
		item: TimelineItemClick,
		itemElement: HTMLDivElement | null,
		event: React.MouseEvent<HTMLDivElement>
	) => void;
	onRowHover?: (e: TimelineRowHoverEvent) => void;
	selectedItems?: Set<TypeId>;
	selectItemForTooltip: TimelineItem | TimeLineClusterItem | undefined;
	cluster?: ClusterOptions | boolean;
}

const GridRow = ({
	row,
	className,
	style,
	calcItemPosition,
	onItemClick,
	onRowHover,
	selectedItems,
	selectItemForTooltip,
	cluster = true
}: Props) => {
	const { rowId } = row;
	const ref = useRef<HTMLDivElement>(null);

	useRowHover(ref, rowId, onRowHover);

	const sortedItems = useMemo(() => [...row.items].sort((a, b) => a.start - b.start), [row.items]);

	const getBackgroundItem = (item: TimelineItem) => {
		const { id, start, end, content, clickable, selectedClassName, backgroundItem } = item;

		return (
			<Item
				key={id}
				className={item.className}
				itemOptions={{
					content,
					clickable,
					selectedClassName,
					backgroundItem,
					itemId: id,
					start,
					end
				}}
				style={calcItemPosition(start, end)}
				onClick={(itemElement, event) => onItemClick(item, itemElement, event)}
				selected={selectedItems?.has(item.id) || false}
			/>
		);
	};

	const getClusterItem = (clusterItem: ClusterItem, options: ClusterOptions | boolean) => {
		const getClusterClassName = typeof options === 'boolean' ? undefined : options.getClusterClassName;

		const { start, end, items } = clusterItem;
		const { selectedClassName } = items[0];
		const clusterId = 'cluster' + items.map(({ id }) => id).join('-');
		const clickedItem: TimelineItemClick = {
			id: clusterId,
			start,
			end,
			items,
			rowId: rowId as number,
			tooltipActive: clusterId === selectItemForTooltip?.id
		};

		return (
			<Item
				key={clusterId}
				className={getClusterClassName?.(items) || ''}
				itemOptions={{
					selectedClassName,
					content: items.length,
					itemId: clusterId,
					start,
					end
				}}
				style={{ ...calcItemPosition(start, end) }}
				onClick={(itemElement, event) => {
					onItemClick(clickedItem, itemElement, event);
				}}
				selected={items.some(_item => selectedItems?.has(_item.id))}
			/>
		);
	};

	const getItem = (item: TimelineItem) => {
		const { content, clickable, selectedClassName, backgroundItem, id, start, end } = item;
		const clickedItem: TimelineItemClick = {
			...item,
			tooltipActive: item.id === selectItemForTooltip?.id
		};

		return (
			<Item
				key={item.id}
				className={item.className}
				itemOptions={{
					content,
					clickable,
					selectedClassName,
					backgroundItem,
					itemId: id,
					start,
					end
				}}
				style={{ ...calcItemPosition(item.start, item.end) }}
				onClick={(itemElement, event) => onItemClick(clickedItem, itemElement, event)}
				selected={selectedItems?.has(item.id) || false}
			/>
		);
	};

	const generateItems = (items: TimelineItem[]) => {
		const _cluster = new ClusterGenerator();
		const _items: React.JSX.Element[] = [];

		for (let index = 0; index < items.length; index++) {
			let item: TimelineItem | undefined = items[index];

			if (item.backgroundItem) {
				_items.unshift(getBackgroundItem(item));
				continue;
			}

			if (cluster) {
				const nextItem = items[index + 1];
				const { shouldCluster: shouldClusterItem = true } = item;

				const itemPosition = calcItemPosition(item.start, item.end);
				const clusterPosition = calcItemPosition(_cluster.item.start, _cluster.item.end);

				if (
					shouldClusterItem &&
					_cluster.itemsInCluster > 1 &&
					clusterProvider.criteria(clusterPosition, itemPosition)
				) {
					_cluster.addItem(item);

					if (nextItem) continue;

					item = undefined;
				}

				if (nextItem && !nextItem.backgroundItem) {
					if (_cluster.itemsInCluster > 1) {
						_items.push(getClusterItem(_cluster.item, cluster));

						_cluster.reset();
					}

					const nextItemPosition = calcItemPosition(nextItem.start, nextItem.end);
					const { shouldCluster: shouldClusterNextItem = true } = nextItem;

					if (shouldClusterNextItem && clusterProvider.criteria(itemPosition, nextItemPosition)) {
						_cluster.create(item as TimelineItem, nextItem);

						index++;

						if (index < items.length - 1) continue;

						item = undefined;
					}
				}

				if (_cluster.itemsInCluster) {
					_items.push(getClusterItem(_cluster.item, cluster));

					_cluster.reset();
				}
			}

			if (item) {
				_items.push(getItem(item));
			}
		}

		return _items;
	};

	return (
		<div
			ref={ref}
			style={style}
			className={classNames(styles.gridRow, className, `timeline-row-${row.rowId}`)}
			data-testid={`timeline-row-${row.rowId}`}
		>
			{generateItems(sortedItems)}
		</div>
	);
};

export const EmptyRow = ({ style }: { style: React.CSSProperties }) => <div style={style} />;

export default GridRow;
