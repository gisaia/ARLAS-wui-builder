import { beforeEach, describe, expect, it, vi } from "vitest";
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { MainFormService } from '@services/main-form/main-form.service';
import { ConfigFormControlComponent } from '@shared-components/config-form-control/config-form-control.component';
import { ConfigFormGroupComponent } from '@shared-components/config-form-group/config-form-group.component';
import { SideModulesGlobalFormGroup } from '@side-modules-config/services/side-modules-global-form-builder/side-modules-global-form-builder.service';
import { ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { MockComponent } from 'ng-mocks';
import { GlobalSideModulesComponent } from './global-side-modules.component';

describe('GlobalSideModulesComponent', () => {
    let spectator: Spectator<GlobalSideModulesComponent>;

    const mockCollectionService = {
        getGroupCollectionItems: vi.fn().mockName("CollectionService.getGroupCollectionItems"),
        getCollections: vi.fn().mockName("CollectionService.getCollections")
    };
    mockCollectionService.getGroupCollectionItems.mockReturnValue({});
    mockCollectionService.getCollections.mockReturnValue([]);

    const mockArlasCSS = {
        defaultCollection: vi.fn().mockName("ArlasCollaborativesearchService.defaultCollection")
    };
    mockArlasCSS.defaultCollection = 'main';

    const createComponent = createComponentFactory({
        component: GlobalSideModulesComponent,
        declarations: [
            MockComponent(ConfigFormControlComponent),
            MockComponent(ConfigFormGroupComponent)
        ],
        providers: [
            mockProvider(MainFormService, {
                sideModulesConfig: {
                    getGlobalFg: () => new SideModulesGlobalFormGroup(mockCollectionService, mockArlasCSS)
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
