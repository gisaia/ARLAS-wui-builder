import { AnayticsLayoutComponent } from './anaytics-layout.component';
import { createComponentFactory, Spectator, mockProvider } from '@ngneat/spectator';
import { DefaultValuesService } from '@services/default-values/default-values.service';

describe('AnayticsLayoutComponent', () => {
  let spectator: Spectator<AnayticsLayoutComponent>;

  const createComponent = createComponentFactory({
    component: AnayticsLayoutComponent,
    providers: [
      mockProvider(DefaultValuesService, {
        getValue: () => 'aValue'
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
