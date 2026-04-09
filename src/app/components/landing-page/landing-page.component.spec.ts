import { HttpClient } from '@angular/common/http';
import { MatDialogRef } from '@angular/material/dialog';
import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator';
import { MainFormService } from '@services/main-form/main-form.service';
import { MenuService } from '@services/menu/menu.service';
import { StartingConfigFormBuilderService } from '@services/starting-config-form-builder/starting-config-form-builder.service';
import { StartupService } from '@services/startup/startup.service';
import { SharedModule } from '@shared/shared.module';
import { ArlasCollaborativesearchService, ArlasConfigService, ArlasConfigurationDescriptor, ArlasIamService, ArlasSettingsService, ArlasStartupService, AuthentificationService, ConfigMenuModule, GET_OPTIONS, getOptionsFactory, PermissionService, PersistenceService } from 'arlas-wui-toolkit';
import { NGXLogger } from 'ngx-logger';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';
import { LandingPageComponent } from './landing-page.component';

describe('LandingPageComponent', () => {
    let spectator: Spectator<LandingPageComponent>;

    const createComponent = createComponentFactory({
        component: LandingPageComponent,
        imports: [
            SharedModule,
            ConfigMenuModule
        ],
        providers: [
            mockProvider(MatDialogRef),
            mockProvider(NGXLogger),
            mockProvider(MainFormService, {
                getMainCollection: () => '',
                startingConfig: {
                    init: () => undefined
                }
            }),
            mockProvider(ArlasConfigService),
            mockProvider(ArlasCollaborativesearchService),
            mockProvider(ArlasIamService),
            mockProvider(StartupService),
            mockProvider(ArlasStartupService),
            mockProvider(PersistenceService),
            mockProvider(PermissionService),
            mockProvider(ArlasSettingsService, {
                getAuthentSettings: () => undefined
            }),
            mockProvider(ArlasConfigurationDescriptor),
            mockProvider(HttpClient),
            mockProvider(StartingConfigFormBuilderService),
            mockProvider(AuthentificationService, {
                canActivateProtectedRoutes: of()
            }),
            mockProvider(MenuService),
            {
                provide: GET_OPTIONS,
                useFactory: getOptionsFactory,
                deps: [AuthentificationService],
            }
        ]
    });

    beforeEach(() => {
        spectator = createComponent();
    });

    it('should create', () => {
        expect(spectator.component).toBeTruthy();
    });

});
