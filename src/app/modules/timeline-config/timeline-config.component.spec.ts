import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { TimelineConfigComponent } from './timeline-config.component';

describe('TimelineConfigComponent', () => {
  let spectator: Spectator<TimelineConfigComponent>;

  const createComponent = createComponentFactory({
    component: TimelineConfigComponent
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
