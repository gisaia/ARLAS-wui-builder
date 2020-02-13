import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { LeftMenuComponent } from './left-menu.component';

describe('LeftMenuComponent', () => {
  let spectator: Spectator<LeftMenuComponent>;

  const createComponent = createComponentFactory({
    component: LeftMenuComponent
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should contain 1 image, 7 items', () => {
    expect(spectator.queryAll('img')).toHaveLength(1);
    expect(spectator.queryAll('mat-list-item')).toHaveLength(7);
  });

});
