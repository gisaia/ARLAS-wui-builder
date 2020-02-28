import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { LandingPageComponent, LandingPageDialogComponent } from './landing-page.component';
import { MatDialogRef } from '@angular/material';
import { MainFormService } from '@services/main-form/main-form.service';
import { HttpClient } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';
import { ArlasConfigurationDescriptor } from 'arlas-wui-toolkit/services/configuration-descriptor/configurationDescriptor.service';
import { ArlasConfigService } from 'arlas-wui-toolkit';
import { SharedModule } from '@shared/shared.module';

describe('LandingPageComponent', () => {
  let spectator: Spectator<LandingPageComponent>;

  const createComponent = createComponentFactory({
    component: LandingPageComponent,
    imports: [
      SharedModule
    ],
    providers: [
      { provide: MatDialogRef, useValue: {} },
      mockProvider(NGXLogger),
      mockProvider(MainFormService),
      mockProvider(ArlasConfigService),
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
