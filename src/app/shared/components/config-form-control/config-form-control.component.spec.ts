import { ConfigFormControlComponent } from './config-form-control.component';
import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { ResetOnChangeDirective } from '@shared-directives/reset-on-change/reset-on-change.directive';
import { SlideToggleFormControl } from '@shared-models/config-form';
import { MockComponent } from 'ng-mocks';
import { ColorPickerWrapperComponent } from '@shared-components/color-picker-wrapper/color-picker-wrapper.component';

describe('ConfigFormControlComponent', () => {
  let spectator: Spectator<ConfigFormControlComponent>;

  const createComponent = createComponentFactory({
    component: ConfigFormControlComponent,
    declarations: [
      ResetOnChangeDirective,
      MockComponent(ColorPickerWrapperComponent)
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
