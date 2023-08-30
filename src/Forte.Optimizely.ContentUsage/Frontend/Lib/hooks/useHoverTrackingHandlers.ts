import { useState, useMemo } from "react";

export type HoverTrackingHook = [
    isHovered: boolean,
    handlers: HoverHandlers
]

export interface HoverHandlers {
  enter: () => void;
  out: () => void;
}

export function useHoverTrackingHandlers(): HoverTrackingHook {
  const [isHovered, setIsHovered] = useState(false);

  const urlHoveredHandlers = useMemo<HoverHandlers>(() => {
    return {
      enter: () => setIsHovered(true),
      out: () => setIsHovered(false),
    };
  }, []);

  return [isHovered, urlHoveredHandlers];
}
