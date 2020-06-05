import { ConfigFormGroupArrayComponent } from './config-form-group-array.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { MockComponent } from 'ng-mocks';
import { ConfigFormControlComponent } from '@shared-components/config-form-control/config-form-control.component';
import { ConfigElementComponent } from '@shared-components/config-element/config-element.component';
import { ConfigFormGroupArray } from '@shared-models/config-form';

describe('ConfigFormGroupArrayComponent', () => {
  let spectator: Spectator<ConfigFormGroupArrayComponent>;

  const createComponent = createComponentFactory({
    component: ConfigFormGroupArrayComponent,
    declarations: [
      MockComponent(ConfigFormControlComponent),
      MockComponent(ConfigElementComponent),
    ]
  });

  beforeEach(() => {
    spectator = createComponent({
      props: {
        configFormGroupArray: new ConfigFormGroupArray([])
      }
    });
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
