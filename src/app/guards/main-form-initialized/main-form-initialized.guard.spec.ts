import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { MainFormInitializedGuard } from './main-form-initialized.guard';

describe('MainFormInitializedGuard', () => {
    let guard: MainFormInitializedGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({});

        guard = TestBed.inject(MainFormInitializedGuard);
    });

    it('should create', () => {
        expect(guard).toBeTruthy();
    });
});
