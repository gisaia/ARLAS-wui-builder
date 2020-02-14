import { TestBed } from '@angular/core/testing';

import { MainFormService } from './main-form.service';

describe('MainFormService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MainFormService = TestBed.get(MainFormService);
    expect(service).toBeTruthy();
  });
});
