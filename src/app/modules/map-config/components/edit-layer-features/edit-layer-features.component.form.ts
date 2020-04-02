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
import { ViewChild } from '@angular/core';
import { EditLayerModeFormComponent } from '../edit-layer-mode-form/edit-layer-mode-form.component';
import { NGXLogger } from 'ngx-logger';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';

export abstract class EditLayerFeaturesComponentForm extends ComponentSubForm {

    @ViewChild(EditLayerModeFormComponent, { static: true })
    public embeddedFeaturesComponent: EditLayerModeFormComponent;

    constructor(
        protected logger: NGXLogger,
        protected formBuilder: FormBuilder,
        protected formBuilderDefault: FormBuilderWithDefaultService
    ) {
        super(logger);
    }

    protected registerRendererGeometry() {
        this.geometryStep.addControl(
            'geometryCtrl',
            this.formBuilderDefault.control(
                'map.layer.geometryStep.geometryCtrl',
                [
                    Validators.required
                ]
            ));
    }

    protected registerGeometryType() {
        this.geometryStep.addControl(
            'geometryTypeCtrl',
            this.formBuilderDefault.control(
                'map.layer.geometryStep.geometryTypeCtrl',
                [
                    Validators.required
                ]
            ));
    }

    protected registerFeaturesMax() {
        (this.formFg.get('visibilityStep') as FormGroup)
            .addControl(
                'featuresMaxCtrl',
                this.formBuilderDefault.control(
                    'map.layer.visibilityStep.featuresMaxCtrl',
                    [
                        Validators.required,
                        Validators.max(10000),
                        Validators.min(0)
                    ]
                ));
    }

    get geometryStep() {
        return this.formFg.get('geometryStep') as FormGroup;
    }
    get geometryCtrl() {
        return this.formFg.get('geometryStep').get('geometryCtrl') as FormControl;
    }
    get geometryTypeCtrl() {
        return this.formFg.get('geometryStep').get('geometryTypeCtrl') as FormControl;
    }
    get featuresMaxCtrl() {
        return this.formFg.get('visibilityStep').get('featuresMaxCtrl') as FormControl;
    }
    get widthFg() {
        return this.formFg.get('styleStep').get('widthFg') as FormGroup;
    }
    get radiusFg() {
        return this.formFg.get('styleStep').get('radiusFg') as FormGroup;
    }
}
