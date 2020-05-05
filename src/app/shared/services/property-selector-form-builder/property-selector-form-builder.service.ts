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
import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { CustomValidators } from '@utils/custom-validators';
import { PROPERTY_SELECTOR_SOURCE, PROPERTY_TYPE } from '@shared-components/property-selector/models';

export class PropertySelectorFormGroup extends FormGroup {

  constructor(
    aggregated: boolean,
    propertyType: PROPERTY_TYPE
  ) {

    super({
      propertySource: new FormControl(
        null,
        Validators.required
      ),
      propertyFix: new FormControl(
        null
      ),
      propertyProvidedFieldCtrl: new FormControl(
        null
      ),
      propertyGeneratedFieldCtrl: new FormControl(
        null
      ),
      propertyManualFg: new FormGroup({
        propertyManualFieldCtrl: new FormControl(
          null
        ),
        propertyManualValuesCtrl: new FormArray(
          []
        )
      }),
      propertyInterpolatedFg: new FormGroup({
        propertyInterpolatedCountOrMetricCtrl: new FormControl(
          null
        ),
        propertyInterpolatedCountNormalizeCtrl: new FormControl(

        ),
        propertyInterpolatedMetricCtrl: new FormControl(
          null
        ),
        propertyInterpolatedFieldCtrl: new FormControl(
          null
        ),
        propertyInterpolatedNormalizeCtrl: new FormControl(
          null
        ),
        propertyInterpolatedNormalizeByKeyCtrl: new FormControl(
          null
        ),
        propertyInterpolatedNormalizeLocalFieldCtrl: new FormControl(
          null
        ),
        propertyInterpolatedMinFieldValueCtrl: new FormControl(
          null
        ),
        propertyInterpolatedMaxFieldValueCtrl: new FormControl(
          null
        ),
        propertyInterpolatedMinValueCtrl: new FormControl(
          null
        ),
        propertyInterpolatedMaxValueCtrl: new FormControl(
          null
        ),
        propertyInterpolatedValuesCtrl: new FormControl(
          null
        )
      }),
      propertyPointCountNormalized: new FormGroup({})
    });

    this.propertyFix.setValidators(
      CustomValidators.getConditionalValidator(() =>
        this.propertySource.value === PROPERTY_SELECTOR_SOURCE.fix,
        Validators.required)
    );

    this.propertyProvidedFieldCtrl.setValidators(
      CustomValidators.getConditionalValidator(() =>
        this.propertySource.value === PROPERTY_SELECTOR_SOURCE.provided,
        Validators.required)
    );

    this.propertyGeneratedFieldCtrl.setValidators(
      CustomValidators.getConditionalValidator(() =>
        this.propertySource.value === PROPERTY_SELECTOR_SOURCE.generated,
        Validators.required)
    );

    this.propertyManualFieldCtrl.setValidators(
      CustomValidators.getConditionalValidator(() =>
        this.propertySource.value === PROPERTY_SELECTOR_SOURCE.manual,
        Validators.required)
    );

    this.propertyInterpolatedFg.setValidators(
      CustomValidators.getConditionalValidator(() =>
        this.propertySource.value === PROPERTY_SELECTOR_SOURCE.interpolated && this.propertyInterpolatedFieldCtrl.value
        && this.propertyInterpolatedMinFieldValueCtrl.value && this.propertyInterpolatedMaxFieldValueCtrl.value,
        CustomValidators.getLTEValidator(
          'propertyInterpolatedMinFieldValueCtrl',
          'propertyInterpolatedMaxFieldValueCtrl'
        ))
    );

    this.propertyInterpolatedMetricCtrl.setValidators(
      CustomValidators.getConditionalValidator(() => aggregated &&
        this.propertySource.value === PROPERTY_SELECTOR_SOURCE.interpolated
        && this.propertyInterpolatedCountOrMetricCtrl.value,
        Validators.required)
    );

    this.propertyInterpolatedFieldCtrl.setValidators(
      CustomValidators.getConditionalValidator(() =>
        this.propertySource.value === PROPERTY_SELECTOR_SOURCE.interpolated
        && (!aggregated || aggregated && this.propertyInterpolatedMetricCtrl.value),
        Validators.required)
    );

    this.propertyInterpolatedNormalizeLocalFieldCtrl.setValidators(
      CustomValidators.getConditionalValidator(() => !aggregated &&
        this.propertySource.value === PROPERTY_SELECTOR_SOURCE.interpolated
        && this.propertyInterpolatedNormalizeByKeyCtrl.value,
        Validators.required)
    );

    this.propertyInterpolatedMinFieldValueCtrl.setValidators(
      CustomValidators.getConditionalValidator(() =>
        this.propertySource.value === PROPERTY_SELECTOR_SOURCE.interpolated
        && this.propertyInterpolatedFieldCtrl.value && !this.propertyInterpolatedNormalizeCtrl.value,
        Validators.required)
    );

    this.propertyInterpolatedMaxFieldValueCtrl.setValidators(
      CustomValidators.getConditionalValidator(() =>
        this.propertySource.value === PROPERTY_SELECTOR_SOURCE.interpolated
        && this.propertyInterpolatedFieldCtrl.value && !this.propertyInterpolatedNormalizeCtrl.value,
        Validators.required)
    );

    this.propertyInterpolatedMinValueCtrl.setValidators(
      CustomValidators.getConditionalValidator(() =>
        this.propertySource.value === PROPERTY_SELECTOR_SOURCE.interpolated
        && propertyType === PROPERTY_TYPE.number
        && this.propertyInterpolatedFieldCtrl.value && !this.propertyInterpolatedNormalizeCtrl.value,
        Validators.required)
    );

    this.propertyInterpolatedMaxValueCtrl.setValidators(
      CustomValidators.getConditionalValidator(() =>
        this.propertySource.value === PROPERTY_SELECTOR_SOURCE.interpolated
        && propertyType === PROPERTY_TYPE.number
        && this.propertyInterpolatedFieldCtrl.value && !this.propertyInterpolatedNormalizeCtrl.value,
        Validators.required)
    );

    this.propertyInterpolatedValuesCtrl.setValidators(
      CustomValidators.getConditionalValidator(() =>
        this.propertySource.value === PROPERTY_SELECTOR_SOURCE.interpolated
        && (this.propertyInterpolatedFieldCtrl.value ||
          aggregated && !this.propertyInterpolatedCountOrMetricCtrl.value),
        Validators.required)
    );
  }

