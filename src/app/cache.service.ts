import { Injectable } from '@angular/core';
import { isFunction } from './utils/type-guards';

export type CacheKey<TDependency> = string | ((dep: TDependency) => string);
export type CacheMap<Key, Entry> = Map<Key, Entry>;

class QueryCacheEntry<T = any, Dependency = unknown> {
  private gcId: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private cacheService: CacheService,
    private data: T,
    private key: string,
    private cacheTime: number
  ) {
    this.scheduleGC();
  }

  private scheduleGC() {
    this.gcId = setTimeout(() => {
      this.cacheService.remove(this.key, undefined);
      this.gcId = undefined;
    }, this.cacheTime);
  }

  getData(): T {
    return this.data;
  }
}

function stringify<Dependency>(
  key: CacheKey<Dependency>,
  dep: Dependency
): string {
  return isFunction(key) ? key(dep) : key;
}
@Injectable({
  providedIn: 'root',
})
export class CacheService {
  cache: CacheMap<string, QueryCacheEntry> = new Map();

  constructor() {
    // TODO: place it only in the debug mode
    (window as any).cache = this.cache;
  }

  find<T, Dependency>(key: CacheKey<Dependency>, dep: Dependency): T {
    return this.cache.get(stringify(key, dep))?.getData();
  }

  save<T, Dependency>({
    rawKey,
    data,
    dep,
    cacheTime,
  }: {
    rawKey: CacheKey<Dependency>;
    data: T;
    dep: Dependency;
    cacheTime: number;
  }): void {
    const key = stringify(rawKey, dep);
    const entry = new QueryCacheEntry<T, Dependency>(
      this,
      data,
      key,
      cacheTime
    );
    this.cache.set(key, entry);
  }

  remove<Dependency>(key: CacheKey<Dependency>, dep: Dependency): void {
    this.cache.delete(stringify(key, dep));
  }
}
