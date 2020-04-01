import { FormGroup } from '@angular/forms';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { ConfigElementComponent } from '@shared-components/config-element/config-element.component';
import { MockComponent } from 'ng-mocks';
import { Subject } from 'rxjs';
import { EditLayerModeFormComponent } from '../edit-layer-mode-form/edit-layer-mode-form.component';
import { EditLayerClusterComponent } from './edit-layer-cluster.component';


describe('EditLayerClusterComponent', () => {
  let spectator: Spectator<EditLayerClusterComponent>;
  const createComponent = createComponentFactory({
    component: EditLayerClusterComponent,
    declarations: [
      MockComponent(EditLayerModeFormComponent),
      MockComponent(ConfigElementComponent)
    ]
  });

  beforeEach(() => spectator = createComponent({
    props: {
      submit: new Subject<boolean>().asObservable(),
      embeddedFeaturesComponent: {
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
