import { LayersComponent } from './layers.component';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { MainFormService } from '@services/main-form/main-form.service';
import { FormArray } from '@angular/forms';
import {
  ArlasCollaborativesearchService, ArlasStartupService,
  ArlasConfigService, CONFIG_UPDATER
} from 'arlas-wui-toolkit/services/startup/startup.service';

describe('LayersComponent', () => {
  let spectator: Spectator<LayersComponent>;
  const createComponent = createComponentFactory({
    providers: [
      ArlasStartupService,
      ArlasCollaborativesearchService,
      ArlasConfigService,
      { provide: CONFIG_UPDATER, useValue: {} }
    ],
    component: LayersComponent
  });

  beforeEach(() => spectator = createComponent());

  it('should be loaded successfully', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should contain a table', () => {
    expect(spectator.queryAll('table')).toBeDefined();
  });
});
