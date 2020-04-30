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
import { NGXLogger } from 'ngx-logger';
import { EditLayerModeFormComponent } from '../edit-layer-mode-form/edit-layer-mode-form.component';
import { ViewChild } from '@angular/core';
import { ComponentSubForm } from '@shared-models/component-sub-form';

export abstract class EditLayerFeatureMetricComponentForm extends ComponentSubForm {
    @ViewChild(EditLayerModeFormComponent, { static: true }) public embeddedFeaturesComponent: EditLayerModeFormComponent;
    constructor(
        protected logger: NGXLogger,
        protected formBuilder: FormBuilder,
        protected formBuilderDefault: FormBuilderWithDefaultService
    ) {
        super(logger);
    }

    protected registerRendererGeometry() {
        this.geometryStep.addControl(
            'geometry',
            this.formBuilderDefault.control(
                'map.layer.geometryStep.geometry',
                [
                    Validators.required
                ]
            ));
    }

    protected registerGranularity() {
        this.geometryStep.addControl(
            'granularity',
            this.formBuilderDefault.control('map.layer.geometryStep.granularity', [Validators.required]));
    }

    protected registerGeometryId() {
        this.geometryStep.addControl(
            'geometryId',
            this.formBuilderDefault.control(
                'map.layer.geometryStep.geometryId',
                [
                    Validators.required
                ]
            ));
    }

    protected registerFeaturesMax() {
        (this.formFg.get('visibilityStep') as FormGroup)
            .addControl(
                'featuresMax',
                this.formBuilderDefault.control(
                    'map.layer.visibilityStep.featuresMax',
                    [
                        Validators.required,
                        Validators.max(10000),
                        Validators.min(0)
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
    get granularity() {
        return this.formFg.get('geometryStep').get('granularity') as FormControl;
    }
    get widthFg() {
        return this.formFg.get('styleStep').get('widthFg') as FormGroup;
    }
    get radiusFg() {
        return this.formFg.get('styleStep').get('radiusFg') as FormGroup;
    }
    get intensityFg() {
        return this.formFg.get('styleStep').get('intensityFg') as FormGroup;
    }
    get weightFg() {
        return this.formFg.get('styleStep').get('weightFg') as FormGroup;
    }
    get geometry() {
        return this.formFg.get('geometryStep').get('geometry') as FormControl;
    }
    get geometryType() {
        return this.formFg.get('styleStep').get('geometryType') as FormControl;
    }
    get featuresMax() {
        return this.formFg.get('visibilityStep').get('featuresMax') as FormControl;
    }
    get geometryId() {
        return this.formFg.get('geometryStep').get('geometryId') as FormControl;
    }

}
