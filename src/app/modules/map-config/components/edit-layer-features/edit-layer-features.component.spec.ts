import { EditLayerFeaturesComponent } from './edit-layer-features.component';
import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { EditLayerModeFormComponent } from '../edit-layer-mode-form/edit-layer-mode-form.component';
import { ConfigElementComponent } from '@shared-components/config-element/config-element.component';
import { Subject } from 'rxjs';
import { MockComponent } from 'ng-mocks';

describe('EditLayerFeaturesComponent', () => {
  let spectator: Spectator<EditLayerFeaturesComponent>;
  const createComponent = createComponentFactory({
    component: EditLayerFeaturesComponent,
    declarations: [
      MockComponent(EditLayerModeFormComponent),
      MockComponent(ConfigElementComponent)
    ]
  });

  beforeEach(() => spectator = createComponent({
    props: {
      submit: new Subject<void>().asObservable()
    }
  }));

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

});
