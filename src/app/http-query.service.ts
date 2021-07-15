import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
import {
  catchError,
  filter,
  map,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';

type Query<TResponseData, TDependency> =
  | ((dep: TDependency) => Observable<TResponseData>)
  | Observable<TResponseData>;

interface QueryArgs<TResponseData, TDependency> {
  key: string;
  query: Query<TResponseData, TDependency>;
  defaultData?: TResponseData;
  trigger?: Observable<TDependency>;
}

type ErrorStatus = { loading: false; data: null; error: string };

type QueryStatus = 'fetching' | 'error' | 'success';
export type QueryState<T> =
  | { loading: true; data: null; error: null }
  | { loading: false; data?: T; error: null }
  | ErrorStatus;

export interface QueryResult<TResponseData, TDependency = unknown> {
  state$: Observable<QueryState<TResponseData>>;
  data$: Observable<TResponseData>;
  fetch(arg?: TDependency): void;
}

type FunctionType = (...args: any) => any;
const isFunction = (arg: unknown): arg is FunctionType => {
  return typeof arg === 'function';
};

const notIsNull = <T>(arg: T | null): arg is T => {
  return arg !== null;
};

const isDefined = <T>(arg: T | undefined): arg is T => {
  return typeof arg !== 'undefined';
};

const isPropertyDefined =
  <T, K extends keyof T>(prop: K) =>
  (arg: T): arg is T => {
    return isDefined(arg[prop]);
  };

const getRequest$ = <TResponseData, TDependency>(
  query: Query<TResponseData, TDependency>,
  dep: TDependency
) => {
  const request$ = isFunction(query) ? query(dep) : query;
  return request$.pipe(
    map<TResponseData, QueryState<TResponseData>>((response) => ({
      loading: false,
      data: response,
      error: null,
    })),
    startWith<QueryState<TResponseData>>({
      loading: true,
      error: null,
      data: null,
    })
  );
};

@Injectable({
  providedIn: 'root',
})
export class HttpQueryService {
  constructor() {}

  createQuery<TResponseData, TDependency>(
    args: QueryArgs<TResponseData, TDependency>,
    withCache: boolean
  ): QueryResult<TResponseData, TDependency> {
    const subject$ = new BehaviorSubject<
      { variable: TDependency } | undefined
    >(undefined);

    const getQuerySubject = (
      trigger: Observable<{ variable: TDependency } | undefined>
    ) => {
      return trigger.pipe(
        filter(isDefined),
        switchMap(({ variable }) => getRequest$(args.query, variable as TDependency)),
        catchError((error) => {
          return of<ErrorStatus>({
            loading: false,
            data: null,
            error: (error.message as string) || 'something wrong',
          });
        })
      );
    };

    const query$ = args.trigger
      ? getQuerySubject(args.trigger.pipe(map((v) => ({ variable: v }))))
      : getQuerySubject(subject$);

    if (!isFunction(args.query)) {
      subject$.next(undefined);
    }

    return {
      state$: query$,
      data$: query$.pipe(
        map((state) => state.data),
        filter(isDefined),
        filter(notIsNull)
      ),
      fetch(dep: TDependency) {
        subject$.next({ variable: dep });
      },
    };
  }
}
