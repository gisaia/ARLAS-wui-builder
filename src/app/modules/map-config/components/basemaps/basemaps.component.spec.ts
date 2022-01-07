
import { MapBasemapFormGroup } from '@map-config/services/map-basemap-form-builder/map-basemap-form-builder.service';
import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator';
import { MainFormService } from '@services/main-form/main-form.service';
import { ConfigFormGroupComponent } from '@shared-components/config-form-group/config-form-group.component';
import { ArlasSettingsService } from 'arlas-wui-toolkit';
import { MockComponent } from 'ng-mocks';
import { BasemapsComponent } from './basemaps.component';

describe('BasemapsComponent', () => {

  let spectator: Spectator<BasemapsComponent>;
  const createComponent = createComponentFactory({
    component: BasemapsComponent,
    declarations: [
      MockComponent(ConfigFormGroupComponent)
    ],
    providers: [
      mockProvider(MainFormService, {
        mapConfig: {
          getBasemapsFg: () => new MapBasemapFormGroup()
        }
      }),
      mockProvider(ArlasSettingsService, {
        settings: {
          basemaps: [{
            name: 'name',
            url: 'url',
            image: 'image',
            checked: true,
            default: true
          }]
        }
      })
    ]
  });

  beforeEach(() => spectator = createComponent());

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

});
