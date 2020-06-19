import { ConfigFormGroupComponent } from './config-form-group.component';
import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { MockComponent } from 'ng-mocks';
import { ConfigFormControlComponent } from '@shared-components/config-form-control/config-form-control.component';
import { ConfigElementComponent } from '@shared-components/config-element/config-element.component';
import { ConfigFormGroup } from '@shared-models/config-form';
import { ObjectvaluesPipe } from '@shared/pipes/objectvalues.pipe';
import { ConfigFormGroupArrayComponent } from '@shared-components/config-form-group-array/config-form-group-array.component';

describe('ConfigFormGroupComponent', () => {
  let spectator: Spectator<ConfigFormGroupComponent>;

  const createComponent = createComponentFactory({
    component: ConfigFormGroupComponent,
    declarations: [
      MockComponent(ConfigFormControlComponent),
      MockComponent(ConfigFormGroupArrayComponent),
      MockComponent(ConfigElementComponent),
      ObjectvaluesPipe
    ]
  });

  beforeEach(() => {
    spectator = createComponent({
      props: {
        configFormGroup: new ConfigFormGroup({})
      }
    });
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
