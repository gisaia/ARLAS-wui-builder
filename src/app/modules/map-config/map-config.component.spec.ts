import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { MapConfigComponent } from './map-config.component';
import { MainFormService } from '@services/main-form/main-form.service';

describe('MapConfigComponent', () => {
  let spectator: Spectator<MapConfigComponent>;

  const createComponent = createComponentFactory({
    component: MapConfigComponent,
    mocks: [
      MainFormService
    ]
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
