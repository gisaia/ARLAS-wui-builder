import { CollectionComponent } from './collection.component';
import { Spectator, createComponentFactory } from '@ngneat/spectator';

describe('StatusComponent', () => {
  let spectator: Spectator<CollectionComponent>;

  const createComponent = createComponentFactory({
    component: CollectionComponent
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
