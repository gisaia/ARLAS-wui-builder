import { TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { LookAndFeelGlobalFormBuilderService } from './look-and-feel-global-form-builder.service';

describe('LookAndFeelGlobalFormBuilderService', () => {
    let service: LookAndFeelGlobalFormBuilderService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                LoggerModule.forRoot(null),
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
                }),
            ]
        });

        service = TestBed.inject(LookAndFeelGlobalFormBuilderService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });
});
