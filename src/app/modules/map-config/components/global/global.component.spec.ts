import { GlobalComponent } from './global.component';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { ConfigElementComponent } from '@shared/components/config-element/config-element.component';
import { MockComponent } from 'ng-mocks';
import { CollectionService } from '@services/collection-service/collection.service';

describe('GlobalComponent', () => {

  let spectator: Spectator<GlobalComponent>;
  const createComponent = createComponentFactory({
    component: GlobalComponent,
    declarations: [
      MockComponent(ConfigElementComponent)
    ],
    providers: [
      mockProvider(CollectionService)
    ]
  });

  beforeEach(() => spectator = createComponent());

  it('should contain 2 config elements', () => {
    expect(spectator.queryAll('app-config-element')).toHaveLength(2);
  });

});
