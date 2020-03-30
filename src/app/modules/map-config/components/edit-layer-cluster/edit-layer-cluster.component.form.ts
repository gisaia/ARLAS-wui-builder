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
import { ComponentSubForm } from '@shared/ComponentSubForm';
import { NGXLogger } from 'ngx-logger';
import { EditLayerModeFormComponent } from '../edit-layer-mode-form/edit-layer-mode-form.component';
import { ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CLUSTER_GEOMETRY_TYPE } from '../edit-layer-mode-form/models';
import { CustomValidators } from '@utils/custom-validators';

export abstract class EditLayerClusterComponentForm extends ComponentSubForm {

    @ViewChild(EditLayerModeFormComponent, { static: true })
    public embeddedFeaturesComponent: EditLayerModeFormComponent;

    constructor(
        protected logger: NGXLogger,
        protected formBuilder: FormBuilder
    ) {
        super(logger);
    }

    protected registerAggGeometry() {
        (this.formFg.get('geometryStep') as FormGroup)
            .addControl(
                'aggGeometryCtrl',
                this.formBuilder.control('', [Validators.required]));
    }

    protected registerGranlularity() {
        (this.formFg.get('geometryStep') as FormGroup)
            .addControl(
                'granularityCtrl',
                this.formBuilder.control('', [Validators.required]));
    }

    protected registerClusterGeometryType() {
        (this.formFg.get('geometryStep') as FormGroup)
            .addControl(
                'clusterGeometryTypeCtrl',
                this.formBuilder.control('', [Validators.required]));
    }

    protected registerAggregatedGeometry() {
        (this.formFg.get('geometryStep') as FormGroup)
            .addControl(
                'aggregatedGeometryCtrl',
                this.formBuilder.control('', [
                    CustomValidators.getConditionalValidator(
                        () => !!this.clusterGeometryTypeCtrl
                            && this.clusterGeometryTypeCtrl.value === CLUSTER_GEOMETRY_TYPE.aggregated_geometry ? true : false,
                        Validators.required
                    )
                ]));
    }
    protected registerRawGeometry() {
        (this.formFg.get('geometryStep') as FormGroup)
            .addControl(
                'rawGeometryCtrl',
                this.formBuilder.control('', [
                    CustomValidators.getConditionalValidator(
                        () => !!this.clusterGeometryTypeCtrl
                            && this.clusterGeometryTypeCtrl.value === CLUSTER_GEOMETRY_TYPE.raw_geometry ? true : false,
                        Validators.required
                    )
                ]));
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
}

