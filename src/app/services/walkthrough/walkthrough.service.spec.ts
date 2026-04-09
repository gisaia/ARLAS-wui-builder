import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { WalkthroughService } from './walkthrough.service';

describe('WalkthroughService', () => {
    let service: WalkthroughService;

    beforeEach(() => {
        TestBed.configureTestingModule({});

        service = TestBed.inject(WalkthroughService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });
});
