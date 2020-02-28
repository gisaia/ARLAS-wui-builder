import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { EditLayerFeaturesComponent } from './edit-layer-features.component';
import { ConfigElementComponent } from '@shared/components/config-element/config-element.component';
import { MockComponent, MockDirective } from 'ng-mocks';
import { AlertOnChangeDirective } from '@app/shared/directives/alert-on-change/alert-on-change.directive';
import { Subject } from 'rxjs';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { HttpClient } from '@angular/common/http';
import { ColorPickerWrapperComponent } from '@app/shared/components/color-picker-wrapper/color-picker-wrapper.component';
import { ResetOnChangeDirective } from '@app/shared/directives/reset-on-change/reset-on-change.directive';

describe('EditLayerFeaturesComponent', () => {
  let spectator: Spectator<EditLayerFeaturesComponent>;
  const createComponent = createComponentFactory({
    component: EditLayerFeaturesComponent,
    declarations: [
      MockComponent(ConfigElementComponent),
      MockDirective(AlertOnChangeDirective),
      MockDirective(ResetOnChangeDirective),
      MockComponent(ColorPickerWrapperComponent)
    ],
    providers: [DefaultValuesService],
    mocks: [HttpClient]
  });

  beforeEach(() => spectator = createComponent({
    props: {
      submit: new Subject<void>().asObservable()
    }
  }));

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should contain 4 steps', () => {
    expect(spectator.queryAll('mat-step-header')).toHaveLength(4);
  });
});
