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
import { FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { CustomValidators } from '@utils/custom-validators';
import { PROPERTY_SELECTOR_SOURCE, KeywordColor, PROPERTY_TYPE } from './models';
import { ComponentSubForm } from '@shared/ComponentSubForm';
import { NGXLogger } from 'ngx-logger';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';
import { Input } from '@angular/core';

export abstract class PropertySelectorComponentForm extends ComponentSubForm {

    @Input() public aggregated: boolean;

    constructor(
        protected formBuilder: FormBuilder,
        protected formBuilderDefault: FormBuilderWithDefaultService,
        protected logger: NGXLogger
    ) {
        super(logger);

        this.formFg = this.formBuilder.group({
            propertySourceCtrl:
                [
                    null,
                    Validators.required
                ],
            propertyFixCtrl:
                [
                    null,
                    CustomValidators.getConditionalValidator(() => !!this.formFg ?
                        this.propertySourceCtrl.value === PROPERTY_SELECTOR_SOURCE.fix
                        : false,
                        Validators.required)
                ],
            propertyProvidedFieldCtrl:
                [
                    null,
                    CustomValidators.getConditionalValidator(() => !!this.formFg ?
                        this.propertySourceCtrl.value === PROPERTY_SELECTOR_SOURCE.provided
                        : false,
                        Validators.required)
                ],
            propertyGeneratedFieldCtrl:
                [
                    null,
                    CustomValidators.getConditionalValidator(() => !!this.formFg ?
                        this.propertySourceCtrl.value === PROPERTY_SELECTOR_SOURCE.generated
                        : false,
                        Validators.required)
                ],
            propertyManualFg: this.formBuilder.group({
                propertyManualFieldCtrl:
                    [
                        null,
                        CustomValidators.getConditionalValidator(() => !!this.formFg ?
                            this.propertySourceCtrl.value === PROPERTY_SELECTOR_SOURCE.manual
                            : false,
                            Validators.required)
                    ],
                propertyManualValuesCtrl: this.formBuilder.array(
                    [],
                    [
                        CustomValidators.getConditionalValidator(() => !!this.formFg ?
                            this.propertySourceCtrl.value === PROPERTY_SELECTOR_SOURCE.manual
                            : false,
                            Validators.required)
                    ])
            }),
            propertyInterpolatedFg: this.formBuilder.group({
                propertyInterpolatedCountOrMetricCtrl:
                    [
                        null,
                        CustomValidators.getConditionalValidator(() => !!this.formFg && this.aggregated ?
                            this.propertySourceCtrl.value === PROPERTY_SELECTOR_SOURCE.interpolated
                            : false,
                            Validators.required)
                    ],
                propertyInterpolatedMetricCtrl: [
                    null,
                    CustomValidators.getConditionalValidator(() => !!this.formFg && this.aggregated ?
                        this.propertySourceCtrl.value === PROPERTY_SELECTOR_SOURCE.interpolated
                        && this.propertyInterpolatedCountOrMetricCtrl.value
                        : false,
                        Validators.required)
                ],
                propertyInterpolatedFieldCtrl:
                    [
                        null,
                        CustomValidators.getConditionalValidator(() => !!this.formFg ?
                            this.propertySourceCtrl.value === PROPERTY_SELECTOR_SOURCE.interpolated
                            && (!this.aggregated || this.aggregated && this.propertyInterpolatedMetricCtrl.value)
                            : false,
                            Validators.required)
                    ],
                propertyInterpolatedNormalizeCtrl:
                    [
                        null
                    ],
                propertyInterpolatedScopeCtrl:
                    [
                        null,
                        CustomValidators.getConditionalValidator(() => !!this.formFg && !this.aggregated ?
                            this.propertySourceCtrl.value === PROPERTY_SELECTOR_SOURCE.interpolated
                            && this.propertyInterpolatedNormalizeCtrl.value
                            : false,
                            Validators.required)
                    ],
                propertyInterpolatedNormalizeByKeyCtrl:
                    [
                        null
                    ],
                propertyInterpolatedNormalizeLocalFieldCtrl:
                    [
                        null,
                        CustomValidators.getConditionalValidator(() => !!this.formFg && !this.aggregated ?
                            this.propertySourceCtrl.value === PROPERTY_SELECTOR_SOURCE.interpolated
                            && this.propertyInterpolatedNormalizeByKeyCtrl.value
                            : false,
                            Validators.required)
                    ],
                propertyInterpolatedMinFieldValueCtrl:
                    [
                        null,
                        CustomValidators.getConditionalValidator(() => !!this.formFg ?
                            this.propertySourceCtrl.value === PROPERTY_SELECTOR_SOURCE.interpolated
                            && this.propertyInterpolatedFieldCtrl.value && !this.propertyInterpolatedNormalizeCtrl.value
                            : false,
                            Validators.required)
                    ],
                propertyInterpolatedMaxFieldValueCtrl:
                    [
                        null,
                        CustomValidators.getConditionalValidator(() => !!this.formFg ?
                            this.propertySourceCtrl.value === PROPERTY_SELECTOR_SOURCE.interpolated
                            && this.propertyInterpolatedFieldCtrl.value && !this.propertyInterpolatedNormalizeCtrl.value
                            : false,
                            Validators.required)
                    ],
                propertyInterpolatedMinValueCtrl:
                    [
                        null,
                        CustomValidators.getConditionalValidator(() => !!this.formFg ?
                            this.propertySourceCtrl.value === PROPERTY_SELECTOR_SOURCE.interpolated
                            && this.getPropertyType() === PROPERTY_TYPE.number
                            && this.propertyInterpolatedFieldCtrl.value && !this.propertyInterpolatedNormalizeCtrl.value
                            : false,
                            Validators.required)
                    ],
                propertyInterpolatedMaxValueCtrl:
                    [
                        null,
                        CustomValidators.getConditionalValidator(() => !!this.formFg ?
                            this.propertySourceCtrl.value === PROPERTY_SELECTOR_SOURCE.interpolated
                            && this.getPropertyType() === PROPERTY_TYPE.number
                            && this.propertyInterpolatedFieldCtrl.value && !this.propertyInterpolatedNormalizeCtrl.value
                            : false,
                            Validators.required)
                    ],
                propertyInterpolatedValuesCtrl:
                    [
                        null,
                        [
                            CustomValidators.getConditionalValidator(() => !!this.formFg ?
                                this.propertySourceCtrl.value === PROPERTY_SELECTOR_SOURCE.interpolated
                                && this.propertyInterpolatedFieldCtrl.value
                                : false,
                                Validators.required)
                        ]
                    ]
            }, {
                validators: [
                    CustomValidators.getConditionalValidator(() => !!this.formFg ?
                        this.propertySourceCtrl.value === PROPERTY_SELECTOR_SOURCE.interpolated && this.propertyInterpolatedFieldCtrl.value
                        && this.propertyInterpolatedMinFieldValueCtrl.value && this.propertyInterpolatedMaxFieldValueCtrl.value
                        : false,
                        CustomValidators.getLTEValidator('propertyInterpolatedMinFieldValueCtrl', 'propertyInterpolatedMaxFieldValueCtrl'))
                ]
            })
        });
    }

    get propertySourceCtrl() {
        return this.formFg.get('propertySourceCtrl');
    }
    get propertyFixCtrl() {
        return this.formFg.get('propertyFixCtrl');
    }
    get propertyProvidedFieldCtrl() {
        return this.formFg.get('propertyProvidedFieldCtrl');
    }
    get propertyGeneratedFieldCtrl() {
        return this.formFg.get('propertyGeneratedFieldCtrl');
    }
    get propertyManualFg() {
        return this.formFg.get('propertyManualFg') as FormGroup;
    }
    get propertyManualFieldCtrl() {
        return this.propertyManualFg.get('propertyManualFieldCtrl');
    }
    get propertyManualValuesCtrl() {
        return this.propertyManualFg.get('propertyManualValuesCtrl') as FormArray;
    }
    get propertyInterpolatedFg() {
        return this.formFg.get('propertyInterpolatedFg') as FormGroup;
    }
    get propertyInterpolatedCountOrMetricCtrl() {
        return this.propertyInterpolatedFg.get('propertyInterpolatedCountOrMetricCtrl');
    }
    get propertyInterpolatedMetricCtrl() {
        return this.propertyInterpolatedFg.get('propertyInterpolatedMetricCtrl');
    }
    get propertyInterpolatedFieldCtrl() {
        return this.propertyInterpolatedFg.get('propertyInterpolatedFieldCtrl');
    }
    get propertyInterpolatedNormalizeCtrl() {
        return this.propertyInterpolatedFg.get('propertyInterpolatedNormalizeCtrl');
    }
    get propertyInterpolatedNormalizeByKeyCtrl() {
        return this.propertyInterpolatedFg.get('propertyInterpolatedNormalizeByKeyCtrl');
    }
    get propertyInterpolatedNormalizeLocalFieldCtrl() {
        return this.propertyInterpolatedFg.get('propertyInterpolatedNormalizeLocalFieldCtrl');
    }
    get propertyInterpolatedScopeCtrl() {
        return this.propertyInterpolatedFg.get('propertyInterpolatedScopeCtrl');
    }
    get propertyInterpolatedMinFieldValueCtrl() {
        return this.propertyInterpolatedFg.get('propertyInterpolatedMinFieldValueCtrl');
    }
    get propertyInterpolatedMaxFieldValueCtrl() {
        return this.propertyInterpolatedFg.get('propertyInterpolatedMaxFieldValueCtrl');
    }
    get propertyInterpolatedMinValueCtrl() {
        return this.propertyInterpolatedFg.get('propertyInterpolatedMinValueCtrl');
    }
    get propertyInterpolatedMaxValueCtrl() {
        return this.propertyInterpolatedFg.get('propertyInterpolatedMaxValueCtrl');
    }
    get propertyInterpolatedValuesCtrl() {
        return this.propertyInterpolatedFg.get('propertyInterpolatedValuesCtrl');
    }

    public setPropertyFix(value: string) {
        this.propertyFixCtrl.setValue(value);
        this.propertyFixCtrl.markAsDirty();
        this.propertyFixCtrl.markAsTouched();
    }

    protected addToColorManualValuesCtrl(kc: KeywordColor) {
        const keywordColorGrp = this.formBuilder.group({
            keyword: [kc.keyword],
            color: [kc.color]
        });
        this.propertyManualValuesCtrl.push(keywordColorGrp);
    }

    protected abstract getPropertyType(): PROPERTY_TYPE;

}
