import { EditLayerComponent } from './edit-layer.component';
import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { MockComponent } from 'ng-mocks';
import { ConfigElementComponent } from 'src/app/modules/shared/components/config-element/config-element.component';

describe('EditLayerComponent', () => {
  let spectator: Spectator<EditLayerComponent>;
  const createComponent = createComponentFactory({
    component: EditLayerComponent,
    declarations: [
      MockComponent(ConfigElementComponent)
    ]
  });

  beforeEach(() => spectator = createComponent());

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should contain 2 config elements', () => {
    expect(spectator.queryAll('app-config-element')).toHaveLength(2);
  });

});
