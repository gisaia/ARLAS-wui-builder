import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { mockArlasSettingsService } from '@app/test/arlas-settings.service.mock';
import { mockCollectionService } from '@app/test/collection.service.mock';
import { mockMainFormService } from '@app/test/main-form.service.mock';
import { mockPropertySelectorBuilderService } from '@app/test/property-selector-form-builder.service.mock';
import {
    MapLayerFormBuilderService, MapLayerFormGroup, MapLayerTypeClusterFormGroup, MapLayerTypeFeatureMetricFormGroup, MapLayerTypeFeaturesFormGroup
} from '@map-config/services/map-layer-form-builder/map-layer-form-builder.service';
import { MAP_LAYER_TYPE } from '@map-config/services/map-layer-form-builder/models';
import { TranslateLoader, TranslateModule, TranslateNoOpLoader } from '@ngx-translate/core';
import { CollectionService } from '@services/collection-service/collection.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { PropertySelectorFormBuilderService } from '@shared-services/property-selector-form-builder/property-selector-form-builder.service';
import { AwcColorGeneratorLoader, ColorGeneratorLoader, ColorGeneratorModule } from 'arlas-web-components';
import { ArlasSettingsService } from 'arlas-wui-toolkit';
import { LoggerModule } from 'ngx-logger';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EditLayerComponent } from './edit-layer.component';

describe('EditLayerComponent', () => {
    let component: EditLayerComponent;
    let fixture: ComponentFixture<EditLayerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                EditLayerComponent,
                LoggerModule.forRoot(null),
                TranslateModule.forRoot({
                    loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader }
                }),
                ColorGeneratorModule.forRoot({
                    loader: {
                        provide: ColorGeneratorLoader,
                        useClass: AwcColorGeneratorLoader
                    }
                }),
                RouterModule.forRoot([])
            ],
            providers: [
                {
                    provide: PropertySelectorFormBuilderService,
                    useValue: mockPropertySelectorBuilderService
                },
                {
                    provide: MainFormService,
                    useValue: mockMainFormService
                },
                {
                    provide: MapLayerFormBuilderService,
                    useValue: {
                        buildLayer: vi.fn(() => new MapLayerFormGroup({
                            collection: '',
                            edit: true,
                            clusterFg: new MapLayerTypeClusterFormGroup(
                                '', of([]), mockPropertySelectorBuilderService as unknown as PropertySelectorFormBuilderService,
                                mockArlasSettingsService as unknown as ArlasSettingsService),
                            collectionService: mockCollectionService as unknown as CollectionService,
                            featureMetricFg: new MapLayerTypeFeatureMetricFormGroup(
                                '', of([]), mockPropertySelectorBuilderService as unknown as PropertySelectorFormBuilderService),
                            featuresFg: new MapLayerTypeFeaturesFormGroup('', MAP_LAYER_TYPE.CLUSTER, of([]),
                                mockPropertySelectorBuilderService as unknown as PropertySelectorFormBuilderService, true, {}, [], []),
                            settingsService: mockArlasSettingsService as unknown as ArlasSettingsService,
                            vFa: new FormArray([])
                        }))
                    }
                },
                {
                    provide: CollectionService,
                    useValue: mockCollectionService
                }
            ]
        })
        .compileComponents();

        fixture = TestBed.createComponent(EditLayerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
