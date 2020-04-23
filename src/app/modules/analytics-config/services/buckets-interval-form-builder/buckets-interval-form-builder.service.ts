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
  InputFormControl,
  HiddenFormControl
} from '@shared-models/config-form';
import { Interval, CollectionReferenceDescriptionProperty } from 'arlas-api';
import { Observable } from 'rxjs';
import { CollectionField } from '@services/collection-service/models';
import { toNumericOrDateFieldsObs } from '@services/collection-service/tools';

export class BucketsIntervalFormGroup extends ConfigFormGroup {

  private get aggregationField() {
    return this.get('aggregationField') as SelectFormControl;
  }

  private get aggregationFieldType() {
    return this.get('aggregationFieldType') as SelectFormControl;
  }

  private get aggregationBucketOrInterval() {
    return this.get('aggregationBucketOrInterval') as SlideToggleFormControl;
  }

  private get aggregationBucketsNumber() {
    return this.get('aggregationBucketsNumber') as SliderFormControl;
  }

  private get aggregationIntervalUnit() {
    return this.get('aggregationIntervalUnit') as SelectFormControl;
  }

  private get aggregationIntervalSize() {
    return this.get('aggregationIntervalSize') as InputFormControl;
  }

  constructor(
    collectionFieldsObs: Observable<Array<CollectionField>>) {

    super(
      {
        aggregationField: new SelectFormControl(
          '',
          'Aggregation field',
          'description',
          true,
          toNumericOrDateFieldsObs(collectionFieldsObs),
          {
            childs: () => [this.aggregationFieldType]
          }),
        aggregationFieldType: new HiddenFormControl(
          '',
          {
            dependsOn: () => [this.aggregationField],
            onDependencyChange: (control) => {
              collectionFieldsObs.subscribe(fields => {
                const aggregationFieldType = fields.find(f => f.name === this.aggregationField.value);
                control.setValue(!!aggregationFieldType ? aggregationFieldType.type : null);
              });
            }
          }
        ),
        aggregationBucketOrInterval: new SlideToggleFormControl(
          '',
          'By bucket',
          'description',
          'or interval',
          {
            resetDependantsOnChange: true,
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
      }
    );
  }

}

@Injectable({
  providedIn: 'root'
})
export class BucketsIntervalFormBuilderService {

  constructor() {
  }

  public build(collectionFieldsObs: Observable<Array<CollectionField>>) {

    return new BucketsIntervalFormGroup(collectionFieldsObs);
  }

}
