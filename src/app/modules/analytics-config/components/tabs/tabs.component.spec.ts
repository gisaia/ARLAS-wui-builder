import { TabsComponent as TabsComponent } from './tabs.component';
import { createComponentFactory, Spectator, mockProvider } from '@ngneat/spectator';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { GroupsComponent } from '../groups/groups.component';
import { MockComponent } from 'ng-mocks';

describe('TabsComponent', () => {
  let spectator: Spectator<TabsComponent>;

  const createComponent = createComponentFactory({
    component: TabsComponent,
    providers: [
      mockProvider(DefaultValuesService, {
        getValue: () => 'aValue'
      })
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
