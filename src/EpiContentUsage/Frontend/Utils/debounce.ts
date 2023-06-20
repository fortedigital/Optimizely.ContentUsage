export function debounce<Args extends unknown[]>(
  func: (...args: Args) => void,
  duration: number
) {
  let timeout: NodeJS.Timeout;

  return function (...args: Args) {
    const effect = () => {
      timeout = null;
      return func.apply(this, args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(effect, duration);
  };
}
