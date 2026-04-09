import { BucketsIntervalFormGroup } from '@analytics-config/services/buckets-interval-form-builder/buckets-interval-form-builder.service';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { LookAndFeelGlobalFormGroup } from '@look-and-feel-config/services/look-and-feel-global-form-builder/form-group';
import { MapBasemapFormGroup } from '@map-config/services/map-basemap-form-builder/map-basemap-form-builder.service';
import { MapGlobalFormGroup } from '@map-config/services/map-global-form-builder/map-global-form-builder.service';
import { SearchGlobalFormGroup } from '@search-config/services/search-global-form-builder/form-group';
import { CollectionService } from '@services/collection-service/collection.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { StartupService } from '@services/startup/startup.service';
import {
    SideModulesGlobalFormGroup
} from '@side-modules-config/services/side-modules-global-form-builder/side-modules-global-form-builder.service';
import { TimelineGlobalFormGroup } from '@timeline-config/services/timeline-global-form-builder/timeline-global-form-builder.service';
import { ArlasCollaborativesearchService, ArlasSettingsService } from 'arlas-wui-toolkit';
import { vi } from 'vitest';
import { mockArlasCollaborativeSearchService } from './arlas-collaborative-search.service.mock';
import { mockArlasSettingsService } from './arlas-settings.service.mock';
import { mockCollectionService } from './collection.service.mock';

export const mockMainFormService = {
    mapConfig: {
        control: new FormGroup([]),
        getLayersFa: vi.fn(() => new FormArray([])),
        getVisualisationsFa: vi.fn(() => new FormArray([])),
        getGlobalFg: vi.fn(() => new MapGlobalFormGroup()),
        getBasemapsFg: vi.fn(() => new MapBasemapFormGroup(mockArlasSettingsService as unknown as ArlasSettingsService))
    },
    timelineConfig: {
        control: new FormGroup([]),
        getGlobalFg: vi.fn(() => new TimelineGlobalFormGroup(
            '', mockCollectionService as unknown as CollectionService, {} as unknown as StartupService,
            mockMainFormService as unknown as MainFormService, mockArlasSettingsService as unknown as ArlasSettingsService,
            new BucketsIntervalFormGroup('', mockCollectionService as unknown as CollectionService, 100)))
    },
    searchConfig: {
        control: new FormGroup([]),
        getGlobalFg: vi.fn(() => new SearchGlobalFormGroup())
    },
    analyticsConfig: {
        control: new FormGroup([]),
        getListFa: vi.fn(() => new FormArray([]))
    },
    resultListConfig: {
        control: new FormGroup([]),
        getResultListsFa: vi.fn(() => new FormArray([]))
    },
    sideModulesConfig: {
        control: new FormGroup([]),
        getGlobalFg: vi.fn(() => new SideModulesGlobalFormGroup(mockCollectionService as unknown as CollectionService,
            mockArlasCollaborativeSearchService as unknown as ArlasCollaborativesearchService))
    },
    lookAndFeelConfig: {
        control: new FormGroup({
            LookAndFeelConfigGlobal: new FormGroup({
                spinnerColor: new FormControl(),
                spinnerDiameter: new FormControl(),
                spinner: new FormControl()
            })
        }),
        getGlobalFg: vi.fn(() => new LookAndFeelGlobalFormGroup(mockMainFormService as unknown as MainFormService,
            mockCollectionService as unknown as CollectionService))
    },
    externalNodeConfig: {
        getExternalNodeFg: vi.fn(() => new FormGroup({
            externalNode: new FormControl(null)
        }))
    },
    getMainCollection: vi.fn(() => 'Test'),
    getAllCollections: vi.fn(() => [])
};
