import { EditLayerFeaturesComponent } from './edit-layer-features.component';
import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { EditLayerModeFormComponent } from '../edit-layer-mode-form/edit-layer-mode-form.component';
import { ConfigElementComponent } from '@shared-components/config-element/config-element.component';
import { Subject } from 'rxjs';
import { MockComponent, MockDirective } from 'ng-mocks';
import { ObjectvaluesPipe } from '@shared/pipes/objectvalues.pipe';
import { ResetOnChangeDirective } from '@shared-directives/reset-on-change/reset-on-change.directive';
import { AlertOnChangeDirective } from '@shared-directives/alert-on-change/alert-on-change.directive';
import { FormGroup } from '@angular/forms';

describe('EditLayerFeaturesComponent', () => {
  let spectator: Spectator<EditLayerFeaturesComponent>;
  const createComponent = createComponentFactory({
    component: EditLayerFeaturesComponent,
    declarations: [
      MockComponent(EditLayerModeFormComponent),
      MockComponent(ConfigElementComponent),
      MockDirective(AlertOnChangeDirective),
      MockDirective(ResetOnChangeDirective),
      ObjectvaluesPipe
    ]
  });

  beforeEach(() => spectator = createComponent({
    props: {
      submit: new Subject<boolean>().asObservable(),
      embeddedFeaturesComponent: {
        initEnableWidthOrRadiusFg: () => { },
        formFg: new FormGroup({
          styleStep: new FormGroup({}),
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
