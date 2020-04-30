import { TabsComponent as TabsComponent } from './tabs.component';
import { createComponentFactory, Spectator, mockProvider } from '@ngneat/spectator';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { GroupsComponent } from '../groups/groups.component';
import { MockComponent } from 'ng-mocks';
import { MainFormManagerService } from '@services/main-form-manager/main-form-manager.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { FormArray } from '@angular/forms';
import { ArlasStartupService, ArlasCollaborativesearchService } from 'arlas-wui-toolkit';

describe('TabsComponent', () => {
  let spectator: Spectator<TabsComponent>;

  const createComponent = createComponentFactory({
    component: TabsComponent,
    providers: [
      mockProvider(DefaultValuesService, {
        getValue: () => 'aValue'
      }),
      mockProvider(MainFormManagerService),
      mockProvider(MainFormService, {
        analyticsConfig: {
          getListFa: () => new FormArray([])
        }
      }),
      mockProvider(ArlasStartupService),
      mockProvider(ArlasCollaborativesearchService),
    ],
    declarations: [
      MockComponent(GroupsComponent)
    ]
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
