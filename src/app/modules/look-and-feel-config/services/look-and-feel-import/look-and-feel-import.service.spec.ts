import { TestBed } from '@angular/core/testing';

import { LookAndFeelImportService } from './look-and-feel-import.service';

describe('LookAndFeelImportService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LookAndFeelImportService = TestBed.get(LookAndFeelImportService);
    expect(service).toBeTruthy();
  });
});
