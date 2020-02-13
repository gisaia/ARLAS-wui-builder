import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { MapConfigComponent } from './map-config.component';

describe('MapConfigComponent', () => {
  let spectator: Spectator<MapConfigComponent>;

  const createComponent = createComponentFactory({
    component: MapConfigComponent
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should contain 2 tabs', () => {
    expect(spectator.queryAll('a[mat-tab-link]')).toHaveLength(2);
  });
});
