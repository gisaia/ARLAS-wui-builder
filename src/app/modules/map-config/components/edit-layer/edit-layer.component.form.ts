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
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';
import { CustomValidators } from '@utils/custom-validators';
import { LAYER_MODE } from './models';

export abstract class EditLayerComponentForm {
    public layerFg: FormGroup;

    constructor(
        protected formBuilderDefault: FormBuilderWithDefaultService
    ) {
        this.layerFg = this.formBuilderDefault.group('map.layer', {
            name: ['', Validators.required],
            mode: ['', Validators.required],
            id: [''],
            featuresFg: [
                { value: null, disabled: true },
                CustomValidators.getConditionalValidator(
                    () => !!this.layerFg && this.mode.value === LAYER_MODE.features,
                    Validators.required
                )
            ],
            featureMetricFg: [
                { value: null, disabled: true },
                CustomValidators.getConditionalValidator(
                    () => !!this.layerFg && this.mode.value === LAYER_MODE.featureMetric,
                    Validators.required
                )
            ],
            clusterFg: [
                { value: null, disabled: true },
                CustomValidators.getConditionalValidator(
                    () => !!this.layerFg && this.mode.value === LAYER_MODE.cluster,
                    Validators.required
                )
            ]
        });
    }

    get mode() {
        return this.layerFg.get('mode');
    }
    get featuresFg() {
        return this.layerFg.get('featuresFg');
    }
    get featureMetricFg() {
        return this.layerFg.get('featureMetricFg');
    }
    get clusterFg() {
        return this.layerFg.get('clusterFg');
    }

}
