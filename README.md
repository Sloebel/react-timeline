# react-timeline

A **virtualized, zoomable timeline grid** for displaying time-bounded items in rows. Built for scheduling, planning, and any “items on a timeline” view (e.g. Gantt-style layouts).

## Features

- **Rows** – Each row has an id, order, and a list of timeline items.
- **Items** – Each item has `start` and `end` (millisecond timestamps), optional `content`, and can be clickable, selectable, or used as background blocks.
- **Time axis** – Top axis shows days and hours over a configurable range (`minAxisTime` / `maxAxisTime`) with configurable date/time formatting.
- **Zoom** – Zoom in/out via controls; zoom level determines how much time fits in the view and drives horizontal scroll.
- **Scroll** – Horizontal scroll over the time range; vertical scroll over rows (virtualized with `react-virtualized` for performance).
- **Current time bar** – A vertical bar indicating the current time within the visible range.
- **Grid lines** – Hour-based vertical grid lines for reading time.
- **Tooltips** – Optional tooltips on item click, with custom renderer and criteria for when to show.
- **Clustering** – Overlapping items in a row can be clustered into a single block (e.g. with count or summary).
- **Selection** – Support for selected items (e.g. via `selectedItemsIds` and `selectedClassName`).
- **Row hover** – Optional `onRowHover` callback for row-level hover behavior.

## Technical notes

- Uses **react-virtualized** `Grid` and `AutoSizer` for virtualized rows and horizontal scrolling.
- Time is expressed in **milliseconds**; item position is derived from `start`/`end` and the current zoom level.
- Exposes a **ref API** (`TimelinePublicApi`) with `scrollTo(scrollTop)` and `fitRange(start, end)`.
- Optional **sync scroll on wheel** and **onScroll** callback for integrating with other scrollable areas (e.g. a list beside the timeline).
