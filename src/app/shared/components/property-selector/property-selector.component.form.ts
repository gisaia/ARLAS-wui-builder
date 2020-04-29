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
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { ComponentSubForm } from '@shared-models/component-sub-form';
import { NGXLogger } from 'ngx-logger';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';
import { Input, OnInit } from '@angular/core';
import { KeywordColor } from '@map-config/components/dialog-color-table/models';
import { PropertySelectorFormBuilderService } from '@shared/services/property-selector-form-builder/property-selector-form-builder.service';
import { PROPERTY_TYPE } from './models';

export abstract class PropertySelectorComponentForm extends ComponentSubForm implements OnInit {

    @Input() public aggregated: boolean;

    constructor(
        protected logger: NGXLogger,
        protected formBuilder: FormBuilder,
        protected propertySelectorFormBuilder: PropertySelectorFormBuilderService
    ) {
        super(logger);
    }

    public ngOnInit() {
        super.ngOnInit();
        this.formFg = this.propertySelectorFormBuilder.build(this.aggregated, this.getPropertyType());
    }

    get propertySource() {
        return this.formFg.get('propertySource');
    }
    get propertyFix() {
        return this.formFg.get('propertyFix');
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
    get propertyInterpolatedCountOrMetricCtrl() {
        return this.propertyInterpolatedFg.get('propertyInterpolatedCountOrMetricCtrl');
    }
    get propertyInterpolatedCountNormalizeCtrl() {
        return this.propertyInterpolatedFg.get('propertyInterpolatedCountNormalizeCtrl');
    }
    get propertyInterpolatedFg() {
        return this.formFg.get('propertyInterpolatedFg') as FormGroup;
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
    get propertyPointCountNormalized() {
        return this.formFg.get('propertyPointCountNormalized');
    }

    public setPropertyFix(value: string) {
        this.propertyFix.setValue(value);
        this.propertyFix.markAsDirty();
        this.propertyFix.markAsTouched();
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
