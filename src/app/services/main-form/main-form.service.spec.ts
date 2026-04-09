import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { MainFormService } from './main-form.service';

describe('MainFormService', () => {
    let service: MainFormService;

    beforeEach(() => {
        TestBed.configureTestingModule({});

        service = TestBed.inject(MainFormService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });
});
