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
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { EditLayerModeFormComponent } from '../edit-layer-mode-form/edit-layer-mode-form.component';
import { ViewChild } from '@angular/core';

export abstract class EditLayerFeatureMetricComponentForm extends ComponentSubForm {

    @ViewChild(EditLayerModeFormComponent, { static: true })
    public embeddedFeaturesComponent: EditLayerModeFormComponent;

    constructor(
        protected logger: NGXLogger,
        protected formBuilder: FormBuilder
    ) {
        super(logger);
    }

    protected registerGeometryId() {
        (this.formFg.get('geometryStep') as FormGroup)
            .addControl(
                'geometryIdCtrl',
                this.formBuilder.control(
                    '',
                    [
                        Validators.required
                    ]
                ));
    }

    get geometryIdCtrl() {
        return this.embeddedFeaturesComponent.formFg.get('geometryStep').get('geometryIdCtrl') as FormControl;
    }

}