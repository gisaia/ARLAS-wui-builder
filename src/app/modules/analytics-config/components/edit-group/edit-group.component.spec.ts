import { FormControl, FormGroup } from '@angular/forms';
import { IconPickerComponent } from '@gisaia-team/ngx-icon-picker';
import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator';
import { AlertOnChangeDirective } from '@shared-directives/alert-on-change/alert-on-change.directive';
import { ResetOnChangeDirective } from '@shared-directives/reset-on-change/reset-on-change.directive';
import {
  AnalyticsBoardComponent, ArlasCollaborativesearchService, ArlasConfigService,
  ArlasConfigurationUpdaterService, ArlasStartupService, CONFIG_UPDATER
} from 'arlas-wui-toolkit';
import { MockComponent } from 'ng-mocks';
import { AddWidgetDialogComponent, EditGroupComponent } from './edit-group.component';
import { ArlasColorService } from 'arlas-web-components';

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
      mockProvider(ArlasColorService),
      mockProvider(ArlasColorGeneratorLoader),
      { provide: CONFIG_UPDATER, useValue: {} }
    ],
    entryComponents: [
      AddWidgetDialogComponent
    ]
  });

  beforeEach(() => {
    spectator = createComponent({
      props: {
        formGroup: new FormGroup({
          icon: new FormControl(''),
          title: new FormControl(''),
          itemPerLine: new FormControl(''),
          contentType: new FormControl(''),
          content: new FormControl([]),
          preview: new FormControl([])
        })
      }
    });
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
