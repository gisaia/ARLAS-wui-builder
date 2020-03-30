import { AnalyticsConfigComponent } from './analytics-config.component';
import { Spectator, createComponentFactory } from '@ngneat/spectator';

describe('AnalyticsConfigComponent', () => {
  let spectator: Spectator<AnalyticsConfigComponent>;

  const createComponent = createComponentFactory({
    component: AnalyticsConfigComponent
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
