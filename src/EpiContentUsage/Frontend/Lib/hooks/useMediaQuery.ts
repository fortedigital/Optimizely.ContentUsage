import { useCallback, useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  const handleMediaQueryChange = useCallback(
    (event: MediaQueryListEvent) => setMatches(event.matches),
    []
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia(query);
      setMatches(mediaQuery.matches);

      mediaQuery.addEventListener("change", handleMediaQueryChange);

      return () =>
        mediaQuery.removeEventListener("change", handleMediaQueryChange);
    }

    return undefined;
  }, []);

  return matches;
}
