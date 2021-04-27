import { GlobalMapComponent } from './global-map.component';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { MockComponent } from 'ng-mocks';
import { MainFormService } from '@services/main-form/main-form.service';
import { MapGlobalFormGroup } from '@map-config/services/map-global-form-builder/map-global-form-builder.service';
import { ConfigFormGroupComponent } from '@shared-components/config-form-group/config-form-group.component';

describe('GlobalMapComponent', () => {

  let spectator: Spectator<GlobalMapComponent>;
  const createComponent = createComponentFactory({
    component: GlobalMapComponent,
    declarations: [
      MockComponent(ConfigFormGroupComponent)
    ],
    providers: [
      mockProvider(MainFormService, {
        mapConfig: {
          getGlobalFg: () => new MapGlobalFormGroup()
        },
        getMainCollection: () => ''
      }),
    ]
  });

  beforeEach(() => spectator = createComponent());

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

});
