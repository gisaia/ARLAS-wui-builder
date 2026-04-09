import { beforeEach, describe, expect, it } from "vitest";
import { FormArray } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MapLayerFormBuilderService } from '@map-config/services/map-layer-form-builder/map-layer-form-builder.service';
import { MapVisualisationFormBuilderService } from '@map-config/services/map-visualisation-form-builder/map-visualisation-form-builder.service';
import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator';
import { CollectionService } from '@services/collection-service/collection.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { ConfigFormGroupComponent } from '@shared-components/config-form-group/config-form-group.component';
import { ConfigFormGroup } from '@shared-models/config-form';
import { of } from 'rxjs';
import { EditLayerComponent } from './edit-layer.component';

describe('EditLayerComponent', () => {
    let spectator: Spectator<EditLayerComponent>;
    const createComponent = createComponentFactory({
        component: EditLayerComponent,
        imports: [
            RouterTestingModule.withRoutes([])
        ],
        providers: [
            mockProvider(MainFormService, {
                mapConfig: {
                    getLayersFa: () => new FormArray([]),
                    getVisualisationsFa: () => new FormArray([])
                }
            }),
            mockProvider(MapLayerFormBuilderService, {
                buildLayer: () => new ConfigFormGroup({})
            }),
            mockProvider(MapVisualisationFormBuilderService, {
                buildVisualisation: () => new ConfigFormGroup({})
            }),
            mockProvider(CollectionService, {
                getCollectionFields: () => of([])
            }),
        ],
        declarations: [
            ConfigFormGroupComponent
        ]
    });

    beforeEach(() => {
        spectator = createComponent();
    });

    it('should create', () => {
        expect(spectator.component).toBeTruthy();
    });

});
