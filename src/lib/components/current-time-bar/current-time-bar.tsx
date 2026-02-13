import React, { useEffect, useState } from "react";

import classNames from "classnames";

import { hourInMili, oneMinute } from "../../consts";

import styles from "./current-time-bar.module.scss";

interface Props {
  rangeStart: number;
  zoom: number;
  topBar?: boolean;
}

const CurrentTimeBar = ({ rangeStart, zoom, topBar = false }: Props) => {
  const [left, setLeft] = useState<number>(0);

  const calculateBarLocation = () => {
    const now = new Date();
    setLeft(((now.valueOf() - rangeStart) / hourInMili) * zoom);
  };

  useEffect(() => {
    calculateBarLocation();
    const interval = setInterval(calculateBarLocation, oneMinute);
    return () => clearInterval(interval);
  }, [rangeStart, zoom]);

  return (
    <div
      className={classNames(styles.currentTimeBar, {
        [styles.topBar]: topBar,
      })}
      style={{ transform: `translateX(${left}px)` }}
    />
  );
};

export default React.memo(CurrentTimeBar);
