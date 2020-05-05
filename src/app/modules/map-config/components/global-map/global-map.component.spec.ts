import { GlobalMapComponent } from './global-map.component';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { ConfigElementComponent } from '@shared-components/config-element/config-element.component';
import { MockComponent } from 'ng-mocks';
import { CollectionService } from '@services/collection-service/collection.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { MapGlobalFormGroup } from '@map-config/services/map-global-form-builder/map-global-form-builder.service';
import { of, Observable } from 'rxjs';

describe('GlobalMapComponent', () => {

  let spectator: Spectator<GlobalMapComponent>;
  const createComponent = createComponentFactory({
    component: GlobalMapComponent,
    declarations: [
      MockComponent(ConfigElementComponent)
    ],
    providers: [
      mockProvider(MainFormService, {
        mapConfig: {
          getGlobalFg: () => new MapGlobalFormGroup()
        },
        getCollections: () => ['collection']
      }),
      mockProvider(CollectionService, {
        getCollectionFieldsNames: () => of([]),
        getCollectionParamFields: () => of([])
      })
    ]
  });

  beforeEach(() => spectator = createComponent());

  it('should contain 2 config elements', () => {
    expect(spectator.queryAll('app-config-element')).toHaveLength(8);
  });

});
