import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import {
  HttpQueryService,
  QueryResult,
  QueryState,
} from './http-query.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'lib-query';
  query$: Observable<QueryState<{ name: string }>>;

  trigger$ = new Subject<string>();

  fetch: (id?: string) => void;

  constructor(
    private httpQuery: HttpQueryService,
    private httpClient: HttpClient
  ) {
    const createdPeopleQuery = this.httpQuery.createQuery({
      key: 'starwarspeople',
      query: (id: string) =>
        this.httpClient.get<{ name: string }>(
          `https://swapi.dev/api/people/${id}`
        ),
      trigger: this.trigger$,
    });

    const createdShipQuery = this.httpQuery.createQuery({
      key: 'starwarspeople',
      query: (arg: { name: string }) => {
        console.log(arg);
        return this.httpClient.get<{ name: string }>(
          `https://swapi.dev/api/ships`
        );
      },
      trigger: createdPeopleQuery.data$,
    });
    this.query$ = createdPeopleQuery.state$;
    this.fetch = createdPeopleQuery.fetch;

    createdShipQuery.state$.subscribe(console.log);
  }

  ngOnInit() {
    // this.query$.subscribe(console.log);
    this.fetch('1');

    setTimeout(() => this.trigger$.next('3'), 3000);
  }
}
