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
import {
  ConfigFormGroup, SelectFormControl, SlideToggleFormControl, SliderFormControl,
  InputFormControl
} from '@shared-models/config-form';
import { Interval, Metric, CollectionReferenceDescriptionProperty } from 'arlas-api';
import { Observable } from 'rxjs';
import { SelectOption } from '@shared-models/config-form';
import { CollectionField } from '@services/collection-service/models';

@Injectable()
export class BucketsIntervalFormBuilderService {

  public formGroup: ConfigFormGroup;
  constructor() {
  }

  public build(
    numericOrDateFieldsObs: Observable<Array<SelectOption>>,
    collectionFieldsObs: Observable<Array<CollectionField>>,
  ) {

    this.formGroup = new ConfigFormGroup({
      aggregationField: new SelectFormControl(
        '',
        'Date aggregation field',
        'description',
        true,
        numericOrDateFieldsObs),
      aggregationBucketOrInterval: new SlideToggleFormControl(
        '',
        'By bucket',
        'description',
        'or interval',
        {
          childs: () => [this.aggregationBucketsNumber, this.aggregationIntervalUnit, this.aggregationIntervalSize]
        }
      ),
      aggregationBucketsNumber: new SliderFormControl(
        '',
        'Number of buckets',
        'description',
        10,
        200,
        5,
        {
          dependsOn: () => [this.aggregationBucketOrInterval],
          onDependencyChange: (control) =>
            !!this.aggregationBucketOrInterval.value ? control.disable() : control.enable()
        }
      ),
      aggregationIntervalUnit: new SelectFormControl(
        '',
        'Interval unit',
        'description',
        false,
        Array.from(
          new Set(
            Object.values(Interval.UnitEnum).map(v => {
              const value = typeof v === 'string' ? v.toLowerCase() : v.toString();
              return { value, label: value };
            })))
          .sort(),
        {
          dependsOn: () => [this.aggregationBucketOrInterval, this.aggregationField],
          onDependencyChange: (control) => {
            collectionFieldsObs.subscribe(fields => {
              if (this.aggregationBucketOrInterval.value &&
                !!fields.find(f => f.name === this.aggregationField.value) &&
                fields.find(f => f.name === this.aggregationField.value).type
                === CollectionReferenceDescriptionProperty.TypeEnum.DATE) {
                control.enable();
              } else {
                control.disable();
              }
            });

          }
        }
      ),
      aggregationIntervalSize: new InputFormControl(
        '',
        'Interval size',
        'description',
        'number',
        {
          dependsOn: () => [this.aggregationBucketOrInterval],
          onDependencyChange: (control) =>
            !!this.aggregationBucketOrInterval.value ? control.enable() : control.disable()
        }
      )
    });

    return this.formGroup;
  }

  private get aggregationField() {
    return this.formGroup.get('aggregationField') as SelectFormControl;
  }

  private get aggregationBucketOrInterval() {
    return this.formGroup.get('aggregationBucketOrInterval') as SlideToggleFormControl;
  }

  private get aggregationBucketsNumber() {
    return this.formGroup.get('aggregationBucketsNumber') as SliderFormControl;
  }

  private get aggregationIntervalUnit() {
    return this.formGroup.get('aggregationIntervalUnit') as SelectFormControl;
  }

  private get aggregationIntervalSize() {
    return this.formGroup.get('aggregationIntervalSize') as InputFormControl;
  }

}
