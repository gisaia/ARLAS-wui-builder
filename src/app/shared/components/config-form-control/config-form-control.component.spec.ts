import { ConfigFormControlComponent } from './config-form-control.component';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { ResetOnChangeDirective } from '@shared-directives/reset-on-change/reset-on-change.directive';
import { SlideToggleFormControl } from '@shared-models/config-form';
import { MockComponent } from 'ng-mocks';
import { ColorPickerWrapperComponent } from '@shared-components/color-picker-wrapper/color-picker-wrapper.component';
import { AlertOnChangeDirective } from '@shared-directives/alert-on-change/alert-on-change.directive';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { LayerFiltersComponent } from '@shared-components/layer-filters/filters.component';
import { CollectionService } from '@services/collection-service/collection.service';
import { CollectionsUnitsComponent } from '@shared-components/collections-units/collections-units.component';
import { ArlasColorService } from 'arlas-web-components';

describe('ConfigFormControlComponent', () => {
  let spectator: Spectator<ConfigFormControlComponent>;

  const createComponent = createComponentFactory({
    component: ConfigFormControlComponent,
    imports: [
      MatCheckboxModule
    ],
    declarations: [
      ResetOnChangeDirective,
      AlertOnChangeDirective,
      MockComponent(ColorPickerWrapperComponent),
      MockComponent(LayerFiltersComponent),
      MockComponent(CollectionsUnitsComponent)
    ],
    providers: [
      mockProvider(ArlasColorService),
      mockProvider(CollectionService)
    ]
  });

  beforeEach(() => {
    spectator = createComponent({
      props: {
        control: new SlideToggleFormControl('', '', '')
      }
    });
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
