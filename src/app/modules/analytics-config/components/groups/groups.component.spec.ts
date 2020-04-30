import { GroupsComponent } from './groups.component';
import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { FormGroup } from '@angular/forms';
import { MockComponent } from 'ng-mocks';
import { EditGroupComponent } from '../edit-group/edit-group.component';
import {
  ArlasStartupService, ArlasConfigService,
  ArlasCollaborativesearchService, CONFIG_UPDATER
} from 'arlas-wui-toolkit/services/startup/startup.service';

describe('GroupsComponent', () => {
  let spectator: Spectator<GroupsComponent>;

  const createComponent = createComponentFactory({
    component: GroupsComponent,
    declarations: [
      MockComponent(EditGroupComponent)
    ],
    providers: [ArlasStartupService,
      ArlasConfigService,
      ArlasCollaborativesearchService,
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
