import { useEffect } from 'react';

const useClickOutside = (
  elements: (HTMLElement | null)[],
  isRefVisible: boolean,
  callback: () => void
) => {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isRefVisible &&
        elements.every((el) => !el?.contains(event.target as Node))
      ) {
        callback();
        document.removeEventListener('mousedown', handleClickOutside);
      }
    }

    if (isRefVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [elements, isRefVisible, callback]);
};

export default useClickOutside;
