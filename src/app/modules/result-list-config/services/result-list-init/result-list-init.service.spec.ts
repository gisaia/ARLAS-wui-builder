import { TestBed } from '@angular/core/testing';

import { ResultListInitService } from './result-list-init.service';

describe('ResultListInitService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ResultListInitService = TestBed.get(ResultListInitService);
    expect(service).toBeTruthy();
  });
});
