import { FormGroup } from '@angular/forms';
import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator';
import { MainFormManagerService } from '@services/main-form-manager/main-form-manager.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { MenuService } from '@services/menu/menu.service';
import { AuthentificationService, getOptionsFactory, GET_OPTIONS } from 'arlas-wui-toolkit';
import { Subject } from 'rxjs/internal/Subject';
import { LeftMenuComponent } from './left-menu.component';

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
      mockProvider(MenuService),
      mockProvider(AuthentificationService, {
        canActivateProtectedRoutes: new Subject()
      }),
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
