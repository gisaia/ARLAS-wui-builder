import { GlobalSearchComponent } from './global-search.component';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { ConfigElementComponent } from '@shared-components/config-element/config-element.component';
import { MockComponent } from 'ng-mocks';
import { CollectionService } from '@services/collection-service/collection.service';
import { of } from 'rxjs';
import { MainFormService } from '@services/main-form/main-form.service';
import { FormGroup, FormControl } from '@angular/forms';
import { ConfigFormGroupComponent } from '@shared-components/config-form-group/config-form-group.component';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { AnalyticsInitService } from '@analytics-config/services/analytics-init/analytics-init.service';

describe('GlobalSearchComponent', () => {
  let spectator: Spectator<GlobalSearchComponent>;
  const createComponent = createComponentFactory({
    component: GlobalSearchComponent,
    declarations: [
      MockComponent(ConfigFormGroupComponent)
    ],
    providers: [
      mockProvider(CollectionService, {
        getCollectionFieldsNames: () => of([])
      }),
      mockProvider(MainFormService, {
        searchConfig: {
          getGlobalFg: () => new FormGroup({
            name: new FormControl(null),
            searchField: new FormControl(null),
            autocompleteField: new FormControl(null),
            autocompleteSize: new FormControl(null)
          })
        },
        getMainCollection: () => ''
      })
    ]
  });

  beforeEach(() => spectator = createComponent());

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
