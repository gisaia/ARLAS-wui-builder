import { HttpClient } from '@angular/common/http';
import { MatDialogRef } from '@angular/material/dialog';
import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator';
import { MainFormService } from '@services/main-form/main-form.service';
import { StartingConfigFormBuilderService } from '@services/starting-config-form-builder/starting-config-form-builder.service';
import { StartupService } from '@services/startup/startup.service';
import { SharedModule } from '@shared/shared.module';
import { ArlasCollaborativesearchService, ArlasColorGeneratorLoader, ArlasConfigService, ArlasStartupService } from 'arlas-wui-toolkit';
import { AuthentificationService } from 'arlas-wui-toolkit/services/authentification/authentification.service';
import { ArlasConfigurationDescriptor } from 'arlas-wui-toolkit/services/configuration-descriptor/configurationDescriptor.service';
import { NGXLogger } from 'ngx-logger';
import { LandingPageComponent, LandingPageDialogComponent } from './landing-page.component';
import { GET_OPTIONS } from 'arlas-wui-toolkit/services/persistence/persistence.service';
import { ErrorModalModule } from 'arlas-wui-toolkit/components/errormodal/errormodal.module';
import { getOptionsFactory } from 'arlas-wui-toolkit/app.module';
import { ConfigMenuModule } from 'arlas-wui-toolkit/components/config-manager/config-menu/config-menu.module';
import { MenuService } from '@services/menu/menu.service';

describe('LandingPageComponent', () => {
  let spectator: Spectator<LandingPageComponent>;

  const createComponent = createComponentFactory({
    component: LandingPageComponent,
    imports: [
      SharedModule,
      ErrorModalModule,
      ConfigMenuModule
    ],
    providers: [
      mockProvider(MatDialogRef),
      mockProvider(NGXLogger),
      mockProvider(MainFormService),
      mockProvider(ArlasConfigService),
      mockProvider(ArlasCollaborativesearchService),
      mockProvider(StartupService),
      mockProvider(ArlasStartupService),
      mockProvider(ArlasConfigurationDescriptor),
      mockProvider(HttpClient),
      mockProvider(ArlasColorGeneratorLoader),
      mockProvider(StartingConfigFormBuilderService),
      mockProvider(AuthentificationService),
      mockProvider(MenuService),
      {
        provide: GET_OPTIONS,
        useFactory: getOptionsFactory,
        deps: [AuthentificationService]
      }
    ],
    entryComponents: [
      LandingPageDialogComponent
    ]
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

});
