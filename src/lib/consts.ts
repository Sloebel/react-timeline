import mixins from './styles/mixins.module.scss';

export const timeAxisHeight = +mixins.timelineAxisHeight || 72;
export const rowHeight = +mixins.gridRowHeight || 32;

export const minutesInHour = 60;
export const zoomStep = minutesInHour;
export const hourInMili = 3600000;
export const oneMinute = 60 * 1000;
export const oneDay = 24 * 60 * oneMinute;
