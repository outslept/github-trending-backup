import { useCallback, useRef } from 'react';

export function useFluidHover<T extends HTMLElement = HTMLElement>() {
  const indicatorRef = useRef<HTMLDivElement>(null);
  const isInsideRef = useRef(false);

  const onItemPointerEnter = useCallback((e: React.PointerEvent<T>) => {
    if (e.pointerType !== 'mouse') return;

    const indicator = indicatorRef.current;
    if (!indicator) return;

    const target = e.currentTarget;
    const top = target.offsetTop;
    const height = target.offsetHeight;

    if (!isInsideRef.current) {
      indicator.style.transition = 'opacity 140ms var(--ease-out)';
      indicator.style.transform = `translate3d(0, ${top}px, 0)`;
      indicator.style.height = `${height}px`;

      void indicator.offsetHeight;
      indicator.style.opacity = '1';
      isInsideRef.current = true;
    } else {
      indicator.style.transition =
        'transform 180ms var(--ease-out), height 180ms var(--ease-out), opacity 140ms var(--ease-out)';
      indicator.style.transform = `translate3d(0, ${top}px, 0)`;
      indicator.style.height = `${height}px`;
      indicator.style.opacity = '1';
    }
  }, []);

  const onContainerPointerLeave = useCallback((e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;

    isInsideRef.current = false;
    const indicator = indicatorRef.current;
    if (indicator) {
      indicator.style.transition = 'opacity 140ms var(--ease-out)';
      indicator.style.opacity = '0';
    }
  }, []);

  const hideIndicator = useCallback(() => {
    isInsideRef.current = false;
    const indicator = indicatorRef.current;
    if (indicator) {
      indicator.style.opacity = '0';
    }
  }, []);

  return {
    indicatorRef,
    onItemPointerEnter,
    onContainerPointerLeave,
    hideIndicator,
  };
}
