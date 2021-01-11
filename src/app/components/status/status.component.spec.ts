import { StatusComponent } from './status.component';
import { Spectator, createComponentFactory } from '@ngneat/spectator';

describe('StatusComponent', () => {
  let spectator: Spectator<StatusComponent>;

  const createComponent = createComponentFactory({
    component: StatusComponent
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
