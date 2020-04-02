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

export abstract class EditLayerClusterComponentForm extends ComponentSubForm {

    @ViewChild(EditLayerModeFormComponent, { static: true }) public embeddedFeaturesComponent: EditLayerModeFormComponent;
    public sortDirection: string;

    constructor(
        protected logger: NGXLogger,
        protected formBuilder: FormBuilder,
        protected formBuilderDefault: FormBuilderWithDefaultService
    ) {
        super(logger);
    }

    protected registerAggGeometry() {
        this.geometryStep.addControl(
            'aggGeometryCtrl',
            this.formBuilderDefault.control('map.layer.geometryStep.aggGeometryCtrl', [Validators.required]));
    }

    protected registerGranlularity() {
        this.geometryStep.addControl(
            'granularityCtrl',
            this.formBuilderDefault.control('map.layer.geometryStep.granularityCtrl', [Validators.required]));
    }

    protected registerClusterGeometryType() {
        this.geometryStep.addControl(
            'clusterGeometryTypeCtrl',
            this.formBuilderDefault.control('map.layer.geometryStep.clusterGeometryTypeCtrl', [Validators.required]));
    }

    protected registerAggregatedGeometry() {
        this.geometryStep.addControl(
            'aggregatedGeometryCtrl',
            this.formBuilderDefault.control('map.layer.geometryStep.aggregatedGeometryCtrl', [
                CustomValidators.getConditionalValidator(
                    () => !!this.clusterGeometryTypeCtrl
                        && this.clusterGeometryTypeCtrl.value === CLUSTER_GEOMETRY_TYPE.aggregated_geometry,
                    Validators.required
                )
            ]));
    }
    protected registerRawGeometry() {
        this.geometryStep.addControl(
            'rawGeometryCtrl',
            this.formBuilderDefault.control('map.layer.geometryStep.rawGeometryCtrl', [
                CustomValidators.getConditionalValidator(
                    () => !!this.clusterGeometryTypeCtrl
                        && this.clusterGeometryTypeCtrl.value === CLUSTER_GEOMETRY_TYPE.raw_geometry,
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
                'featuresMinCtrl',
                this.formBuilderDefault.control(
                    'map.layer.visibilityStep.featuresMinCtrl',
                    [
                        Validators.required
                    ]
                ));
    }


    get geometryStep() {
        return this.formFg.get('geometryStep') as FormGroup;
    }
    get aggGeometryCtrl() {
        return this.formFg.get('geometryStep').get('aggGeometryCtrl') as FormControl;
    }
    get granularityCtrl() {
        return this.formFg.get('geometryStep').get('granularityCtrl') as FormControl;
    }
    get clusterGeometryTypeCtrl() {
        return this.formFg.get('geometryStep').get('clusterGeometryTypeCtrl') as FormControl;
    }
    get aggregatedGeometryCtrl() {
        return this.formFg.get('geometryStep').get('aggregatedGeometryCtrl') as FormControl;
    }
    get rawGeometryCtrl() {
        return this.formFg.get('geometryStep').get('rawGeometryCtrl') as FormControl;
    }
    get clusterSort() {
        return this.formFg.get('geometryStep').get('clusterSort') as FormControl;
    }
    get featuresMinCtrl() {
        return this.formFg.get('visibilityStep').get('featuresMinCtrl') as FormControl;
    }
    get widthFg() {
        return this.formFg.get('styleStep').get('widthFg') as FormGroup;
    }
    get radiusFg() {
        return this.formFg.get('styleStep').get('radiusFg') as FormGroup;
    }
}

