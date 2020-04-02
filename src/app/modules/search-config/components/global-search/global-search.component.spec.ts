import { GlobalSearchComponent } from './global-search.component';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { ConfigElementComponent } from '@shared-components/config-element/config-element.component';
import { MockComponent } from 'ng-mocks';
import { CollectionService } from '@services/collection-service/collection.service';
import { of } from 'rxjs';

describe('GlobalSearchComponent', () => {
  let spectator: Spectator<GlobalSearchComponent>;
  const createComponent = createComponentFactory({
    component: GlobalSearchComponent,
    declarations: [
      MockComponent(ConfigElementComponent)
    ],
    providers: [
      mockProvider(CollectionService, {
        getCollectionFieldsNames: () => of([])
      })
    ]
  });

  beforeEach(() => spectator = createComponent());

  it('should contain 5 config elements', () => {
    expect(spectator.queryAll('app-config-element')).toHaveLength(5);
  });
});
