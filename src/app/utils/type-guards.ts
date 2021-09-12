type FunctionType = (...args: any) => any;

export const isFunction = (arg: unknown): arg is FunctionType => {
  return typeof arg === 'function';
};

export const notIsNull = <T>(arg: T | null): arg is T => {
  return arg !== null;
};

export const isDefined = <T>(arg: T | undefined): arg is T => {
  return typeof arg !== 'undefined';
};

export const isPropertyDefined =
  <T, K extends keyof T>(prop: K) =>
  (arg: T): arg is T => {
    return isDefined(arg[prop]);
  };
