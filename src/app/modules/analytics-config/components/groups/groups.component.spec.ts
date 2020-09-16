import { GroupsComponent } from './groups.component';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { FormGroup } from '@angular/forms';
import { MockComponent } from 'ng-mocks';
import { EditGroupComponent } from '../edit-group/edit-group.component';
import {
  ArlasStartupService, ArlasConfigService,
  ArlasCollaborativesearchService, CONFIG_UPDATER
} from 'arlas-wui-toolkit/services/startup/startup.service';
import { ArlasConfigurationUpdaterService } from 'arlas-wui-toolkit/services/configuration-updater/configurationUpdater.service';
import { AnalyticsBoardComponent } from 'arlas-wui-toolkit/components/analytics-board/analytics-board.component';

describe('GroupsComponent', () => {
  let spectator: Spectator<GroupsComponent>;

  const createComponent = createComponentFactory({
    component: GroupsComponent,
    declarations: [
      MockComponent(EditGroupComponent),
      MockComponent(AnalyticsBoardComponent),
    ],
    providers: [
      mockProvider(ArlasConfigService),
      mockProvider(ArlasStartupService),
      mockProvider(ArlasCollaborativesearchService),
      mockProvider(ArlasConfigurationUpdaterService),
      { provide: CONFIG_UPDATER, useValue: {} }
    ]
  });

  beforeEach(() => {
    spectator = createComponent({
      props: {
        contentFg: new FormGroup({})
      }
    });
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
