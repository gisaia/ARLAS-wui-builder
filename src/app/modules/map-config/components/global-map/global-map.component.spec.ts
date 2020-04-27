import { GlobalMapComponent } from './global-map.component';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { ConfigElementComponent } from '@shared-components/config-element/config-element.component';
import { MockComponent } from 'ng-mocks';
import { CollectionService } from '@services/collection-service/collection.service';

describe('GlobalMapComponent', () => {

  let spectator: Spectator<GlobalMapComponent>;
  const createComponent = createComponentFactory({
    component: GlobalMapComponent,
    declarations: [
      MockComponent(ConfigElementComponent)
    ],
    mocks: [
      CollectionService
    ]
  });

  beforeEach(() => spectator = createComponent());

  it('should contain 2 config elements', () => {
    expect(spectator.queryAll('app-config-element')).toHaveLength(8);
  });

});
