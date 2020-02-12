import { GlobalComponent } from './global.component';
import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { ConfigElementComponent } from 'src/app/modules/shared/components/config-element/config-element.component';
import { MockComponent } from 'ng-mocks';

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
