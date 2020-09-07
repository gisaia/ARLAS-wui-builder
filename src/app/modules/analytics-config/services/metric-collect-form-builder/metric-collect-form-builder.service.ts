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
import { ConfigFormGroup, SelectFormControl, InputFormControl } from '@shared-models/config-form';
import { Metric } from 'arlas-api';
import { CollectionField } from '@services/collection-service/models';
import { Observable } from 'rxjs';
import { NUMERIC_OR_DATE_TYPES, titleCase } from '@services/collection-service/tools';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

export const DEFAULT_METRIC_VALUE = 'Count';

export interface MetricCollectControls {
  metricCollectFunction: SelectFormControl;
  metricCollectField: SelectFormControl;
}

export class MetricCollectFormGroup extends ConfigFormGroup {

  public get metricCollectFunction() {
    return this.get('metricCollectFunction') as InputFormControl;
  }

  constructor(collectionFieldsObs: Observable<Array<CollectionField>>, type: string) {
    super(
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
            optional: true
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

                collectionFieldsObs.subscribe(
                  fields => control.setSyncOptions(
                    fields
                      .filter(filterCallback)
                      .map(f => ({ value: f.name, label: f.name }))));
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

  constructor() { }

  public build(collectionFieldsObs: Observable<Array<CollectionField>>, type: string) {
    return new MetricCollectFormGroup(collectionFieldsObs, type);
  }

}
