

import { GlobalLookAndFeelComponent } from './global-look-and-feel.component';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { ConfigElementComponent } from '@shared-components/config-element/config-element.component';
import { MockComponent } from 'ng-mocks';
import { MainFormService } from '@services/main-form/main-form.service';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { ConfigFormGroupComponent } from '@shared-components/config-form-group/config-form-group.component';
import { AnalyticsInitService } from '@analytics-config/services/analytics-init/analytics-init.service';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { CollectionService } from '@services/collection-service/collection.service';
import { of } from 'rxjs';

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
        lookAndFeelConfig: {
          getGlobalFg: () => new FormGroup({
            dragAndDrop: new FormControl(null),
            zoomToDataStrategy: new FormControl(null),
            indicators: new FormControl(null),
            spinner: new FormControl(null),
            spinnerColor: new FormControl(null),
            spinnerDiameter: new FormControl(null)
          })
        },
        startingConfig: {
          getFg: () => new FormGroup({})
        },
        mapConfig: {
          getGlobalFg: () => new FormGroup({}),
          getLayersFa: () => new FormArray([])
        },
        searchConfig: {
          getGlobalFg: () => new FormGroup({})
        },

        timelineConfig: {
          getGlobalFg: () => new FormGroup({}),
        },
        resultListConfig: {
          getResultListsFa: () => new FormArray([])
        },
        analyticsConfig: {
          getListFa: () => new FormArray([]),
        }
      })
    ]
  });

  beforeEach(() => spectator = createComponent());

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});

