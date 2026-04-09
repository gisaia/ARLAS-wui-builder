import { TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { AwcColorGeneratorLoader, ColorGeneratorLoader, ColorGeneratorModule } from 'arlas-web-components';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { PowerbarFormBuilderService } from './powerbar-form-builder.service';

describe('PowerbarFormBuilderService', () => {
    let service: PowerbarFormBuilderService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                LoggerModule.forRoot(null),
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
                }),
                ColorGeneratorModule.forRoot({
                    loader: {
                        provide: ColorGeneratorLoader,
                        useClass: AwcColorGeneratorLoader
                    }
                }),
            ]
        });

        service = TestBed.inject(PowerbarFormBuilderService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });
});
