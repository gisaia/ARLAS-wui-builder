import { TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { SideModulesGlobalFormBuilderService } from './side-modules-global-form-builder.service';

describe('SideModulesGlobalFormBuilderService', () => {
    let service: SideModulesGlobalFormBuilderService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                LoggerModule.forRoot(null),
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
                }),
            ]
        });

        service = TestBed.inject(SideModulesGlobalFormBuilderService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });
});
