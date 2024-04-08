export function debounce<Args extends unknown[]>(
  func: (...args: Args) => void,
  duration: number
) {
  let timeout: NodeJS.Timeout | null;

  return function (this: void, ...args: Args) {
    const effect = () => {
      timeout = null;
      return func.apply(this, args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(effect, duration);
  };
}
