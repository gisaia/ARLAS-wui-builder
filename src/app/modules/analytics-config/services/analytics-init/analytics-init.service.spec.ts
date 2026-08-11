import { TestBed } from '@angular/core/testing';
import { mockArlasStartupService } from '@app/test/arlas-startup.service.mock';
import { ArlasStartupService, ArlasTaskService, GET_OPTIONS } from 'arlas-wui-toolkit';
import { beforeEach, describe, expect, it } from 'vitest';
import { AnalyticsInitService } from './analytics-init.service';

describe('AnalyticsInitService', () => {
    let service: AnalyticsInitService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ArlasTaskService,
                {
                    provide: GET_OPTIONS,
                    useValue: () => { }
                },
                {
                    provide: ArlasStartupService,
                    useValue: mockArlasStartupService
                }
            ]
        });

        service = TestBed.inject(AnalyticsInitService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });
});
