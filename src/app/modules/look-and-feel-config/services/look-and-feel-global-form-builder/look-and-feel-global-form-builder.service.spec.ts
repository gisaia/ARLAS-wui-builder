import { SpectatorService, createServiceFactory, mockProvider } from '@ngneat/spectator';
import { CollectionService } from '@services/collection-service/collection.service';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { LookAndFeelGlobalFormBuilderService } from './look-and-feel-global-form-builder.service';

import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { of } from 'rxjs';
import { AnalyticsInitService } from '@analytics-config/services/analytics-init/analytics-init.service';
import { MainFormService } from '@services/main-form/main-form.service';



describe('LookAndFeelGlobalFormBuilderService', () => {
  let spectator: SpectatorService<LookAndFeelGlobalFormBuilderService>;

  const createService = createServiceFactory({
    service: LookAndFeelGlobalFormBuilderService,
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

  beforeEach(() => {
    spectator = createService();
  });

  it('should create', () => {
    expect(spectator.service).toBeTruthy();
  });
});
