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
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { CollectionService, FIELD_TYPES } from '@services/collection-service/collection.service';
import { toDateFieldsObs, toIntegerOrDateFieldsObs, toNumericOrDateFieldsObs, toOptionsObs } from '@services/collection-service/tools';
import { CollectionConfigFormGroup } from '@shared-models/collection-config-form';
import {
  ButtonToggleFormControl, HiddenFormControl, InputFormControl, SelectFormControl, SliderFormControl, SlideToggleFormControl
} from '@shared-models/config-form';
import { integerValidator } from '@utils/validators';
import { CollectionReferenceDescriptionProperty, Interval } from 'arlas-api';
import { Observable, of, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

export interface BucketsIntervalControls {
  aggregationField: SelectFormControl;
  aggregationFieldType: SelectFormControl;
  aggregationBucketOrInterval: SlideToggleFormControl;
  aggregationBucketsNumber: SliderFormControl;
  aggregationIntervalUnit: SelectFormControl;
  aggregationIntervalSize: InputFormControl;
}

export enum BY_BUCKET_OR_INTERVAL {
  BUCKET = 'bucket',
  INTERVAL = 'interval'
}
export class BucketsIntervalFormGroup extends CollectionConfigFormGroup {

  public constructor(
    collection: string,
    collectionService: CollectionService, bucketType?: string) {

    super(
      collection,
      {
        aggregationField: new SelectFormControl(
          '',
          marker(bucketType + ' aggregation field'),
          marker(bucketType + ' aggregation field description'),
          true,
          BucketsIntervalFormGroup.getCollectionFields(collection, collectionService),
          {
            childs: () => [
              this.customControls.aggregationFieldType
            ]
          }),
        aggregationFieldType: new HiddenFormControl(
          '',
          null,
          {
            dependsOn: () => [this.customControls.aggregationField],
            onDependencyChange: (control) => {
              const bucketsFieldsObs = this.getBucketsFieldsObs(this.collection, collectionService, bucketType);
              const sub: Subscription = bucketsFieldsObs.subscribe(fields => {
                const aggregationField = fields.find(f => f.name === this.customControls.aggregationField.value);
                if (!!aggregationField) {
                  control.setValue(aggregationField.type === CollectionReferenceDescriptionProperty.TypeEnum.DATE ? 'time' : 'numeric');
                }
                sub.unsubscribe();
              });
            },
            optional: true
          }
        ),
        aggregationBucketOrInterval: new ButtonToggleFormControl(
          '',
          [
            { label: marker('By bucket'), value: BY_BUCKET_OR_INTERVAL.BUCKET },
            { label: marker('By interval'), value: BY_BUCKET_OR_INTERVAL.INTERVAL },
          ],
          marker('Choose ' + bucketType + ' aggregation Mode'),
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
          marker('Number of buckets'),
          marker(''),
          2,
          150,
          1,
          undefined,
          undefined,
          {
            dependsOn: () => [this.customControls.aggregationBucketOrInterval],
            onDependencyChange: (control) =>
              control.enableIf(this.customControls.aggregationBucketOrInterval.value === BY_BUCKET_OR_INTERVAL.BUCKET)
          }
        ),
        aggregationIntervalUnit: new SelectFormControl(
          '',
          marker('Interval unit'),
          marker(''),
          false,
          Array.from(new Set(
            Object.keys(Interval.UnitEnum).map(u => u.charAt(0).toUpperCase() + u.slice(1))))
            .sort()
            .map(u => ({
              value: u.toLowerCase(), label: u
            })),
          {
            dependsOn: () => [this.customControls.aggregationBucketOrInterval, this.customControls.aggregationField],
            onDependencyChange: (control) => {
              const bucketsFieldsObs = this.getBucketsFieldsObs(this.collection, collectionService, bucketType);
              const sub: Subscription = bucketsFieldsObs.subscribe(fields => {
                if (this.customControls.aggregationBucketOrInterval.value === BY_BUCKET_OR_INTERVAL.INTERVAL &&
                  !!fields.find(f => f.name === this.customControls.aggregationField.value) &&
                  fields.find(f => f.name === this.customControls.aggregationField.value).type
                  === CollectionReferenceDescriptionProperty.TypeEnum.DATE) {
                  control.enable();
                } else {
                  control.disable();
                }
                sub.unsubscribe();
              });

            }
          }
        ),
        aggregationIntervalSize: new InputFormControl(
          '',
          marker('Interval size'),
          marker(''),
          'number',
          {
            dependsOn: () => [this.customControls.aggregationBucketOrInterval],
            onDependencyChange: (control) =>
              control.enableIf(this.customControls.aggregationBucketOrInterval.value === BY_BUCKET_OR_INTERVAL.INTERVAL),
            validators: [integerValidator]
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

  private static getCollectionFields(collection: string, collectionService: CollectionService): Observable<any[]> {
    if (!!collection && !!collectionService) {
      return toOptionsObs(toNumericOrDateFieldsObs(collectionService.getCollectionFields(collection)));
    } else {
      return of([]);
    }
  }

  public getBucketsFieldsObs(collection: string, collectionService: CollectionService, bucketType: string) {
    if (!!collectionService && !!collection) {
      const collectionFieldsObs = collectionService.getCollectionFields(collection);
      if (bucketType === 'temporal') {
        return toDateFieldsObs(collectionFieldsObs).pipe(map(fields => fields.sort((a, b) => {
          // sort by DATE first, then by name
          if (a.type !== b.type) {
            return a.type === FIELD_TYPES.DATE ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        })));
      } else if (bucketType === 'swimlane') {
        return toIntegerOrDateFieldsObs(collectionFieldsObs);
      }
      return toNumericOrDateFieldsObs(collectionFieldsObs);
    }
    return of([]);
  }


}

@Injectable({
  providedIn: 'root'
})
export class BucketsIntervalFormBuilderService {

  public constructor(private collectionService: CollectionService) { }

  public build(collection: string, bucketType: string) {
    return new BucketsIntervalFormGroup(collection, this.collectionService, bucketType);
  }

}
