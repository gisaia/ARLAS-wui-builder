import { TestBed } from '@angular/core/testing';
import { mockArlasStartupService } from '@app/test/arlas-startup.service.mock';
import { mockPersistenceService } from '@app/test/persistence.service.mock';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { AwcColorGeneratorLoader, ColorGeneratorLoader, ColorGeneratorModule } from 'arlas-web-components';
import { ArlasStartupService, PersistenceService } from 'arlas-wui-toolkit';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { MainFormManagerService } from './main-form-manager.service';

describe('MainFormManagerService', () => {
    let service: MainFormManagerService;

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
            ],
            providers: [
                {
                    provide: ArlasStartupService,
                    useValue: mockArlasStartupService
                },
                {
                    provide: PersistenceService,
                    useValue: mockPersistenceService
                }
            ]
        });

        service = TestBed.inject(MainFormManagerService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });
});
