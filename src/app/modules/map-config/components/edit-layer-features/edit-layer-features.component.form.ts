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
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';
import { CustomValidators } from '@utils/custom-validators';
import { COLOR_SOURCE, KeywordColor } from './models';

export class EditLayerFeaturesComponentForm {

    public featuresFg: FormGroup;

    constructor(
        protected formBuilderDefault: FormBuilderWithDefaultService,
        protected formBuilder: FormBuilder
    ) {
        this.featuresFg = this.formBuilderDefault.group('map.layer', {
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
                colorSourceCtrl:
                    [
                        null,
                        Validators.required
                    ],
                colorFg: this.formBuilder.group({
                    colorFixCtrl:
                        [
                            null,
                            CustomValidators.getConditionalValidator(() => !!this.featuresFg ?
                                this.colorSourceCtrl.value === COLOR_SOURCE.fix :
                                false,
                                Validators.required)
                        ],
                    colorProvidedFieldCtrl:
                        [
                            null,
                            CustomValidators.getConditionalValidator(() => !!this.featuresFg ?
                                this.colorSourceCtrl.value === COLOR_SOURCE.provided :
                                false,
                                Validators.required)
                        ],
                    colorGeneratedFieldCtrl:
                        [
                            null,
                            CustomValidators.getConditionalValidator(() => !!this.featuresFg ?
                                this.colorSourceCtrl.value === COLOR_SOURCE.generated
                                : false,
                                Validators.required)
                        ],
                    colorManualFg: this.formBuilder.group({
                        colorManualFieldCtrl:
                            [
                                null,
                                CustomValidators.getConditionalValidator(() => !!this.featuresFg ?
                                    this.colorSourceCtrl.value === COLOR_SOURCE.manual :
                                    false,
                                    Validators.required)
                            ],
                        colorManualValuesCtrl: this.formBuilder.array(
                            [],
                            [
                                CustomValidators.getConditionalValidator(() => !!this.featuresFg ?
                                    this.colorSourceCtrl.value === COLOR_SOURCE.manual :
                                    false,
                                    Validators.required)
                            ])
                    }),
                    colorInterpolatedFg: this.formBuilder.group({
                        colorInterpolatedFieldCtrl:
                            [
                                null,
                                CustomValidators.getConditionalValidator(() => !!this.featuresFg ?
                                    this.colorSourceCtrl.value === COLOR_SOURCE.interpolated :
                                    false,
                                    Validators.required)
                            ],
                        colorInterpolatedNormalizeCtrl:
                            [
                                null
                            ],
                        colorInterpolatedScopeCtrl:
                            [
                                null,
                                CustomValidators.getConditionalValidator(() => !!this.featuresFg ?
                                    this.colorSourceCtrl.value === COLOR_SOURCE.interpolated
                                    && this.colorInterpolatedNormalizeCtrl.value
                                    : false,
                                    Validators.required)
                            ],
                        colorInterpolatedNormalizeByKeyCtrl:
                            [
                                null
                            ],
                        colorInterpolatedNormalizeLocalFieldCtrl:
                            [
                                null,
                                CustomValidators.getConditionalValidator(() => !!this.featuresFg ?
                                    this.colorSourceCtrl.value === COLOR_SOURCE.interpolated
                                    && this.colorInterpolatedNormalizeByKeyCtrl.value :
                                    false,
                                    Validators.required)
                            ],
                        colorInterpolatedMinValueCtrl:
                            [
                                null,
                                CustomValidators.getConditionalValidator(() => !!this.featuresFg ?
                                    this.colorSourceCtrl.value === COLOR_SOURCE.interpolated && this.colorInterpolatedFieldCtrl.value
                                    && !this.colorInterpolatedNormalizeCtrl.value :
                                    false,
                                    Validators.required)
                            ],
                        colorInterpolatedMaxValueCtrl:
                            [
                                null,
                                CustomValidators.getConditionalValidator(() => !!this.featuresFg ?
                                    this.colorSourceCtrl.value === COLOR_SOURCE.interpolated && this.colorInterpolatedFieldCtrl.value
                                    && !this.colorInterpolatedNormalizeCtrl.value :
                                    false,
                                    Validators.required)
                            ],
                        colorInterpolatedPaletteCtrl:
                            [
                                null,
                                [
                                    CustomValidators.getConditionalValidator(() => !!this.featuresFg ?
                                        this.colorSourceCtrl.value === COLOR_SOURCE.interpolated
                                        && this.colorInterpolatedFieldCtrl.value :
                                        false,
                                        Validators.required)
                                ]
                            ]
                    }, {
                        validators: [
                            CustomValidators.getConditionalValidator(() => !!this.featuresFg ?
                                this.colorSourceCtrl.value === COLOR_SOURCE.interpolated && this.colorInterpolatedFieldCtrl.value
                                && this.colorInterpolatedMinValueCtrl.value && this.colorInterpolatedMaxValueCtrl.value :
                                false,
                                CustomValidators.getLTEValidator('colorInterpolatedMinValueCtrl', 'colorInterpolatedMaxValueCtrl'))
                        ]
                    })
                })
            })
        });
    }

    get zoomMinCtrl() {
        return this.featuresFg.get('visibilityStep').get('zoomMinCtrl');
    }
    get zoomMaxCtrl() {
        return this.featuresFg.get('visibilityStep').get('zoomMaxCtrl');
    }
    get collectionCtrl() {
        return this.featuresFg.get('collectionStep').get('collectionCtrl');
    }
    get geometryCtrl() {
        return this.featuresFg.get('geometryStep').get('geometryCtrl');
    }
    get colorSourceCtrl() {
        return this.featuresFg.get('styleStep').get('colorSourceCtrl');
    }
    get colorFg() {
        return this.featuresFg.get('styleStep').get('colorFg') as FormGroup;
    }
    get colorFixCtrl() {
        return this.colorFg.get('colorFixCtrl');
    }
    get colorProvidedFieldCtrl() {
        return this.colorFg.get('colorProvidedFieldCtrl');
    }
    get colorGeneratedFieldCtrl() {
        return this.colorFg.get('colorGeneratedFieldCtrl');
    }
    get colorManualFg() {
        return this.colorFg.get('colorManualFg') as FormGroup;
    }
    get colorManualFieldCtrl() {
        return this.colorManualFg.get('colorManualFieldCtrl');
    }
    get colorManualValuesCtrl() {
        return this.colorManualFg.get('colorManualValuesCtrl') as FormArray;
    }
    get colorInterpolatedFg() {
        return this.colorFg.get('colorInterpolatedFg') as FormGroup;
    }
    get colorInterpolatedFieldCtrl() {
        return this.colorInterpolatedFg.get('colorInterpolatedFieldCtrl');
    }
    get colorInterpolatedNormalizeCtrl() {
        return this.colorInterpolatedFg.get('colorInterpolatedNormalizeCtrl');
    }
    get colorInterpolatedNormalizeByKeyCtrl() {
        return this.colorInterpolatedFg.get('colorInterpolatedNormalizeByKeyCtrl');
    }
    get colorInterpolatedNormalizeLocalFieldCtrl() {
        return this.colorInterpolatedFg.get('colorInterpolatedNormalizeLocalFieldCtrl');
    }
    get colorInterpolatedScopeCtrl() {
        return this.colorInterpolatedFg.get('colorInterpolatedScopeCtrl');
    }
    get colorInterpolatedMinValueCtrl() {
        return this.colorInterpolatedFg.get('colorInterpolatedMinValueCtrl');
    }
    get colorInterpolatedMaxValueCtrl() {
        return this.colorInterpolatedFg.get('colorInterpolatedMaxValueCtrl');
    }
    get colorInterpolatedPaletteCtrl() {
        return this.colorInterpolatedFg.get('colorInterpolatedPaletteCtrl');
    }

    public setColorFix(color: string) {
        this.colorFixCtrl.setValue(color);
        this.colorFixCtrl.markAsDirty();
        this.colorFixCtrl.markAsTouched();
    }

    protected addToColorManualValuesCtrl(kc: KeywordColor) {
        const keywordColorGrp = this.formBuilder.group({
            keyword: [kc.keyword],
            color: [kc.color]
        });
        this.colorManualValuesCtrl.push(keywordColorGrp);
    }

}
