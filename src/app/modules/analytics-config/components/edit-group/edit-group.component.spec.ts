import { EditGroupComponent } from './edit-group.component';
import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { FormGroup, FormControl } from '@angular/forms';
import { AlertOnChangeDirective } from '@shared-directives/alert-on-change/alert-on-change.directive';
import { ResetOnChangeDirective } from '@shared-directives/reset-on-change/reset-on-change.directive';
import { MockComponent } from 'ng-mocks';
import { AnalyticsBoardComponent } from 'arlas-wui-toolkit/components/analytics-board/analytics-board.component';
import { ArlasStartupService, ArlasConfigService } from 'arlas-wui-toolkit';
import { ArlasCollaborativesearchService, CONFIG_UPDATER } from 'arlas-wui-toolkit/services/startup/startup.service';

describe('EditGroupComponent', () => {
  let spectator: Spectator<EditGroupComponent>;

  const createComponent = createComponentFactory({
    component: EditGroupComponent,
    declarations: [
      AlertOnChangeDirective,
      ResetOnChangeDirective,
      MockComponent(AnalyticsBoardComponent)
    ],
    providers: [
      ArlasStartupService,
      ArlasCollaborativesearchService,
      ArlasConfigService,
      { provide: CONFIG_UPDATER, useValue: {} }
    ]
  });

  beforeEach(() => {
    spectator = createComponent({
      props: {
        formGroup: new FormGroup({
          icon: new FormControl(''),
          title: new FormControl(''),
          contentType: new FormControl(''),
          content: new FormControl(''),
        })
      }
    });
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
