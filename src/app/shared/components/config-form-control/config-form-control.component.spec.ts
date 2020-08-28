import { ConfigFormControlComponent } from './config-form-control.component';
import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { ResetOnChangeDirective } from '@shared-directives/reset-on-change/reset-on-change.directive';
import { SlideToggleFormControl } from '@shared-models/config-form';
import { MockComponent } from 'ng-mocks';
import { ColorPickerWrapperComponent } from '@shared-components/color-picker-wrapper/color-picker-wrapper.component';
import { AlertOnChangeDirective } from '@shared-directives/alert-on-change/alert-on-change.directive';
import { MatCheckboxModule } from '@angular/material/checkbox';

describe('ConfigFormControlComponent', () => {
  let spectator: Spectator<ConfigFormControlComponent>;

  const createComponent = createComponentFactory({
    component: ConfigFormControlComponent,
    imports: [
      MatCheckboxModule
    ],
    declarations: [
      ResetOnChangeDirective,
      AlertOnChangeDirective,
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
