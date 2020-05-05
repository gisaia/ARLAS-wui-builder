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
import { ComponentSubForm } from '@shared-models/component-sub-form';
import { ViewChild } from '@angular/core';
import { EditLayerModeFormComponent } from '../edit-layer-mode-form/edit-layer-mode-form.component';
import { NGXLogger } from 'ngx-logger';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';
import { MapLayerFormBuilderService } from '@map-config/services/map-layer-form-builder/map-layer-form-builder.service';

export abstract class EditLayerFeaturesComponentForm extends ComponentSubForm {

    constructor(
        protected logger: NGXLogger,
    ) {
        super(logger);

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

}
