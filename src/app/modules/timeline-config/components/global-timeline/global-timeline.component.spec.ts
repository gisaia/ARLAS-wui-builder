import { GlobalTimelineComponent } from './global-timeline.component';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { CollectionService } from '@services/collection-service/collection.service';
import { of } from 'rxjs';
import { ConfigFormGroupComponent } from '@shared-components/config-form-group/config-form-group.component';
import { ConfigFormControlComponent } from '@shared-components/config-form-control/config-form-control.component';
import { MockComponent } from 'ng-mocks';
import { MainFormService } from '@services/main-form/main-form.service';
import { TimelineGlobalFormGroup } from '@timeline-config/services/timeline-global-form-builder/timeline-global-form-builder.service';
import { BucketsIntervalFormGroup } from '@analytics-config/services/buckets-interval-form-builder/buckets-interval-form-builder.service';

describe('GlobalTimelineComponent', () => {
  let spectator: Spectator<GlobalTimelineComponent>;
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
            new BucketsIntervalFormGroup(of([]))
          )
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
