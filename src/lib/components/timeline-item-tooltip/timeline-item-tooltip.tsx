import { useEffect, useMemo, useRef, useState } from "react";

import ReactDOM from "react-dom";
import classNames from "classnames";
import { usePopper } from "react-popper";
import type { Placement } from "@popperjs/core/lib/enums";
import isFunction from "lodash/isFunction";

import useClickOutside from "../../hooks/use-click-outside";
import type { TimeLineClusterItem, TimelineItem } from "../../types";
import type { TooltipRenderFunction } from "../../types";
import { ToolTipPlacement } from "./timeline-item-tooltip.types";

import styles from "./timeline-item-tooltip.module.scss";

const DEFAULT_TOOLTIP_PLACE: Placement = "top";

const ARROW_SHADOW_WIDTH = 3;
const ARROW_SIZE = +styles.arrowSize + ARROW_SHADOW_WIDTH;

export interface Props {
  item?: TimelineItem | TimeLineClusterItem;
  tooltipRender?: TooltipRenderFunction;
  targetElement: HTMLElement | null;
  removeTooltip: () => void;
  shouldShowTooltipArrow: boolean;
  tooltipContainerSelector?: string;
}

const TimeLineItemTooltip = ({
  item,
  targetElement,
  tooltipRender,
  removeTooltip,
  shouldShowTooltipArrow,
  tooltipContainerSelector,
}: Props) => {
  const popperElement = useRef<HTMLDivElement>(null);
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null);
  const updateRef = useRef<(() => Promise<Partial<unknown>>) | null>(null);
  const shouldRenderTooltip =
    targetElement && !!item && isFunction(tooltipRender);
  const items = useMemo(
    () =>
      item && "items" in item ? (item as TimeLineClusterItem).items : [item],
    [item],
  );

  useClickOutside(
    [popperElement.current, targetElement],
    !!(shouldRenderTooltip && shouldShowTooltipArrow),
    removeTooltip,
  );

  const popper = usePopper(targetElement, popperElement.current, {
    placement: DEFAULT_TOOLTIP_PLACE,
    modifiers: [
      {
        name: "flip",
        options: {
          fallbackPlacements: [
            ToolTipPlacement.Left,
            ToolTipPlacement.Right,
            ToolTipPlacement.Top,
          ],
        },
      },
      {
        name: "offset",
        options: {
          offset: [0, ARROW_SIZE],
        },
      },
      {
        name: "arrow",
        options: {
          element: arrowElement,
        },
      },
    ],
  });
  const { attributes } = popper;
  const popperStyle = popper.styles;
  const { update } = popper;

  useEffect(() => {
    updateRef.current = update;
  }, [update]);

  const arrowPlace = useMemo(() => {
    if (attributes && attributes.popper) {
      const currentPlace = attributes.popper["data-popper-placement"];
      if (currentPlace?.startsWith(ToolTipPlacement.Left)) {
        return ToolTipPlacement.Right;
      }
      if (currentPlace?.startsWith(ToolTipPlacement.Right)) {
        return ToolTipPlacement.Left;
      }
      if (currentPlace?.startsWith(ToolTipPlacement.Top)) {
        return ToolTipPlacement.Bottom;
      }
      if (currentPlace?.startsWith(ToolTipPlacement.Bottom)) {
        return ToolTipPlacement.Top;
      }
    }
    return "";
  }, [attributes]);

  const tooltipContent = useMemo(() => {
    if (!shouldRenderTooltip || !tooltipRender) return null;

    return tooltipRender(items as TimelineItem[], {
      removeTooltip,
      redrew: () =>
        updateRef.current ? updateRef.current() : Promise.resolve({}),
    });
  }, [shouldRenderTooltip, tooltipRender, items, removeTooltip]);

  const container =
    (tooltipContainerSelector &&
      document.querySelector(`.${tooltipContainerSelector}`)) ||
    document.body;

  return (
    <>
      {ReactDOM.createPortal(
        <div
          ref={popperElement}
          className={classNames(styles.tooltipContainer, styles[arrowPlace])}
          style={popperStyle.popper}
          {...attributes.popper}
        >
          {shouldRenderTooltip && (
            <>
              {tooltipContent}
              {shouldShowTooltipArrow && (
                <div
                  ref={setArrowElement}
                  data-popper-arrow
                  data-testid="tooltip-arrow"
                  className={styles.tooltipArrow}
                  style={popperStyle.arrow}
                />
              )}
            </>
          )}
        </div>,
        container,
      )}
    </>
  );
};

export default TimeLineItemTooltip;
