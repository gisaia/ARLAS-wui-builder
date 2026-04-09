import { TestBed } from '@angular/core/testing';
import { mockArlasStartupService } from '@app/test/arlas-startup.service.mock';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { ArlasStartupService } from 'arlas-wui-toolkit';
import { beforeEach, describe, expect, it } from 'vitest';
import { StartupService } from './startup.service';

describe('StartupService', () => {
    let service: StartupService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
                }),
            ],
            providers: [
                {
                    provide: ArlasStartupService,
                    useValue: mockArlasStartupService
                }
            ]
        });

        service = TestBed.inject(StartupService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });
});
