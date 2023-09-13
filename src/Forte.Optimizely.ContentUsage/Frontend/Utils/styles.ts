const CLASS_NAME_PREFIX = 'forte-optimizely-content-usage';

export const classNamePrefix = (className?: string) =>
  className ? `${CLASS_NAME_PREFIX}-${className}` : CLASS_NAME_PREFIX;
