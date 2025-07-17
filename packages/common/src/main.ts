export const isEmpty = (data: unknown) => data === null || data === undefined;

export const isObject = (data: unknown) => data && typeof data === 'object';

export const isBlank = (data: unknown) =>
  isEmpty(data) ||
  (Array.isArray(data) && data.length === 0) ||
  (isObject(data) && Object.keys(data).length === 0) ||
  (typeof data === 'string' && data.trim().length === 0);
