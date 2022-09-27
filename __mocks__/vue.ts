const container: Record<symbol, any> = {};

export * from 'vue';

export function provide(key, value) {
  container[key] = value;
}
export function inject(key, fallback) {
  if (key in container) return container[key];
  return fallback;
}
