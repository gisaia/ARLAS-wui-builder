
import { EditLayerFeatureMetricComponent } from './edit-layer-feature-metric.component';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { Subject } from 'rxjs';
import { EditLayerModeFormComponent } from '../edit-layer-mode-form/edit-layer-mode-form.component';
import { MockComponent, MockDirective } from 'ng-mocks';
import { ConfigElementComponent } from '@shared-components/config-element/config-element.component';
import { FormGroup, FormControl } from '@angular/forms';
import { AlertOnChangeDirective } from '@shared-directives/alert-on-change/alert-on-change.directive';
import { ResetOnChangeDirective } from '@shared-directives/reset-on-change/reset-on-change.directive';

describe('EditLayerFeatureMetricComponent', () => {
  let spectator: Spectator<EditLayerFeatureMetricComponent>;
  const createComponent = createComponentFactory({
    component: EditLayerFeatureMetricComponent,
    declarations: [
      MockComponent(EditLayerModeFormComponent),
      MockComponent(ConfigElementComponent),
      MockDirective(AlertOnChangeDirective),
      MockDirective(ResetOnChangeDirective)
    ]
  });

  beforeEach(() => spectator = createComponent({
    props: {
      submit: new Subject<boolean>().asObservable(),
      embeddedFeaturesComponent: {
        initEnableWidthOrRadiusFg: () => { },
        formFg: new FormGroup({
          styleStep: new FormGroup({
            intensityFg: new FormControl(),
            weightFg: new FormControl()
          }),
          visibilityStep: new FormGroup({}),
          geometryStep: new FormGroup({})
        })
      } as EditLayerModeFormComponent
    }
  }));

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

});
