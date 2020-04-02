import { GlobalTimelineComponent } from './global-timeline.component';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { MockComponent } from 'ng-mocks';
import { TimelineFormComponent } from '../timeline-form/timeline-form.component';
import { CollectionService } from '@services/collection-service/collection.service';
import { of } from 'rxjs';
import { ResetOnChangeDirective } from '@shared-directives/reset-on-change/reset-on-change.directive';

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
      })
    ]
  });

  beforeEach(() => spectator = createComponent());

  it('should contain 1 timeline forms', () => {
    expect(spectator.queryAll('app-timeline-form')).toHaveLength(1);
  });
});
