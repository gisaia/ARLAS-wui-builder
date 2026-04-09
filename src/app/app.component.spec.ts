import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { CollectionService } from '@services/collection-service/collection.service';
import { OAuthModule } from 'angular-oauth2-oidc';
import { AwcColorGeneratorLoader, ColorGeneratorLoader, ColorGeneratorModule } from 'arlas-web-components';
import { ArlasSettingsService, ArlasStartupService, PersistenceService } from 'arlas-wui-toolkit';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppComponent } from './app.component';
import { mockArlasSettingsService } from './test/arlas-settings.service.mock';
import { mockArlasStartupService } from './test/arlas-startup.service.mock';
import { mockCollectionService } from './test/collection.service.mock';
import { mockPersistenceService } from './test/persistence.service.mock';

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                AppComponent,
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
                OAuthModule.forRoot(),
                RouterModule.forRoot([]),
                BrowserAnimationsModule
            ],
            providers: [
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

        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it(`should have as title 'ARLAS Wui builder'`, () => {
        expect(component.title).toEqual('ARLAS-wui-builder');
    });
});
