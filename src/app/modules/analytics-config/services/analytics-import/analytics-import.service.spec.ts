import { TestBed } from '@angular/core/testing';
import { mockArlasStartupService } from '@app/test/arlas-startup.service.mock';
import { mockCollectionService } from '@app/test/collection.service.mock';
import { CollectionService } from '@services/collection-service/collection.service';
import { AwcColorGeneratorLoader, ColorGeneratorLoader, ColorGeneratorModule } from 'arlas-web-components';
import { ArlasStartupService } from 'arlas-wui-toolkit';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { AnalyticsImportService } from './analytics-import.service';

describe('AnalyticsImportService', () => {
    let service: AnalyticsImportService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                LoggerModule.forRoot(null),
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
                    provide: CollectionService,
                    useValue: mockCollectionService
                }
            ]
        });

        service = TestBed.inject(AnalyticsImportService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });
});
