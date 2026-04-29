import { TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { BucketsIntervalFormBuilderService } from './buckets-interval-form-builder.service';

describe('BucketsIntervalFormBuilderService', () => {
    let service: BucketsIntervalFormBuilderService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                LoggerModule.forRoot(null),
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
                }),
            ]
        });

        service = TestBed.inject(BucketsIntervalFormBuilderService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });
});
