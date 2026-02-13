import styles from './controls.module.scss';

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

const MinusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <path d="M3 8h10" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

interface Props {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const Controls = ({ onZoomIn, onZoomOut }: Props) => {
  return (
    <div className={styles.controls}>
      <div className={styles.zoomControls}>
        <button
          type="button"
          className={styles.zoomButton}
          onClick={onZoomIn}
          data-testid="timeline-zoom-in-button"
          aria-label="Zoom in"
        >
          <PlusIcon />
        </button>
        <div className={styles.horizontalSeparator} />
        <button
          type="button"
          className={styles.zoomButton}
          onClick={onZoomOut}
          data-testid="timeline-zoom-out-button"
          aria-label="Zoom out"
        >
          <MinusIcon />
        </button>
      </div>
    </div>
  );
};

export default Controls;
