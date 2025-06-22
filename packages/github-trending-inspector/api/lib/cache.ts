class SimpleCache<T> {
  private cache = new Map<
    string,
    { data: T; _cachedAt: number; maxAge: number }
  >();
  private _maxSize: number;
  private defaultMaxAge: number;

  constructor(options: { maxSize: number; maxAge?: number }) {
    this._maxSize = options.maxSize;
    this.defaultMaxAge = options.maxAge || 24 * 60 * 60 * 1000;
  }

  set(key: string, value: T, options?: { maxAge?: number }) {
    if (this.cache.size >= this._maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data: value,
      _cachedAt: Date.now(),
      maxAge: options?.maxAge || this.defaultMaxAge,
    });
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() - entry._cachedAt > entry.maxAge) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

export const cache = new SimpleCache<any>({
  maxSize: 500,
  maxAge: 24 * 60 * 60 * 1000,
});
