import { TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { SearchGlobalFormBuilderService } from '../search-global-form-builder/search-global-form-builder.service';

describe('SearchGlobalFormBuilderService', () => {
    let service: SearchGlobalFormBuilderService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                LoggerModule.forRoot(null),
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
                }),
            ]
        });

        service = TestBed.inject(SearchGlobalFormBuilderService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });
});
