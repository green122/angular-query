import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { pluck } from 'rxjs/operators';
import { HttpQueryService } from '../http-query.service';

interface People {
  birth_year: string;
  eye_color: string;
  films: string[];
  gender: string;
  hair_color: string;
  height: string;
  homeworld: string;
  mass: string;
  name: string;
  skin_color: string;
  created: Date;
  edited: Date;
  species: string[];
  starships: string[];
  url: string;
  vehicles: string[];
}

@Component({
  selector: 'app-first',
  templateUrl: './first.component.html',
  styleUrls: ['./first.component.scss'],
})
export class FirstComponent implements OnInit {
  queryAllPeople = this.httpQuery.createQuery({
    key: 'all-people',
    query: () =>
      this.httpClient
        .get<{ results: People[] }>(`https://swapi.dev/api/people/`)
        .pipe(pluck('results')),
    cacheTime: 4000
  });

  constructor(
    private httpClient: HttpClient,
    private httpQuery: HttpQueryService
  ) {}

  ngOnInit(): void {
    this.queryAllPeople.fetch();
  }
}
