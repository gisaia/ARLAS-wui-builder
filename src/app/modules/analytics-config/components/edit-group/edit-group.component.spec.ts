import { EditGroupComponent, AddWidgetDialogComponent } from './edit-group.component';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { FormGroup, FormControl } from '@angular/forms';
import { AlertOnChangeDirective } from '@shared-directives/alert-on-change/alert-on-change.directive';
import { ResetOnChangeDirective } from '@shared-directives/reset-on-change/reset-on-change.directive';
import { MockComponent } from 'ng-mocks';
import { AnalyticsBoardComponent } from 'arlas-wui-toolkit/components/analytics-board/analytics-board.component';
import {
  ArlasCollaborativesearchService, ArlasStartupService,
  ArlasConfigService, CONFIG_UPDATER
} from 'arlas-wui-toolkit/services/startup/startup.service';
import { IconPickerComponent } from 'ngx-icon-picker';
import { ArlasConfigurationUpdaterService } from 'arlas-wui-toolkit/services/configuration-updater/configurationUpdater.service';

describe('EditGroupComponent', () => {
  let spectator: Spectator<EditGroupComponent>;

  const createComponent = createComponentFactory({
    component: EditGroupComponent,
    declarations: [
      AlertOnChangeDirective,
      ResetOnChangeDirective,
      MockComponent(AnalyticsBoardComponent),
      MockComponent(IconPickerComponent)
    ],
    providers: [
      mockProvider(ArlasConfigService),
      mockProvider(ArlasStartupService),
      mockProvider(ArlasCollaborativesearchService),
      mockProvider(ArlasConfigurationUpdaterService),
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
