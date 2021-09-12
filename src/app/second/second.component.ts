import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs/operators';
import { HttpQueryService } from '../http-query.service';

@Component({
  selector: 'app-second',
  templateUrl: './second.component.html',
  styleUrls: ['./second.component.scss'],
})
export class SecondComponent implements OnInit {
  query = this.queryService.createQuery({
    key: (id: string) => `person${id}`,
    query: id => // already auto-infered as string
      this.httpClient.get<{ name: string }>(
        `https://swapi.dev/api/people/${id}`
      ),
      cacheTime: 10000
  });
  id = '';
  constructor(
    private queryService: HttpQueryService,
    private httpClient: HttpClient,
    private route: ActivatedRoute
  ) {
    this.id = route.snapshot.params.id;
  }

  ngOnInit(): void {
    this.query.fetch(this.id);
  }
}
