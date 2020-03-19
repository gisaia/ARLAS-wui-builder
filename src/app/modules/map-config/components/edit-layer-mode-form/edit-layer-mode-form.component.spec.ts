import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { EditLayerModeFormComponent } from './edit-layer-mode-form.component';
import { MockComponent, MockDirective } from 'ng-mocks';
import { Subject } from 'rxjs';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { HttpClient } from '@angular/common/http';
import { ConfigElementComponent } from '@shared-components/config-element/config-element.component';
import { AlertOnChangeDirective } from '@shared-directives/alert-on-change/alert-on-change.directive';
import { ResetOnChangeDirective } from '@shared-directives/reset-on-change/reset-on-change.directive';
import { ColorPickerWrapperComponent } from '@shared-components/color-picker-wrapper/color-picker-wrapper.component';
import { CollectionService } from '@services/collection-service/collection.service';
import { ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';
import { MainFormService } from '@services/main-form/main-form.service';
import { PropertySelectorComponent } from '@shared-components/property-selector/property-selector.component';

describe('EditLayerModeFormComponent', () => {
  let spectator: Spectator<EditLayerModeFormComponent>;
  const createComponent = createComponentFactory({
    component: EditLayerModeFormComponent,
    declarations: [
      MockComponent(ConfigElementComponent),
      MockDirective(AlertOnChangeDirective),
      MockDirective(ResetOnChangeDirective),
      MockComponent(ColorPickerWrapperComponent),
      MockComponent(PropertySelectorComponent),
    ],
    mocks: [
      HttpClient,
      CollectionService,
      ArlasColorGeneratorLoader,
      MainFormService,
      DefaultValuesService
    ]
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
