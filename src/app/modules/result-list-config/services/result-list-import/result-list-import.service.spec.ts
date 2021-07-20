import { TestBed } from '@angular/core/testing';

import { ResultListImportService } from './result-list-import.service';

describe('ResultListImportService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ResultListImportService = TestBed.get(ResultListImportService);
    expect(service).toBeTruthy();
  });
});