  public get propertySource() { return this.get('propertySource'); }
  public get propertyFix() { return this.get('propertyFix'); }
  public get propertyProvidedFieldCtrl() { return this.get('propertyProvidedFieldCtrl'); }
  public get propertyGeneratedFieldCtrl() { return this.get('propertyGeneratedFieldCtrl'); }
  public get propertyManualFg() { return this.get('propertyManualFg'); }
  public get propertyManualFieldCtrl() { return this.propertyManualFg.get('propertyManualFieldCtrl'); }
  public get propertyManualValuesCtrl() { return this.propertyManualFg.get('propertyManualValuesCtrl'); }
  public get propertyInterpolatedFg() { return this.get('propertyInterpolatedFg'); }
  public get propertyInterpolatedCountOrMetricCtrl() { return this.propertyInterpolatedFg.get('propertyInterpolatedCountOrMetricCtrl'); }
  public get propertyInterpolatedCountNormalizeCtrl() { return this.propertyInterpolatedFg.get('propertyInterpolatedCountNormalizeCtrl'); }
  public get propertyInterpolatedMetricCtrl() { return this.propertyInterpolatedFg.get('propertyInterpolatedMetricCtrl'); }
  public get propertyInterpolatedFieldCtrl() { return this.propertyInterpolatedFg.get('propertyInterpolatedFieldCtrl'); }
  public get propertyInterpolatedNormalizeCtrl() { return this.propertyInterpolatedFg.get('propertyInterpolatedNormalizeCtrl'); }
  public get propertyInterpolatedNormalizeByKeyCtrl() { return this.propertyInterpolatedFg.get('propertyInterpolatedNormalizeByKeyCtrl'); }
  public get propertyInterpolatedNormalizeLocalFieldCtrl() {
    return this.propertyInterpolatedFg.get('propertyInterpolatedNormalizeLocalFieldCtrl');
  }
  public get propertyInterpolatedMinFieldValueCtrl() { return this.propertyInterpolatedFg.get('propertyInterpolatedMinFieldValueCtrl'); }
  public get propertyInterpolatedMaxFieldValueCtrl() { return this.propertyInterpolatedFg.get('propertyInterpolatedMaxFieldValueCtrl'); }
  public get propertyInterpolatedMinValueCtrl() { return this.propertyInterpolatedFg.get('propertyInterpolatedMinValueCtrl'); }
  public get propertyInterpolatedMaxValueCtrl() { return this.propertyInterpolatedFg.get('propertyInterpolatedMaxValueCtrl'); }
  public get propertyInterpolatedValuesCtrl() { return this.propertyInterpolatedFg.get('propertyInterpolatedValuesCtrl'); }
  public get propertyPointCountNormalized() { return this.get('propertyPointCountNormalized'); }

}

@Injectable({
  providedIn: 'root'
})
export class PropertySelectorFormBuilderService {

  constructor() { }

  public build(
    aggregated: boolean,
    propertyType: PROPERTY_TYPE
  ) {
    return new PropertySelectorFormGroup(aggregated, propertyType);
  }
}
