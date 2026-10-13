import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { mockArlasSettingsService } from '@app/test/arlas-settings.service.mock';
import { mockArlasStartupService } from '@app/test/arlas-startup.service.mock';
import { mockCollectionService } from '@app/test/collection.service.mock';
import { mockPersistenceService } from '@app/test/persistence.service.mock';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { CollectionService } from '@services/collection-service/collection.service';
import { AwcColorGeneratorLoader, ColorGeneratorLoader, ColorGeneratorModule } from 'arlas-web-components';
import { ArlasSettingsService, ArlasStartupService, ArlasTaskService, GET_OPTIONS, PersistenceService } from 'arlas-wui-toolkit';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { LeftMenuComponent } from './left-menu.component';

describe('LeftMenuComponent', () => {
    let component: LeftMenuComponent;
    let fixture: ComponentFixture<LeftMenuComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                LeftMenuComponent,
                LoggerModule.forRoot(null),
                ColorGeneratorModule.forRoot({
                    loader: {
                        provide: ColorGeneratorLoader,
                        useClass: AwcColorGeneratorLoader
                    }
                }),
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
                }),
                RouterModule.forRoot([])
            ],
            providers: [
                ArlasTaskService,
                {
                    provide: GET_OPTIONS,
                    useValue: () => { }
                },
                {
                    provide: ArlasStartupService,
                    useValue: mockArlasStartupService
                },
                {
                    provide: CollectionService,
                    useValue: mockCollectionService
                },
                {
                    provide: PersistenceService,
                    useValue: mockPersistenceService
                },
                {
                    provide: ArlasSettingsService,
                    useValue: mockArlasSettingsService
                }
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(LeftMenuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
