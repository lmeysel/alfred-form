export function unflatten(flatObject: Record<string, any>) {
  const entries = Object.entries(flatObject).sort(([a], [b]) => a.localeCompare(b));
  const result: Record<string, any> = {};

  for (const [key, value] of entries) {
    const segments = key.split('.');
    const last = segments.pop();
    if (!last) throw Error(`Cannot unflatten key "${key}". Invalid nullish or empty segment.`);
    let obj = result;
    for (const segment of segments) {
      if (!segment) throw Error(`Cannot unflatten key "${key}". Invalid nullish or empty segment.`);
      if (!(segment in obj)) obj[segment] = {};
      else if (typeof obj[segment] !== 'object')
        throw Error(`Cannot unflatten key "${key}" as it already the object path already contains a non-object value.`);
      obj = obj[segment];
    }
    obj[last] = value;
  }
  return result;
}

function _flatten(deepObject: Record<string, any>, path: string, target: Record<string, any>) {
  const entries = Object.entries(deepObject);
  for (const [key, value] of entries)
    if (typeof value === 'object') _flatten(value, `${path}.${key}`, target);
    else target[`${path}.${key}`] = value;
}
export function flatten(deepObject: Record<string, any>) {
  const target: Record<string, string> = {};
  const entries = Object.entries(deepObject);
  for (const [key, value] of entries)
    if (typeof value === 'object') _flatten(value, key, target);
    else target[key] = value;
  return target;
}
