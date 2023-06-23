import { useMemo } from "react";
import { DependencyList } from "react";
import { debounce } from "../../Utils/debounce";

export function useDebounce<Arg>(
  callback: (...args: Arg[]) => void,
  delay: number,
  deps: DependencyList
) {
  return useMemo(() => debounce(callback, delay), deps);
}
