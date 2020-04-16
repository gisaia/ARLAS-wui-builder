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
import { NUMERIC_OR_DATE_TYPES } from '@utils/tools';
import { Observable } from 'rxjs';

@Injectable()
export class MetricFormBuilderService {

  public static defaultMetricValue = 'COUNT';
  public formGroup: ConfigFormGroup;

  constructor() { }

  public build(collectionFieldsObs: Observable<Array<CollectionField>>) {
    this.formGroup = new ConfigFormGroup({
      metricCollectFunction: new SelectFormControl(
        '',
        'Metric collect function',
        'Description',
        false,
        [Metric.CollectFctEnum.AVG.toString(), Metric.CollectFctEnum.CARDINALITY.toString(),
        Metric.CollectFctEnum.MAX.toString(), Metric.CollectFctEnum.MIN.toString(),
        Metric.CollectFctEnum.SUM.toString()].map(value => ({ value, label: value })),
        {
          optional: true
        }
      ),
      metricCollectField: new SelectFormControl(
        '',
        'Metric collect field',
        'Description',
        true,
        [],
        {
          dependsOn: () => [this.metricCollectFunction],
          onDependencyChange: (control: SelectFormControl) => {
            if (this.metricCollectFunction.value) {

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
      ),
      metricValue: new SelectFormControl(
        '',
        'Value used in aggregation',
        'description',
        false,
        [],
        {
          dependsOn: () => [this.metricCollectFunction],
          onDependencyChange: (control: SelectFormControl) => {
            // exclude metricCollectFunction.value if falsy
            control.setSyncOptions([this.metricCollectFunction.value, MetricFormBuilderService.defaultMetricValue]
              .filter(Boolean).map(value => ({ value, label: value })));
          }
        }
      )
    });

    return this.formGroup;
  }

  public get metricCollectFunction() {
    return this.formGroup.get('metricCollectFunction') as InputFormControl;
  }
}
