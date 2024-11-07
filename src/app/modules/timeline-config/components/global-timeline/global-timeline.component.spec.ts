import { GlobalTimelineComponent } from './global-timeline.component';
import { Spectator, createComponentFactory, mockProvider, createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { CollectionService } from '@services/collection-service/collection.service';
import { ConfigFormGroupComponent } from '@shared-components/config-form-group/config-form-group.component';
import { ConfigFormControlComponent } from '@shared-components/config-form-control/config-form-control.component';
import { MockComponent } from 'ng-mocks';
import { MainFormService } from '@services/main-form/main-form.service';
import { TimelineGlobalFormGroup } from '@timeline-config/services/timeline-global-form-builder/timeline-global-form-builder.service';
import { BucketsIntervalFormGroup } from '@analytics-config/services/buckets-interval-form-builder/buckets-interval-form-builder.service';
import {  ArlasCollaborativesearchService, ArlasSettingsService } from 'arlas-wui-toolkit';
import { StartupService } from '@services/startup/startup.service';

describe('GlobalTimelineComponent', () => {
  let spectator: Spectator<GlobalTimelineComponent>;
  const mockCollectionService = jasmine.createSpyObj('CollectionService', ['getGroupCollectionItems', 'getCollections']);
  mockCollectionService.getGroupCollectionItems.and.returnValue({});
  mockCollectionService.getCollections.and.returnValue([]);
  const createComponent = createComponentFactory({
    component: GlobalTimelineComponent,
    declarations: [
      MockComponent(ConfigFormGroupComponent),
      MockComponent(ConfigFormControlComponent)
    ],
    providers: [
      {
        provide: CollectionService,
        useValue: mockCollectionService
      },
      mockProvider(ArlasCollaborativesearchService),
      mockProvider(MainFormService, {
        timelineConfig: {
          getGlobalFg: () => new TimelineGlobalFormGroup(
            'collection',
            mockCollectionService,
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
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
