/*
Licensed to Gisaïa under one or more contributor
license agreements. See the NOTICE.txt file distributed with
this work for additional information regarding copyright
ownership. Gisaïa licenses this file to you under
the Apache License, Version 2.0 (the "License"); you may
not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';
import { ComponentSubForm } from '@shared/ComponentSubForm';
import { CustomValidators } from '@utils/custom-validators';
import { NGXLogger } from 'ngx-logger';
import { CLUSTER_GEOMETRY_TYPE } from '../edit-layer-mode-form/models';
import { EditLayerModeFormComponent } from '../edit-layer-mode-form/edit-layer-mode-form.component';
import { ViewChild } from '@angular/core';
import { PROPERTY_SELECTOR_SOURCE } from '@shared-components/property-selector/models';

export abstract class EditLayerClusterComponentForm extends ComponentSubForm {

    @ViewChild(EditLayerModeFormComponent, { static: true }) public embeddedFeaturesComponent: EditLayerModeFormComponent;
    public sortDirection: string;
    public colorFgSources: Array<PROPERTY_SELECTOR_SOURCE> = [PROPERTY_SELECTOR_SOURCE.fix];

    constructor(
        protected logger: NGXLogger,
        protected formBuilder: FormBuilder,
        protected formBuilderDefault: FormBuilderWithDefaultService
    ) {
        super(logger);
    }

    protected registerAggGeometry() {
        this.geometryStep.addControl(
            'aggGeometry',
            this.formBuilderDefault.control('map.layer.geometryStep.aggGeometry', [Validators.required]));
    }

    protected registerGranlularity() {
        this.geometryStep.addControl(
            'granularity',
            this.formBuilderDefault.control('map.layer.geometryStep.granularity', [Validators.required]));
    }

    protected registerClusterGeometryType() {
        this.geometryStep.addControl(
            'clusterGeometryType',
            this.formBuilderDefault.control('map.layer.geometryStep.clusterGeometryType', [Validators.required]));
    }

    protected registerAggregatedGeometry() {
        this.geometryStep.addControl(
            'aggregatedGeometry',
            this.formBuilderDefault.control('map.layer.geometryStep.aggregatedGeometry', [
                CustomValidators.getConditionalValidator(
                    () => !!this.clusterGeometryType
                        && this.clusterGeometryType.value === CLUSTER_GEOMETRY_TYPE.aggregated_geometry,
                    Validators.required
                )
            ]));
    }
    protected registerRawGeometry() {
        this.geometryStep.addControl(
            'rawGeometry',
            this.formBuilderDefault.control('map.layer.geometryStep.rawGeometry', [
                CustomValidators.getConditionalValidator(
                    () => !!this.clusterGeometryType
                        && this.clusterGeometryType.value === CLUSTER_GEOMETRY_TYPE.raw_geometry,
                    Validators.required
                )
            ]));
    }
    protected registerClusterSort() {
        this.geometryStep.addControl(
            'clusterSort',
            this.formBuilderDefault.control('map.layer.geometryStep.clusterSort'));
    }

    protected registerFeaturesMin() {
        (this.formFg.get('visibilityStep') as FormGroup)
            .addControl(
                'featuresMin',
                this.formBuilderDefault.control(
                    'map.layer.visibilityStep.featuresMin',
                    [
                        Validators.required
                    ]
                ));
    }

    protected registerGeometryType() {
        (this.formFg.get('styleStep') as FormGroup)
            .addControl(
                'geometryType',
                this.formBuilderDefault.control(
                    'map.layer.styleStep.geometryType',
                    [
                        Validators.required
                    ]
                ));
    }


    get geometryStep() {
        return this.formFg.get('geometryStep') as FormGroup;
    }
    get aggGeometry() {
        return this.formFg.get('geometryStep').get('aggGeometry') as FormControl;
    }
    get granularity() {
        return this.formFg.get('geometryStep').get('granularity') as FormControl;
    }
    get clusterGeometryType() {
        return this.formFg.get('geometryStep').get('clusterGeometryType') as FormControl;
    }
    get aggregatedGeometry() {
        return this.formFg.get('geometryStep').get('aggregatedGeometry') as FormControl;
    }
    get rawGeometry() {
        return this.formFg.get('geometryStep').get('rawGeometry') as FormControl;
    }
    get clusterSort() {
        return this.formFg.get('geometryStep').get('clusterSort') as FormControl;
    }
    get featuresMin() {
        return this.formFg.get('visibilityStep').get('featuresMin') as FormControl;
    }
    get geometryType() {
        return this.formFg.get('styleStep').get('geometryType') as FormControl;
    }
    get widthFg() {
        return this.formFg.get('styleStep').get('widthFg') as FormGroup;
    }
    get radiusFg() {
        return this.formFg.get('styleStep').get('radiusFg') as FormGroup;
    }
    get weightFg() {
        return this.formFg.get('styleStep').get('weightFg') as FormGroup;
    }
    get intensityFg() {
        return this.formFg.get('styleStep').get('intensityFg') as FormGroup;
    }
    get colorFg() {
        return this.formFg.get('styleStep').get('colorFg') as FormGroup;
    }
}

