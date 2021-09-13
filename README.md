# LibQuery

Library to make asyncronous requests easily managed and consumed;

Motivation

Before :
```ts

    data: SomeData;
    loading: boolean;
    errorLoading: string;

    ngOnInit() {
        this.loading = true;
        this.httpService.get('/something/${this.id}').subscribe(
            resp => {
                this.data = response;
                this.loading = false;
            },
            err => {
                this.loading = false;
                this.errorLoading = err.message // or something else
            }
        );
    // What if you need to chain the second request ?
    // What if you neeed to save data ? We have to add a lot of the similar logic
    // Caching ?
    

    }

```

Now :

```ts
    query = this.httpQuery.createQuery(
        key: 'my-super-data', // it's a cache key - we may pass string or function if need a complex one
        query: (id: string) => {
            return this.httpService.get('/something/${this.id}'
        },
        initialData: skeletonData, // more on it later - we can introduce a very convenient way to work with the skeletons
        cacheTime: 3000 // 0 by default (no caching), but we can make it configurable
    );

    ngOnInit() {
        // or any other place
        this.query.fetch('superId'); // type of an argument is checked and safe )
    }

```

and inside the template

```html
<ng-container *ngIf="query.state$ | async as query">
    <div *ngIf="query.loading">...Loading...</div>
    <div *ngIf="query.data as data">
        {{data.superfield}}
      // render data 
      </div>
    </div>
    <div *ngIf="query.error">{{ query.error }}</div>
  </ng-container>

```

if we have to send `mutation` request, like `POST`, `PUT` etc. in an another component and the we want to get fresh data for first component:

```ts
    querySecond = this.httpQuery.createQuery({
        key: 'second',
        query: (id: string) => this.httpService.delete(`route-${id}`)
    })

    querySecond.data$.pipe(tap(() => this.httpQuery.invalidateCachedQuery('my-super-data'))) /// so my-super-data would be refetched when we return to the first component
```

or even better )

```ts
    query.refetch('let-it-be-the-same-id'); // It'd ignore the cached value
```

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.2.12.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
