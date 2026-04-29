import { TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { SwimlaneFormBuilderService } from './swimlane-form-builder.service';

describe('SwimlaneFormBuilderService', () => {
    let service: SwimlaneFormBuilderService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                LoggerModule.forRoot(null),
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
                }),
            ]
        });

        service = TestBed.inject(SwimlaneFormBuilderService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });
});
