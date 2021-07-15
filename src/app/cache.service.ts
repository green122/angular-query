import { Injectable } from '@angular/core';

class QueryCacheEntry<T> {
  private gcId: number | undefined;

  constructor(private data: T, cacheTime: number) {
    this.scheduleGC(cacheTime);
  }

  private scheduleGC(time: number) {

  }
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  cache: Record<string, any> = {};

  constructor() { }
}
