import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { MapConfigComponent } from './map-config.component';
import { MainFormService } from '@services/main-form/main-form.service';
import { MainFormManagerService } from '@services/main-form-manager/main-form-manager.service';
import { FormGroup, FormArray } from '@angular/forms';

describe('MapConfigComponent', () => {
  let spectator: Spectator<MapConfigComponent>;

  const createComponent = createComponentFactory({
    component: MapConfigComponent,
    providers: [
      mockProvider(MainFormManagerService),
      mockProvider(MainFormService, {
        mapConfig: {
          getGlobalFg: () => new FormGroup({}),
          getLayersFa: () => new FormArray([]),
          getVisualisationsFa: () => new FormArray([]),
          getBasemapsFg: () => new FormGroup({})
        }
      })
    ]
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

});
