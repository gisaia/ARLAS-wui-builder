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

export abstract class EditLayerFeaturesComponentForm extends ComponentSubForm {

    constructor(
        protected formBuilderDefault: FormBuilderWithDefaultService,
        protected formBuilder: FormBuilder,
        protected logger: NGXLogger
    ) {
        super(logger);

        this.formFg = this.formBuilderDefault.group('map.layer', {
            collectionStep: this.formBuilder.group({
                collectionCtrl:
                    [
                        null,
                        Validators.required
                    ]
            }),
            geometryStep: this.formBuilder.group({
                geometryCtrl:
                    [
                        null,
                        Validators.required
                    ],
                geometryTypeCtrl:
                    [
                        null,
                        Validators.required
                    ]
            }),
            visibilityStep: this.formBuilder.group({
                visibleCtrl:
                    [
                        null
                    ],
                zoomMinCtrl:
                    [
                        null,
                        [
                            Validators.required, Validators.min(1), Validators.max(20)
                        ]
                    ],
                zoomMaxCtrl:
                    [
                        null,
                        [
                            Validators.required, Validators.min(1), Validators.max(20)
                        ]
                    ],
                featuresMaxCtrl:
                    [
                        null,
                        [
                            Validators.required,
                            Validators.max(10000),
                            Validators.min(0)
                        ]
                    ]
            },
                {
                    validator:
                        [
                            CustomValidators.getLTEValidator('zoomMinCtrl', 'zoomMaxCtrl')
                        ]
                }),
            styleStep: this.formBuilder.group({
                opacityCtrl:
                    [
                        null
                    ],
                colorFg: [
                    null,
                    Validators.required
                ]
            })
        });
    }

    get zoomMinCtrl() {
        return this.formFg.get('visibilityStep').get('zoomMinCtrl');
    }
    get zoomMaxCtrl() {
        return this.formFg.get('visibilityStep').get('zoomMaxCtrl');
    }
    get collectionCtrl() {
        return this.formFg.get('collectionStep').get('collectionCtrl');
    }
    get geometryCtrl() {
        return this.formFg.get('geometryStep').get('geometryCtrl');
    }
    get colorFg() {
        return this.formFg.get('styleStep').get('colorFg') as FormGroup;
    }


}
