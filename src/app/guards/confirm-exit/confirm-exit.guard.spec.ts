import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ConfirmExitGuard } from './confirm-exit.guard';

describe('ConfirmExitGuard', () => {
    let guard: ConfirmExitGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({});

        guard = TestBed.inject(ConfirmExitGuard);
    });

    it('should create', () => {
        expect(guard).toBeTruthy();
    });
});
