

import { GlobalLookAndFeelComponent } from './global-look-and-feel.component';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { ConfigElementComponent } from '@shared-components/config-element/config-element.component';
import { MockComponent } from 'ng-mocks';
import { MainFormService } from '@services/main-form/main-form.service';
import { FormGroup, FormControl } from '@angular/forms';
import { ConfigFormGroupComponent } from '@shared-components/config-form-group/config-form-group.component';

describe('GlobalSearchComponent', () => {
  let spectator: Spectator<GlobalLookAndFeelComponent>;
  const createComponent = createComponentFactory({
    component: GlobalLookAndFeelComponent,
    declarations: [
      MockComponent(ConfigElementComponent),
      MockComponent(ConfigFormGroupComponent)
    ],
    providers: [
      mockProvider(MainFormService, {
        lookAndFeelConfig: {
          getGlobalFg: () => new FormGroup({
            dragAndDrop: new FormControl(null),
            zoomToData: new FormControl(null),
            indicators: new FormControl(null),
            spinner: new FormControl(null),
            spinnerColor: new FormControl(null),
            spinnerDiameter: new FormControl(null)
          })
        }
      })
    ]
  });

  beforeEach(() => spectator = createComponent());

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});

