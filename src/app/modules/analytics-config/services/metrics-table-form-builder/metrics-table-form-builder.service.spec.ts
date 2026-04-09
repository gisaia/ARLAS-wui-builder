import { TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { MetricsTableFormBuilderService } from './metrics-table-form-builder.service';

describe('MetricsTableFormBuilderService', () => {
    let service: MetricsTableFormBuilderService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                LoggerModule.forRoot(null),
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
                }),
            ]
        });

        service = TestBed.inject(MetricsTableFormBuilderService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });
});
