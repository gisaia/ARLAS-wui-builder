import { FormGroup } from '@angular/forms';
import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator';
import { MainFormService } from '@services/main-form/main-form.service';
import { ArlasColorService } from 'arlas-web-components';
import {
  AnalyticsBoardComponent, ArlasCollaborativesearchService, ArlasColorGeneratorLoader, ArlasConfigService,
  ArlasConfigurationUpdaterService, ArlasStartupService, CONFIG_UPDATER
} from 'arlas-wui-toolkit';
import { MockComponent } from 'ng-mocks';
import { EditGroupComponent } from '../edit-group/edit-group.component';
import { GroupsComponent } from './groups.component';

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
      mockProvider(MainFormService),
      mockProvider(ArlasColorGeneratorLoader),
      mockProvider(ArlasColorService),
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
