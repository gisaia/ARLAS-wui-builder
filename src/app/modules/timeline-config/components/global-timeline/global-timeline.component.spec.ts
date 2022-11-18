import { GlobalTimelineComponent } from './global-timeline.component';
import { Spectator, createComponentFactory, mockProvider, createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { CollectionService } from '@services/collection-service/collection.service';
import { of } from 'rxjs';
import { ConfigFormGroupComponent } from '@shared-components/config-form-group/config-form-group.component';
import { ConfigFormControlComponent } from '@shared-components/config-form-control/config-form-control.component';
import { MockComponent } from 'ng-mocks';
import { MainFormService } from '@services/main-form/main-form.service';
import { TimelineGlobalFormGroup } from '@timeline-config/services/timeline-global-form-builder/timeline-global-form-builder.service';
import { BucketsIntervalFormGroup } from '@analytics-config/services/buckets-interval-form-builder/buckets-interval-form-builder.service';
import { TestBed } from '@angular/core/testing';
import {  ArlasSettingsService } from 'arlas-wui-toolkit';
import { StartupService } from '@services/startup/startup.service';

describe('GlobalTimelineComponent', () => {
  let spectator: Spectator<GlobalTimelineComponent>;
  let collectionServiceSpectator: SpectatorService<CollectionService>;
  const collectionService = createServiceFactory(CollectionService);
  const createComponent = createComponentFactory({
    component: GlobalTimelineComponent,
    declarations: [
      MockComponent(ConfigFormGroupComponent),
      MockComponent(ConfigFormControlComponent)
    ],
    providers: [
      mockProvider(CollectionService, {
        getCollectionFieldsNames: () => of([])
      }),
      mockProvider(MainFormService, {
        timelineConfig: {
          getGlobalFg: () => new TimelineGlobalFormGroup(
            'collection',
            new CollectionService(null, null, null, null, null),
            new StartupService(null, null, null, null, null, null),
            new MainFormService(),
            new ArlasSettingsService(),
            new BucketsIntervalFormGroup(undefined, undefined, undefined)
          )
        },
        getMainCollection: () => ''
      })
    ]
  });

  beforeEach(() => {
    spectator = createComponent();
    collectionServiceSpectator = collectionService();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
