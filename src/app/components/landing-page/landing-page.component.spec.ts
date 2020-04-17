import { HttpClient } from '@angular/common/http';
import { MatDialogRef } from '@angular/material/dialog';
import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator';
import { MainFormService } from '@services/main-form/main-form.service';
import { SharedModule } from '@shared/shared.module';
import { ArlasConfigService, ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { ArlasConfigurationDescriptor } from 'arlas-wui-toolkit/services/configuration-descriptor/configurationDescriptor.service';
import { NGXLogger } from 'ngx-logger';
import { LandingPageComponent, LandingPageDialogComponent } from './landing-page.component';
import { StartupService } from '@services/startup/startup.service';

describe('LandingPageComponent', () => {
  let spectator: Spectator<LandingPageComponent>;

  const createComponent = createComponentFactory({
    component: LandingPageComponent,
    imports: [
      SharedModule
    ],
    providers: [
      mockProvider(MatDialogRef),
      mockProvider(NGXLogger),
      mockProvider(MainFormService),
      mockProvider(ArlasConfigService),
      mockProvider(ArlasCollaborativesearchService),
      mockProvider(StartupService),
      mockProvider(ArlasConfigurationDescriptor),
      mockProvider(HttpClient)
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
