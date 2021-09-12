import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { pluck, tap } from 'rxjs/operators';
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
  trigger$ = new Subject<string>();

  createdShipQuery = this.httpQuery.createQuery({
    key: 'starwarsship',
    query: (arg: { name: string }) => {
      return this.httpClient.get<{ name: string }>(
        `https://swapi.dev/api/starships`
      );
    },
    cacheTime: 15000,
  });

  constructor(
    private httpQuery: HttpQueryService,
    private httpClient: HttpClient
  ) {}

  ngOnInit() {
    this.createdShipQuery.data$.subscribe(console.log);
    this.createdShipQuery.fetch({ name: 'just an example' });
    setTimeout(() => {
      console.log('cache is invalidated and the new request is made');
      this.createdShipQuery.refetch({ name: 'just an example1' })
    }, 5000);
  }
}
