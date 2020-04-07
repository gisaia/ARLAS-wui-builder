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
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';
import { CustomValidators } from '@utils/custom-validators';
import { ComponentSubForm } from '@shared/ComponentSubForm';
import { NGXLogger } from 'ngx-logger';
import { GEOMETRY_TYPE } from '@map-config/components/edit-layer-mode-form/models';

export abstract class EditLayerModeFormComponentForm extends ComponentSubForm {

    constructor(
        protected formBuilderDefault: FormBuilderWithDefaultService,
        protected formBuilder: FormBuilder,
        protected logger: NGXLogger
    ) {
        super(logger);

        this.formFg = this.formBuilderDefault.group('map.layer', {
            collectionStep: this.formBuilder.group({
                collection: [
                    null,
                    Validators.required
                ]
            }),
            geometryStep: this.formBuilder.group({

            }),
            visibilityStep: this.formBuilder.group(
                {
                    visible: [
                        null
                    ],
                    zoomMin: [
                        null,
                        [
                            Validators.required, Validators.min(1), Validators.max(20)
                        ]
                    ],
                    zoomMax: [
                        null,
                        [
                            Validators.required, Validators.min(1), Validators.max(20)
                        ]
                    ]
                },
                {
                    validator: [
                        CustomValidators.getLTEValidator('zoomMin', 'zoomMax')
                    ]
                }),
            styleStep: this.formBuilder.group({
                opacity: [
                    null
                ],
                colorFg: [
                    null,
                    Validators.required
                ],
                widthFg: [
                    null,
                    CustomValidators.getConditionalValidator(
                        () => !!this.formFg && !!this.geometryType && this.geometryType.value === GEOMETRY_TYPE.line,
                        Validators.required
                    )
                ],
                radiusFg: [
                    null,
                    CustomValidators.getConditionalValidator(
                        () => !!this.formFg && !!this.geometryType
                            && (this.geometryType.value === GEOMETRY_TYPE.circle || this.geometryType.value === GEOMETRY_TYPE.heatmap),
                        Validators.required
                    )
                ],
                weightFg: [
                    null,
                    CustomValidators.getConditionalValidator(
                        () => !!this.formFg && !!this.geometryType && this.geometryType.value === GEOMETRY_TYPE.heatmap,
                        Validators.required
                    )
                ],
                intensityFg: [
                    null,
                    CustomValidators.getConditionalValidator(
                        () => !!this.formFg && !!this.geometryType && this.geometryType.value === GEOMETRY_TYPE.heatmap,
                        Validators.required
                    )
                ]
            })
        });
    }

    get zoomMin() {
        return this.formFg.get('visibilityStep').get('zoomMin');
    }
    get zoomMax() {
        return this.formFg.get('visibilityStep').get('zoomMax');
    }
    get collection() {
        return this.formFg.get('collectionStep').get('collection');
    }
    get geometry() {
        return this.formFg.get('geometryStep').get('geometry');
    }
    get geometryType() {
        return this.formFg.get('styleStep').get('geometryType');
    }
    get colorFg() {
        return this.formFg.get('styleStep').get('colorFg') as FormGroup;
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
}
