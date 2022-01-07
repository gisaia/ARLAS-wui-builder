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
import { CollectionService } from '@services/collection-service/collection.service';
import { CollectionField } from '@services/collection-service/models';
import { NUMERIC_OR_DATE_TYPES, titleCase } from '@services/collection-service/tools';
import { CollectionConfigFormGroup } from '@shared-models/collection-config-form';
import { ConfigFormGroup, InputFormControl, SelectFormControl } from '@shared-models/config-form';
import { Metric } from 'arlas-api';

export const DEFAULT_METRIC_VALUE = 'Count';

export interface MetricCollectControls {
  metricCollectFunction: SelectFormControl;
  metricCollectField: SelectFormControl;
}

export class MetricCollectFormGroup extends CollectionConfigFormGroup {

  public get metricCollectFunction() {
    return this.get('metricCollectFunction') as InputFormControl;
  }

  public constructor(collection: string, collectionService: CollectionService, type: string) {
    super(
      collection,
      {
        metricCollectFunction: new SelectFormControl(
          '',
          marker(type + ' metric collect function'),
          marker(type + ' metric collect function Description'),
          false,
          ['Count', Metric.CollectFctEnum.AVG.toString(), Metric.CollectFctEnum.CARDINALITY.toString(),
            Metric.CollectFctEnum.MAX.toString(), Metric.CollectFctEnum.MIN.toString(),
            Metric.CollectFctEnum.SUM.toString()].map(value => ({ value, label: titleCase(value) })),
          {
            optional: false,
            childs: () => [
              this.customControls.metricCollectField
            ]
          }
        ),
        metricCollectField: new SelectFormControl(
          '',
          marker(type + ' metric collect field'),
          marker(type + ' metric collect field Description'),
          true,
          [],
          {
            dependsOn: () => [this.metricCollectFunction],
            onDependencyChange: (control: SelectFormControl) => {
              if (this.metricCollectFunction.value && this.metricCollectFunction.value !== 'Count') {

                control.enable();

                const filterCallback = (field: CollectionField) =>
                  this.metricCollectFunction.value === Metric.CollectFctEnum.CARDINALITY ?
                    field : NUMERIC_OR_DATE_TYPES.indexOf(field.type) >= 0;
                const sub = collectionService.getCollectionFields(this.collection).subscribe(
                  fields => {
                    control.setSyncOptions(
                      fields
                        .filter(filterCallback)
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(f => ({ value: f.name, label: f.name, enabled: f.indexed })));
                    sub.unsubscribe();
                  });
              } else {
                control.disable();
              }
            }
          }
        )
      }
    );
  }

  public customControls = {
    metricCollectFunction: this.get('metricCollectFunction') as SelectFormControl,
    metricCollectField: this.get('metricCollectField') as SelectFormControl
  } as MetricCollectControls;

}

@Injectable({
  providedIn: 'root'
})
export class MetricCollectFormBuilderService {

  public formGroup: ConfigFormGroup;

  public constructor(private collectionService: CollectionService) { }

  public build(collection: string, type: string) {
    return new MetricCollectFormGroup(collection, this.collectionService, type);
  }

}
