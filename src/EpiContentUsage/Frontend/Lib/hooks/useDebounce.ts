import { useMemo } from "react";
import { DependencyList } from "react";
import { debounce } from "../../Utils/debounce";

export function useDebounce<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number,
  deps: DependencyList
) {
  return useMemo(() => debounce(callback, delay), deps);
}
