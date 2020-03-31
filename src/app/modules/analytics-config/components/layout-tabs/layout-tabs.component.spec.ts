import { LayoutTabsComponent } from './layout-tabs.component';
import { createComponentFactory, Spectator, mockProvider } from '@ngneat/spectator';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { LayoutGroupsComponent } from '../layout-groups/layout-groups.component';
import { MockComponent } from 'ng-mocks';

describe('LayoutTabsComponent', () => {
  let spectator: Spectator<LayoutTabsComponent>;

  const createComponent = createComponentFactory({
    component: LayoutTabsComponent,
    providers: [
      mockProvider(DefaultValuesService, {
        getValue: () => 'aValue'
      })
    ],
    declarations: [
      MockComponent(LayoutGroupsComponent)
    ]
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
