import { TestBed } from '@angular/core/testing';

import { HttpQueryService } from './http-query.service';

describe('HttpQueryService', () => {
  let service: HttpQueryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HttpQueryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
