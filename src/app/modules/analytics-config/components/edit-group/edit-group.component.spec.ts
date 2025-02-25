import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { IconPickerComponent } from '@gisaia-team/ngx-icon-picker';
import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator';
import { AlertOnChangeDirective } from '@shared-directives/alert-on-change/alert-on-change.directive';
import { ResetOnChangeDirective } from '@shared-directives/reset-on-change/reset-on-change.directive';
import { ArlasColorService } from 'arlas-web-components';
import {
  AnalyticsBoardComponent, ArlasCollaborativesearchService, ArlasConfigService,
  ArlasConfigurationUpdaterService, ArlasStartupService, CONFIG_UPDATER
} from 'arlas-wui-toolkit';
import { MockComponent } from 'ng-mocks';
import { EditGroupComponent } from './edit-group.component';
import { WIDGET_TYPE } from './models';
import { AnalyticConfig } from '@services/main-form-manager/models-config';

describe('EditGroupComponent', () => {
  let spectator: Spectator<EditGroupComponent>;

  const createComponent = createComponentFactory({
    component: EditGroupComponent,
    declarations: [
      AlertOnChangeDirective,
      ResetOnChangeDirective,
      MockComponent(AnalyticsBoardComponent),
      MockComponent(IconPickerComponent),
    ],
    providers: [
      mockProvider(ArlasConfigService),
      mockProvider(ArlasStartupService),
      mockProvider(ArlasCollaborativesearchService),
      mockProvider(ArlasColorService),
      mockProvider(ArlasConfigurationUpdaterService),
      { provide: CONFIG_UPDATER, useValue: {} }
    ]
  });

  beforeEach(() => {
    spectator = createComponent({
      props: {
        formGroup: new FormGroup({
          icon: new FormControl(''),
          title: new FormControl(''),
          itemPerLine: new FormControl(0),
          contentType: new FormControl(new Array<WIDGET_TYPE>()),
          content: new FormArray([]),
          preview: new FormControl({} as AnalyticConfig)
        })
      }
    });
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
