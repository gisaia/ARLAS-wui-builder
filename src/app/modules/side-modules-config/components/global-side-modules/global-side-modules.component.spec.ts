import { GlobalSideModulesComponent } from './global-side-modules.component';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { MockComponent } from 'ng-mocks';
import { ConfigFormControlComponent } from '@shared-components/config-form-control/config-form-control.component';
import { ConfigFormGroupComponent } from '@shared-components/config-form-group/config-form-group.component';
import { MainFormService } from '@services/main-form/main-form.service';
import {
  SideModulesGlobalFormGroup
} from '@side-modules-config/services/side-modules-global-form-builder/side-modules-global-form-builder.service';

describe('GlobalSideModulesComponent', () => {
  let spectator: Spectator<GlobalSideModulesComponent>;

  const mockCollectionService = jasmine.createSpyObj('CollectionService', ['getGroupCollectionItems', 'getCollections']);
  mockCollectionService.getGroupCollectionItems.and.returnValue({});
  mockCollectionService.getCollections.and.returnValue([]);

  const createComponent = createComponentFactory({
    component: GlobalSideModulesComponent,
    declarations: [
      MockComponent(ConfigFormControlComponent),
      MockComponent(ConfigFormGroupComponent)
    ],
    providers: [
      mockProvider(MainFormService, {
        sideModulesConfig: {
          getGlobalFg: () => new SideModulesGlobalFormGroup(mockCollectionService)
        },
        getMainCollection: () => ''
      })
    ]
  });

  beforeEach(() => spectator = createComponent());

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

});
