import { TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { MapGlobalFormBuilderService } from './map-global-form-builder.service';

describe('MapGlobalFormBuilderService', () => {
    let service: MapGlobalFormBuilderService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                LoggerModule.forRoot(null),
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
                }),
            ]
        });

        service = TestBed.inject(MapGlobalFormBuilderService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });
});
