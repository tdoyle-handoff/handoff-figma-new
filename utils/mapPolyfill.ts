// Map polyfill to prevent "Map is not a constructor" errors
// This ensures Map is available in all environments

export function ensureMapConstructor() {
  // Check if Map is available and working properly
  if (typeof Map === 'undefined') {
    console.error('Map constructor not available, creating polyfill');
    // Simple Map polyfill for older environments
    (global as any).Map = class MapPolyfill<K, V> {
      private _keys: K[] = [];
      private _values: V[] = [];

      constructor() {}

      has(key: K): boolean {
        return this._keys.includes(key);
      }

      get(key: K): V | undefined {
        const index = this._keys.indexOf(key);
        return index !== -1 ? this._values[index] : undefined;
      }

      set(key: K, value: V): this {
        const index = this._keys.indexOf(key);
        if (index !== -1) {
          this._values[index] = value;
        } else {
          this._keys.push(key);
          this._values.push(value);
        }
        return this;
      }

      delete(key: K): boolean {
        const index = this._keys.indexOf(key);
        if (index !== -1) {
          this._keys.splice(index, 1);
          this._values.splice(index, 1);
          return true;
        }
        return false;
      }

      clear(): void {
        this._keys = [];
        this._values = [];
      }

      get size(): number {
        return this._keys.length;
      }

      keyIterator(): IterableIterator<K> {
        return this._keys[Symbol.iterator]();
      }

      valueIterator(): IterableIterator<V> {
        return this._values[Symbol.iterator]();
      }

      entries(): IterableIterator<[K, V]> {
        const entries: [K, V][] = [];
        for (let i = 0; i < this._keys.length; i++) {
          entries.push([this._keys[i], this._values[i]]);
        }
        return entries[Symbol.iterator]();
      }

      [Symbol.iterator](): IterableIterator<[K, V]> {
        return this.entries();
      }
    };
  } else {
    // Test if Map constructor works properly
    try {
      new Map();
      console.log('✅ Map constructor verified working');
    } catch (error) {
      console.error('Map constructor test failed:', error);
      // Force reload if Map is broken
      window.location.reload();
    }
  }
}

// Alternative implementation using plain objects instead of Map
export class SafeProfileCache {
  private cache: { [key: string]: any } = {};
  private keys: string[] = [];
  private maxSize: number;

  constructor(maxSize: number = 10) {
    this.maxSize = maxSize;
  }

  has(key: string): boolean {
    return key in this.cache;
  }

  get(key: string): any {
    return this.cache[key];
  }

  set(key: string, value: any): void {
    if (!this.has(key)) {
      // Add new key
      if (this.keys.length >= this.maxSize) {
        // Remove oldest entry
        const oldestKey = this.keys.shift();
        if (oldestKey) {
          delete this.cache[oldestKey];
        }
      }
      this.keys.push(key);
    }
    this.cache[key] = value;
  }

  delete(key: string): boolean {
    if (this.has(key)) {
      delete this.cache[key];
      const index = this.keys.indexOf(key);
      if (index > -1) {
        this.keys.splice(index, 1);
      }
      return true;
    }
    return false;
  }

  clear(): void {
    this.cache = {};
    this.keys = [];
  }

  get size(): number {
    return this.keys.length;
  }
}