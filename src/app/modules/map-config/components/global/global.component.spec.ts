import { GlobalComponent } from './global.component';
import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { MockComponent } from 'ng-mocks';
import { ConfigElementComponent } from '@shared-components/config-element/config-element.component';

describe('GlobalComponent', () => {

  let spectator: Spectator<GlobalComponent>;
  const createComponent = createComponentFactory({
    component: GlobalComponent,
    declarations: [
      MockComponent(ConfigElementComponent)
    ]
  });

  beforeEach(() => spectator = createComponent());

  it('should contain 2 config elements', () => {
    expect(spectator.queryAll('app-config-element')).toHaveLength(2);
  });

});
