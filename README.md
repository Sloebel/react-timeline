# react-timeline

A virtualized, zoomable timeline grid for displaying time-bounded items in rows. Built with **react-virtualized** for performance — ideal for scheduling, planning, Gantt-style layouts, and any "items on a timeline" view.

[![CI](https://github.com/Sloebel/react-timeline/actions/workflows/ci.yml/badge.svg)](https://github.com/Sloebel/react-timeline/actions/workflows/ci.yml)

**[Live Storybook Examples](https://sloebel.github.io/react-timeline/)**

---

## Install

```bash
npm install react-timeline
```

**Requirements:** React 18+, Node 18+ (development only).

## Quick Start

```tsx
import { Timeline } from 'react-timeline';
import 'react-timeline/styles';

const rows = [
  {
    rowId: 1,
    order: 0,
    items: [
      { id: 'a', rowId: 1, start: Date.now(), end: Date.now() + 3_600_000, content: 'Task A' },
    ],
  },
];

function App() {
  return (
    <Timeline
      rows={rows}
      options={{
        minAxisTime: Date.now() - 86_400_000,
        maxAxisTime: Date.now() + 86_400_000,
      }}
    />
  );
}
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `rows` | `TimelineRow[]` | Array of rows, each containing timeline items. |
| `options` | `TimelineOptions` | Configuration object (time range, callbacks, clustering, etc.). |
| `className` | `string` | Additional CSS class for the timeline container. |
| `tooltipRenderer` | `(items: TimelineItem[], options?) => JSX.Element` | Custom render function for item tooltips. |
| `tooltipCriteria` | `(item, event) => boolean` | Predicate controlling when a tooltip should appear. |
| `tooltipContainerSelector` | `string` | CSS selector for the tooltip portal container. |
| `onClick` | `(event: React.MouseEvent) => void` | Click handler on the timeline container. |
| `onItemClick` | `(item: TimelineItemClick, event) => void` | Click handler for individual items. |
| `selectedItemsIds` | `Set<TypeId>` | Set of selected item IDs for visual highlighting. |
| `onZoomRangeChange` | `(range: { start: number; end: number }) => void` | Callback fired when the visible time range changes due to zoom. |
| `hideDaysValue` | `boolean` | Hide the day labels on the time axis. Defaults to `false`. |
| `ref` | `React.Ref<TimelinePublicApi>` | Imperative handle for programmatic control. |

## Types

### `TimelineRow`

```ts
type TimelineRow = {
  rowId: string | number;
  order: number;
  items: TimelineItem[];
  className?: string;
};
```

### `TimelineItem`

```ts
type TimelineItem = {
  id: TypeId;
  rowId: number;
  start: number;                // millisecond timestamp
  end: number;                  // millisecond timestamp
  content?: React.ReactNode;
  className?: string;
  selectedClassName?: string;
  clickable?: boolean;
  shouldCluster?: boolean;
  backgroundItem?: boolean;
  title?: string;
  data?: Record<string, unknown>;
};
```

### `TimelineOptions`

```ts
type TimelineOptions = {
  minAxisTime: number;          // start of the visible time range (ms)
  maxAxisTime: number;          // end of the visible time range (ms)
  onScroll?: (scrollTop: number) => void;
  onRowHover?: (e: TimelineRowHoverEvent) => void;
  syncScrollOnWheel?: boolean;
  rowClassName?: string;
  keepLayoutOnDom?: boolean;
  cluster?: ClusterOptions | boolean;
  timeAxisOptions?: TimeAxisOptions;
  hourFormat?: string;
};
```

### `TimelinePublicApi`

Accessed via `ref`. Provides imperative methods for controlling the timeline programmatically.

```ts
interface TimelinePublicApi {
  scrollTo: (scrollTop: number) => void;
  fitRange: (start: number, end: number) => void;
}
```

| Method | Description |
|--------|-------------|
| `scrollTo(scrollTop)` | Scroll the timeline vertically to a specific pixel offset. |
| `fitRange(start, end)` | Zoom and scroll to fit the given time range into view. |

**Example:**

```tsx
const timelineRef = useRef<TimelinePublicApi>(null);

// Scroll to top
timelineRef.current?.scrollTo(0);

// Fit a 24-hour range into view
timelineRef.current?.fitRange(Date.now(), Date.now() + 86_400_000);

<Timeline ref={timelineRef} rows={rows} options={options} />
```

## Theming

The timeline is styled via CSS custom properties. Import the base theme, then override any variable in your own CSS:

```tsx
import 'react-timeline/styles';
```

### CSS Variables

Override these on `:root` or on a parent element to customize the look:

| Variable | Default | Description |
|----------|---------|-------------|
| **Grid** | | |
| `--timeline-grid-line-color` | `#e5e7eb` | Vertical hour grid lines |
| `--timeline-day-line-color` | `#9ca3af` | Vertical day separator lines |
| `--timeline-row-border-color` | `#e5e7eb` | Horizontal row borders |
| `--timeline-row-hover-bg` | `#f9fafb` | Row background on hover |
| `--timeline-row-height` | `32px` | Height of each row |
| **Items** | | |
| `--timeline-item-bg` | `#ffffff` | Item background |
| `--timeline-item-border-color` | `#6b7280` | Item border |
| `--timeline-item-hover-bg` | `#9ca3af` | Item background on hover |
| `--timeline-item-selected-bg` | `#6b7280` | Selected item background |
| `--timeline-item-height` | `26px` | Item height |
| `--timeline-item-radius` | `2px` | Item border radius |
| **Time Axis** | | |
| `--timeline-axis-bg` | `#ffffff` | Axis background |
| `--timeline-axis-color` | `#1f2937` | Axis text color |
| **Container** | | |
| `--timeline-container-bg` | `#ffffff` | Overall timeline background |
| **Current Time Bar** | | |
| `--timeline-now-bar-color` | `#f59e0b` | Color of the "now" indicator |
| **Scrollbar** | | |
| `--timeline-scrollbar-thumb-color` | `rgba(0,0,0,0.4)` | Scrollbar thumb |
| `--timeline-scrollbar-track-hover-color` | `rgba(0,0,0,0.3)` | Scrollbar track on hover |
| **Zoom Controls** | | |
| `--timeline-controls-bg` | `#f9fafb` | Controls background |
| `--timeline-controls-border-color` | `#e5e7eb` | Controls border |
| `--timeline-controls-button-color` | `#1f2937` | Button icon color |
| `--timeline-controls-button-hover-bg` | `#e5e7eb` | Button background on hover |

**Dark theme example:**

```css
.dark-timeline {
  --timeline-container-bg: #1a1a2e;
  --timeline-axis-bg: #16213e;
  --timeline-axis-color: #e0e0e0;
  --timeline-grid-line-color: #2a2a4a;
  --timeline-row-border-color: #2a2a4a;
  --timeline-row-hover-bg: #2a2a4a;
  --timeline-item-bg: #0f3460;
  --timeline-item-border-color: #533483;
  --timeline-item-hover-bg: #533483;
  --timeline-now-bar-color: #e94560;
}
```

See the **Custom Theme** stories in the [live Storybook](https://sloebel.github.io/react-timeline/) for more examples.

## Synced Scroll

The timeline can be synchronized with an external scrollable element (e.g. a table or list) so they scroll vertically in lockstep and feel like a single unified view.

### How it works

1. **Enable sync scroll** — set `syncScrollOnWheel: true` in `options` so the timeline forwards wheel events.
2. **Listen to scroll** — use `options.onScroll` to receive the timeline's `scrollTop` value and apply it to your external list.
3. **Push scroll back** — when the external list scrolls, call `ref.scrollTo(scrollTop)` to keep the timeline aligned.

```tsx
const timelineRef = useRef<TimelinePublicApi>(null);

const handleTimelineScroll = (scrollTop: number) => {
  externalListRef.current?.scrollToPosition({ scrollTop });
};

const handleListScroll = ({ scrollTop }: { scrollTop: number }) => {
  timelineRef.current?.scrollTo(scrollTop);
};

<Timeline
  ref={timelineRef}
  rows={rows}
  options={{
    ...options,
    syncScrollOnWheel: true,
    onScroll: handleTimelineScroll,
  }}
/>
```

For row hover synchronization across both components, use `options.onRowHover` along with direct DOM class manipulation to avoid unnecessary re-renders.

See the **Synced Table** story in the [live Storybook](https://sloebel.github.io/react-timeline/) for a full working example with `react-virtualized` List, bidirectional hover, and scroll shadows.

## Storybook Examples

All examples are available in the [live Storybook](https://sloebel.github.io/react-timeline/).

| Story | Description |
|-------|-------------|
| **Primary** | Basic timeline with rows and items |
| **Fit Range** | Demonstrates `fitRange` via the public API |
| **With Empty Rows** | Rows without items |
| **With Cluster** | Overlapping items grouped into clusters |
| **Dark Theme** | Full dark theme via CSS variable overrides |
| **Colored Items** | Per-item custom colors |
| **Compact Layout** | Smaller rows and items via variable overrides |
| **Synced Table** | Bidirectional scroll and hover sync with a virtualized table |

## Development

```bash
npm install          # install dependencies
npm run storybook    # start Storybook dev server on port 6006
npm run build        # build the library (Vite)
npm run test         # run tests (Vitest)
npm run lint         # lint with ESLint
npm run typecheck    # type-check with TypeScript
```

## License

[MIT](LICENSE)
