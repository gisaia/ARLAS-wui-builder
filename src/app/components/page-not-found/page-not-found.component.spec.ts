import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { PageNotFoundComponent } from './page-not-found.component';

describe('PageNotFoundComponent', () => {
  let spectator: Spectator<PageNotFoundComponent>;

  const createComponent = createComponentFactory({
    component: PageNotFoundComponent
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
