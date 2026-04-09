import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { mockArlasSettingsService } from '@app/test/arlas-settings.service.mock';
import { mockArlasStartupService } from '@app/test/arlas-startup.service.mock';
import { mockPermissionService } from '@app/test/permission.service.mock';
import { mockPersistenceService } from '@app/test/persistence.service.mock';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { OAuthModule } from 'angular-oauth2-oidc';
import { AwcColorGeneratorLoader, ColorGeneratorLoader, ColorGeneratorModule } from 'arlas-web-components';
import { ArlasSettingsService, ArlasStartupService, PermissionService, PersistenceService } from 'arlas-wui-toolkit';
import { LoggerModule } from 'ngx-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { LandingPageComponent } from './landing-page.component';

describe('LandingPageComponent', () => {
    let component: LandingPageComponent;
    let fixture: ComponentFixture<LandingPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                LandingPageComponent,
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
                }),
                LoggerModule.forRoot(null),
                OAuthModule.forRoot(),
                RouterModule.forRoot([]),
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
                },
                {
                    provide: PermissionService,
                    useValue: mockPermissionService
                },
                {
                    provide: ArlasSettingsService,
                    useValue: mockArlasSettingsService
                }
            ]
        })
        .compileComponents();

        fixture = TestBed.createComponent(LandingPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
