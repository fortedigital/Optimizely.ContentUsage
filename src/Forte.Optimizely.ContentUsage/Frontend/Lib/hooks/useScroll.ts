import { useCallback } from "react";

interface ScrollHook {
  scrollTo: <TElement extends HTMLElement = HTMLDivElement>(node: TElement, behavior?: ScrollBehavior, delay?: number) => void;
}

export function useScroll(): ScrollHook {
  const scrollTo = useCallback(<TElement extends HTMLElement = HTMLDivElement>(node: TElement, behavior: ScrollBehavior = 'smooth', delay = 0) => {
    setTimeout(() => {
      node.scrollIntoView({ behavior });
    }, delay);
  }, []);

  return { scrollTo };
}
