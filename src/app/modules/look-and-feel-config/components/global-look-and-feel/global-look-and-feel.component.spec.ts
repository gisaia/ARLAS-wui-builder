import { AnalyticsInitService } from '@analytics-config/services/analytics-init/analytics-init.service';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { CollectionService } from '@services/collection-service/collection.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { ConfigElementComponent } from '@shared-components/config-element/config-element.component';
import { ConfigFormGroupComponent } from '@shared-components/config-form-group/config-form-group.component';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { MockComponent } from 'ng-mocks';
import { of } from 'rxjs';
import { LookAndFeelGlobalFormGroup } from '../../services/look-and-feel-global-form-builder/look-and-feel-global-form-builder.service';
import { GlobalLookAndFeelComponent } from './global-look-and-feel.component';

describe('GlobalLookAndFeelComponent', () => {
  let spectator: Spectator<GlobalLookAndFeelComponent>;
  const createComponent = createComponentFactory({
    component: GlobalLookAndFeelComponent,
    declarations: [
      MockComponent(ConfigElementComponent),
      MockComponent(ConfigFormGroupComponent)
    ],
    providers: [
      mockProvider(CollectionService, {
        getCollectionFields: () => of([])
      }),
      mockProvider(ArlasCollaborativesearchService),
      mockProvider(AnalyticsInitService),
      mockProvider(MainFormService, {
        getAllCollections: (collectionService: CollectionService) => [],
        lookAndFeelConfig: {
          getGlobalFg: () => new LookAndFeelGlobalFormGroup({} as any, {} as any)
        }
      })
    ]
  });

  beforeEach(() => spectator = createComponent());

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});

