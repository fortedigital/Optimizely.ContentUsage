export function debounce<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number
) {
  let timeoutID: number | undefined;
  let lastArgs: Args | undefined;

  const run = () => {
    if (lastArgs) {
      callback(...lastArgs);
      lastArgs = undefined;
    }
  };

  const debounced = (...args: Args) => {
    clearTimeout(timeoutID);
    lastArgs = args;
    timeoutID = window.setTimeout(run, delay);
  };

  debounced.flush = () => {
    clearTimeout(timeoutID);
    run();
  };

  debounced.cancel = () => {
    clearTimeout(timeoutID);
  };

  return debounced;
}
