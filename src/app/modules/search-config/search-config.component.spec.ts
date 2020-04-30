import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { SearchConfigComponent } from './search-config.component';

describe('SearchConfigComponent', () => {
  let spectator: Spectator<SearchConfigComponent>;

  const createComponent = createComponentFactory({
    component: SearchConfigComponent
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
