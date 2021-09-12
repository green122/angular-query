import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, merge } from 'rxjs';
import {
  catchError,
  filter,
  map,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
import { CacheKey, CacheService } from './cache.service';
import { isDefined, isFunction, notIsNull } from './utils/type-guards';

type Query<TResponseData, TDependency> =
  | ((dep: TDependency) => Observable<TResponseData>)
  | (() => Observable<TResponseData>)
  | Observable<TResponseData>;

interface QueryArgs<TResponseData, TDependency = void> {
  key: CacheKey<TDependency>;
  query: Query<TResponseData, TDependency>;
  defaultData?: TResponseData;
  trigger?: Observable<TDependency>;
  cacheTime?: number;
}

type ErrorStatus = { loading: false; data: null; error: string };

type QueryStatus = 'fetching' | 'error' | 'success'; //reserved
export type QueryState<T> =
  | { loading: true; data: null; error: null }
  | { loading: false; data?: T; error: null }
  | ErrorStatus;

export interface QueryResult<TResponseData, TDependency = void> {
  state$: Observable<QueryState<TResponseData>>;
  data$: Observable<TResponseData>;
  fetch: (arg: TDependency) => Observable<TResponseData>;
  refetch: (arg: TDependency) => Observable<TResponseData>;
}

const mapToResponse = <T>(data: T): QueryState<T> => ({
  loading: false,
  data,
  error: null,
});

const DEFAULT_CACHE_TIME = 3000;

@Injectable({
  providedIn: 'root',
})
export class HttpQueryService {
  constructor(private cacheService: CacheService) {}

  getRequest$<TResponseData, TDependency>({
    key,
    query,
    dep,
    cacheTime
  }: {
    key: CacheKey<TDependency>;
    query: Query<TResponseData, TDependency>;
    dep: TDependency;
    cacheTime: number
  }): Observable<QueryState<TResponseData>> {
    const fromCache = this.cacheService.find(key, dep) as TResponseData;
    if (fromCache) {
      return of(fromCache).pipe(map(mapToResponse));
    }
    const request$ = isFunction(query) ? query(dep) : query;
    return request$.pipe(
      tap((response) => this.cacheService.save({ rawKey: key, data: response, dep, cacheTime })),
      map(mapToResponse),
      startWith({
        loading: true,
        error: null,
        data: null,
      })
    );
  }

  createQuery<TResponseData, TDependency = void>(
    {key, query, trigger, cacheTime = DEFAULT_CACHE_TIME}: QueryArgs<TResponseData, TDependency>,
  ): QueryResult<TResponseData, TDependency> {
    const subject$ = new BehaviorSubject<{ variable: TDependency } | undefined>(
      undefined
    );

    const getQuerySubject = (
      trigger: Observable<{ variable: TDependency } | undefined>
    ) => {
      return trigger.pipe(
        filter(isDefined),
        switchMap(({ variable }) =>
          this.getRequest$({ key, query, dep: variable, cacheTime })
        ),
        shareReplay(1),
        catchError((error) => {
          return of<ErrorStatus>({
            loading: false,
            data: null,
            error: (error.message as string) || 'something wrong',
          });
        })
      );
    };

    const trigger$ =trigger
      ? merge(trigger.pipe(map((v) => ({ variable: v }))), subject$)
      : subject$;

    const query$ = getQuerySubject(trigger$);

    if (!isFunction(query)) {
      subject$.next(undefined);
    }

    const data$ = query$.pipe(
      map((state) => state.data),
      filter(isDefined),
      filter(notIsNull)
    );

    const fetch = (dep: TDependency) => {
      subject$.next({ variable: dep });
      return data$;
    };

    const refetch = (dep: TDependency) => {
      this.invalidateCachedQuery(key, dep);
      subject$.next({ variable: dep });
      return data$;
    };

    return {
      state$: query$,
      data$,
      fetch,
      refetch,
    };
  }

  invalidateCachedQuery<TDependency = void>(
    key: CacheKey<TDependency>,
    dep: TDependency
  ) {
    this.cacheService.remove(key, dep);
  }
}
