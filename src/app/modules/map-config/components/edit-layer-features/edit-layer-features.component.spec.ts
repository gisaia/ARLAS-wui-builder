import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { EditLayerFeaturesComponent } from './edit-layer-features.component';
import { MockComponent, MockDirective } from 'ng-mocks';
import { Subject } from 'rxjs';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { HttpClient } from '@angular/common/http';
import { ConfigElementComponent } from '@shared-components/config-element/config-element.component';
import { AlertOnChangeDirective } from '@shared-directives/alert-on-change/alert-on-change.directive';
import { ResetOnChangeDirective } from '@shared-directives/reset-on-change/reset-on-change.directive';
import { ColorPickerWrapperComponent } from '@shared-components/color-picker-wrapper/color-picker-wrapper.component';
import { CollectionService } from '@services/collection-service/collection.service';
import { ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';

describe('EditLayerFeaturesComponent', () => {
  let spectator: Spectator<EditLayerFeaturesComponent>;
  const createComponent = createComponentFactory({
    component: EditLayerFeaturesComponent,
    componentProviders: [
      mockProvider(CollectionService),
      mockProvider(ArlasColorGeneratorLoader)
    ],
    declarations: [
      MockComponent(ConfigElementComponent),
      MockDirective(AlertOnChangeDirective),
      MockDirective(ResetOnChangeDirective),
      MockComponent(ColorPickerWrapperComponent)
    ],
    providers: [DefaultValuesService],
    mocks: [HttpClient]
  });

  beforeEach(() => spectator = createComponent({
    props: {
      submit: new Subject<void>().asObservable()
    }
  }));

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should contain 4 steps', () => {
    expect(spectator.queryAll('mat-step-header')).toHaveLength(4);
  });
});
