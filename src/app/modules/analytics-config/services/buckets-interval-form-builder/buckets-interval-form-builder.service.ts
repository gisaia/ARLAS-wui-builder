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

export interface BucketsIntervalControls {
  aggregationField: SelectFormControl;
  aggregationFieldType: SelectFormControl;
  aggregationBucketOrInterval: SlideToggleFormControl;
  aggregationBucketsNumber: SliderFormControl;
  aggregationIntervalUnit: SelectFormControl;
  aggregationIntervalSize: InputFormControl;
}

export class BucketsIntervalFormGroup extends ConfigFormGroup {

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
            childs: () => [this.customControls.aggregationFieldType]
          }),
        aggregationFieldType: new HiddenFormControl(
          '',
          {
            dependsOn: () => [this.customControls.aggregationField],
            onDependencyChange: (control) => {
              collectionFieldsObs.subscribe(fields => {
                const aggregationField = fields.find(f => f.name === this.customControls.aggregationField.value);
                if (!!aggregationField) {
                  control.setValue(aggregationField.type === CollectionReferenceDescriptionProperty.TypeEnum.DATE ? 'time' : 'numeric');
                }
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
            childs: () => [
              this.customControls.aggregationBucketsNumber,
              this.customControls.aggregationIntervalUnit,
              this.customControls.aggregationIntervalSize
            ]
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
            dependsOn: () => [this.customControls.aggregationBucketOrInterval],
            onDependencyChange: (control) =>
              !!this.customControls.aggregationBucketOrInterval.value ? control.disable() : control.enable()
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
            dependsOn: () => [this.customControls.aggregationBucketOrInterval, this.customControls.aggregationField],
            onDependencyChange: (control) => {
              collectionFieldsObs.subscribe(fields => {
                if (this.customControls.aggregationBucketOrInterval.value &&
                  !!fields.find(f => f.name === this.customControls.aggregationField.value) &&
                  fields.find(f => f.name === this.customControls.aggregationField.value).type
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
            dependsOn: () => [this.customControls.aggregationBucketOrInterval],
            onDependencyChange: (control) =>
              !!this.customControls.aggregationBucketOrInterval.value ? control.enable() : control.disable()
          }
        )
      }
    );
  }

  public customControls = {
    aggregationField: this.get('aggregationField') as SelectFormControl,
    aggregationFieldType: this.get('aggregationFieldType') as SelectFormControl,
    aggregationBucketOrInterval: this.get('aggregationBucketOrInterval') as SlideToggleFormControl,
    aggregationBucketsNumber: this.get('aggregationBucketsNumber') as SliderFormControl,
    aggregationIntervalUnit: this.get('aggregationIntervalUnit') as SelectFormControl,
    aggregationIntervalSize: this.get('aggregationIntervalSize') as InputFormControl
  } as BucketsIntervalControls;

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