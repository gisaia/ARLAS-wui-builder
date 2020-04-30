import { FormGroup } from '@angular/forms';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { ConfigElementComponent } from '@shared-components/config-element/config-element.component';
import { MockComponent, MockDirective } from 'ng-mocks';
import { Subject } from 'rxjs';
import { EditLayerModeFormComponent } from '../edit-layer-mode-form/edit-layer-mode-form.component';
import { EditLayerClusterComponent } from './edit-layer-cluster.component';
import { AlertOnChangeDirective } from '@shared-directives/alert-on-change/alert-on-change.directive';
import { ResetOnChangeDirective } from '@shared-directives/reset-on-change/reset-on-change.directive';


describe('EditLayerClusterComponent', () => {
  let spectator: Spectator<EditLayerClusterComponent>;
  const createComponent = createComponentFactory({
    component: EditLayerClusterComponent,
    declarations: [
      MockComponent(EditLayerModeFormComponent),
      MockComponent(ConfigElementComponent),
      MockDirective(AlertOnChangeDirective),
      MockDirective(ResetOnChangeDirective),
    ]
  });

  beforeEach(() => spectator = createComponent({
    props: {
      submit: new Subject<boolean>().asObservable(),
      embeddedFeaturesComponent: {
        initEnableWidthOrRadiusFg: () => { },
        formFg: new FormGroup({
          geometryStep: new FormGroup({}),
          visibilityStep: new FormGroup({}),
          styleStep: new FormGroup({})
        })
      } as EditLayerModeFormComponent
    }
  }));

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

});
