import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { LeftMenuComponent } from './left-menu.component';
import { MainFormService } from '@services/main-form/main-form.service';
import { FormGroup } from '@angular/forms';

describe('LeftMenuComponent', () => {
  let spectator: Spectator<LeftMenuComponent>;

  const createComponent = createComponentFactory({
    component: LeftMenuComponent,
    providers: [
      mockProvider(MainFormService,
        {
          mapConfig: {
            control: new FormGroup({})
          },
          searchConfig: {
            control: new FormGroup({})
          },
          timelineConfig: {
            control: new FormGroup({})
          },
          mainForm: new FormGroup({})
        })
    ]
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
