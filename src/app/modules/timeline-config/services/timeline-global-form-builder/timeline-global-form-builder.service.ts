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
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomValidators } from '@utils/custom-validators';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';


export class TimelineGlobalFormGroup extends FormGroup {

  constructor(isDetailedTimeline: boolean) {
    super(
      {
        isDetailedTimeline: new FormControl(),
        field: new FormControl(
          null,
          Validators.required
        ),
        bucketOrInterval: new FormControl(
        ),
        bucketsNumber: new FormControl(
          null
        ),
        intervalUnit: new FormControl(
          null
        ),
        intervalSize: new FormControl(
          null
        ),
        chartTitle: new FormControl(
          null,
          Validators.required
        ),
        chartType: new FormControl(
          null,
          Validators.required
        ),
        dateFormat: new FormControl(
          null,
          Validators.required
        ),
        isMultiselectable: new FormControl(
          false
        ),
        selectionExtentPercent: new FormControl(
          0
        )
      }
    );

    // add validators, could not be done before because we need to reference to this from the custom validators
    // (and this is not possible) from `super(...)`
    if (!!isDetailedTimeline) {
      this.customControls.bucketsNumber.setValidators(
        CustomValidators.getConditionalValidator(() =>
          !this.customControls.bucketOrInterval.value,
          Validators.required
        )
      );
    } else {
      this.customControls.intervalUnit.setValidators(
        CustomValidators.getConditionalValidator(() =>
          !!this.customControls.bucketOrInterval.value,
          Validators.required
        )
      );
      this.customControls.intervalSize.setValidators(
        CustomValidators.getConditionalValidator(() =>
          !!this.customControls.bucketOrInterval.value,
          Validators.required
        )
      );
    }
  }

  public customControls = {
    isDetailedTimeline: this.get('isDetailedTimeline') as FormControl,
    field: this.get('field') as FormControl,
    bucketOrInterval: this.get('bucketOrInterval') as FormControl,
    bucketsNumber: this.get('bucketsNumber') as FormControl,
    intervalUnit: this.get('intervalUnit') as FormControl,
    intervalSize: this.get('intervalSize') as FormControl,
    chartTitle: this.get('chartTitle') as FormControl,
    chartType: this.get('chartType') as FormControl,
    dateFormat: this.get('dateFormat') as FormControl,
    isMultiselectable: this.get('isMultiselectable') as FormControl,
    selectionExtentPercent: this.get('selectionExtentPercent') as FormControl,
  };
}

@Injectable({
  providedIn: 'root'
})
export class TimelineGlobalFormBuilderService {

  constructor(
    private formBuilderDefault: FormBuilderWithDefaultService
  ) { }

  public build(isDetailedTimeline: boolean) {
    const timelineFormGroup = new TimelineGlobalFormGroup(isDetailedTimeline);
    this.formBuilderDefault.setDefaultValueRecursively(
      'timeline.global',
      timelineFormGroup);

    return timelineFormGroup;
  }
}
