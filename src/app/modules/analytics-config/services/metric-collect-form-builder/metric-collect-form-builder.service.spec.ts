import { TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { MetricCollectFormBuilderService } from './metric-collect-form-builder.service';

describe('MetricCollectFormBuilderService', () => {
    let service: MetricCollectFormBuilderService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                LoggerModule.forRoot(null),
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
                }),
            ]
        });

        service = TestBed.inject(MetricCollectFormBuilderService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });
});
