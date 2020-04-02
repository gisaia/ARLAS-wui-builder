import { ConfigFormControlComponent } from './config-form-control.component';
import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { ResetOnChangeDirective } from '@shared-directives/reset-on-change/reset-on-change.directive';
import { SlideToggleFormControl } from '@shared-models/config-form';

describe('ConfigFormControlComponent', () => {
  let spectator: Spectator<ConfigFormControlComponent>;

  const createComponent = createComponentFactory({
    component: ConfigFormControlComponent,
    declarations: [
      ResetOnChangeDirective
    ]
  });

  beforeEach(() => {
    spectator = createComponent({
      props: {
        control: new SlideToggleFormControl('', '', '')
      }
    });
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
