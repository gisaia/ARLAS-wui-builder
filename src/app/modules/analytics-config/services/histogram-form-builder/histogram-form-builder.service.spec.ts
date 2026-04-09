import { TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { HistogramFormBuilderService } from './histogram-form-builder.service';

describe('HistogramFormBuilderService', () => {
    let service: HistogramFormBuilderService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                LoggerModule.forRoot(null),
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
                }),
            ]
        });

        service = TestBed.inject(HistogramFormBuilderService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });
});
