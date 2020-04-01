import { LayoutGroupsComponent } from './layout-groups.component';
import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { FormGroup } from '@angular/forms';

describe('LayoutGroupsComponent', () => {
  let spectator: Spectator<LayoutGroupsComponent>;

  const createComponent = createComponentFactory({
    component: LayoutGroupsComponent
  });

  beforeEach(() => {
    spectator = createComponent({
      props: {
        contentFg: new FormGroup({})
      }
    });
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
