import { GlobalTimelineComponent } from './global-timeline.component';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { MockComponent } from 'ng-mocks';
import { TimelineFormComponent } from '../timeline-form/timeline-form.component';
import { CollectionService } from '@services/collection-service/collection.service';
import { of } from 'rxjs';
import { ResetOnChangeDirective } from '@shared-directives/reset-on-change/reset-on-change.directive';
import { MainFormService } from '@services/main-form/main-form.service';
import { FormGroup, FormControl } from '@angular/forms';

describe('GlobalTimelineComponent', () => {
  let spectator: Spectator<GlobalTimelineComponent>;
  const createComponent = createComponentFactory({
    component: GlobalTimelineComponent,
    declarations: [
      MockComponent(TimelineFormComponent),
      ResetOnChangeDirective
    ],
    providers: [
      mockProvider(CollectionService, {
        getCollectionFieldsNames: () => of([])
      }),
      mockProvider(MainFormService, {
        timelineConfig: {
          getGlobalFg: () => new FormGroup({
            useDetailedTimeline: new FormControl(),
            timeline: new FormControl(),
            detailedTimeline: new FormControl()
          })
        },
        getCollections: () => ['collection']
      })
    ]
  });

  beforeEach(() => spectator = createComponent());

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
