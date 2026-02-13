import React, { useEffect, useRef, useState } from 'react';

import classNames from 'classnames';

import styles from './item.module.scss';

interface ItemOptions {
  itemId: string | number;
  content?: React.ReactNode;
  selectedClassName?: string;
  clickable?: boolean;
  backgroundItem?: boolean;
  start: number;
  end: number;
}

interface Props {
  style: React.CSSProperties;
  className?: string;
  itemOptions: ItemOptions;
  onClick: (
    itemElement: HTMLDivElement | null,
    event: React.MouseEvent<HTMLDivElement>
  ) => void;
  selected: boolean;
}

const widthBuffer = 4;
const shouldHide = (contentWidth: number, itemWidth: number) =>
  contentWidth + widthBuffer > itemWidth || 0;

const Item = ({
  style,
  itemOptions,
  onClick,
  selected,
  className,
}: Props) => {
  const {
    itemId,
    content,
    clickable = true,
    selectedClassName,
    backgroundItem = false,
    start,
    end,
  } = itemOptions;
  const ref = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [hideContent, setHideContent] = useState(true);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!clickable) return;
    onClick(ref.current, event);
  };

  useEffect(() => {
    if (
      content &&
      contentRef.current &&
      shouldHide(contentRef.current.clientWidth, style.width as number)
    ) {
      setHideContent(true);
    } else {
      setHideContent(false);
    }
  }, [style.width, content]);

  return (
    <div
      ref={ref}
      data-testid={`timeline${backgroundItem ? '-background' : ''}-item-${itemId}`}
      className={classNames(
        className,
        styles.item,
        { [styles.selected]: selected },
        { [styles.clickable]: clickable },
        selectedClassName && selected ? selectedClassName : '',
        { [styles.backgroundItem]: backgroundItem }
      )}
      style={style}
      onClick={handleClick}
      data-start={new Date(start).toISOString()}
      data-end={new Date(end).toISOString()}
      data-clickable={clickable || undefined}
    >
      <span
        ref={contentRef}
        style={{ visibility: hideContent ? 'hidden' : 'visible' }}
      >
        {content}
      </span>
    </div>
  );
};

export default Item;
