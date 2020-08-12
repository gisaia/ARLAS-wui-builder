import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { LeftMenuComponent } from './left-menu.component';
import { MainFormService } from '@services/main-form/main-form.service';
import { FormGroup } from '@angular/forms';
import { MainFormManagerService } from '@services/main-form-manager/main-form-manager.service';
import { AuthentificationService } from 'arlas-wui-toolkit/services/authentification/authentification.service';
import { GET_OPTIONS } from 'arlas-wui-toolkit/services/persistence/persistence.service';
import { getOptionsFactory } from 'arlas-wui-toolkit/app.module';

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
          lookAndFeelConfig: {
            control: new FormGroup({})
          },
          timelineConfig: {
            control: new FormGroup({})
          },
          analyticsConfig: {
            control: new FormGroup({})
          },
          sideModulesConfig: {
            control: new FormGroup({})
          },
          mainForm: new FormGroup({})
        }),
      mockProvider(MainFormManagerService),
      mockProvider(AuthentificationService),
      {
        provide: GET_OPTIONS,
        useFactory: getOptionsFactory,
        deps: [AuthentificationService]
      }
    ]
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

});
