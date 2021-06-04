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
  ConfigFormGroup, InputFormControl, MetricWithFieldListFormControl, TextareaFormControl, SlideToggleFormControl,
  TitleInputFormControl, SelectFormControl
} from '@shared-models/config-form';
import { MainFormService } from '@services/main-form/main-form.service';
import { CollectionService } from '@services/collection-service/collection.service';
import { WidgetFormBuilder } from '../widget-form-builder';
import { FormGroup, FormControl } from '@angular/forms';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { CollectionConfigFormGroup } from '@shared-models/collection-config-form';

export class MetricFormGroup extends CollectionConfigFormGroup {

  constructor(
    collection: string,
    collectionService: CollectionService
  ) {
    super(
      collection,
      {
        title: new TitleInputFormControl(
          '',
          marker('metric title'),
          marker('metric title description')
        ),
        dataStep: new ConfigFormGroup({
          collection: new SelectFormControl(
            collection,
            marker('Collection'),
            marker('Metric collection description'),
            false,
            collectionService.getCollections().map(c => ({ label: c, value: c })),
            {
              optional: false,
              resetDependantsOnChange: true
            }
          ),
          metrics: new MetricWithFieldListFormControl(
            '',
            'metric/field',
            '',
            collectionService.getCollectionFields(collection),
            {
              dependsOn: () => [
                this.customControls.dataStep.collection,
              ],
              onDependencyChange: (control: MetricWithFieldListFormControl) => {
                this.setCollection(this.customControls.dataStep.collection.value);
                control.setCollectionFieldsObs(collectionService.getCollectionFields(this.collection));
                control.updateFieldsByMetric(control.metricCtrl.value);
                if (!control.getValueAsSet()) {
                  control.setValue(new Set());
                }
              }
            }
          ),
          function: new TextareaFormControl(
            '',
            marker('Function'),
            marker('metric function description'),
            undefined,
            {
              optional: true
            }
          )
        }).withTabName(marker('Data')),
        renderStep: new ConfigFormGroup({
          shortValue: new SlideToggleFormControl(
            '',
            marker('Short value'),
            marker('Short value description'),
            {
              optional: true
            }
          ),
          valuePrecision:  new InputFormControl(
            '',
            marker('Metric value precision'),
            marker('Metric value precision description'),
            'number',
            {
              optional: true
            }
          ),
          beforeValue: new InputFormControl(
            '',
            marker('Before value'),
            marker('Before value description'),
            'text',
            {
              optional: true
            }
          ),
          afterValue: new InputFormControl(
            '',
            marker('After value'),
            marker('After value description'),
            'text',
            {
              optional: true
            }
          )
        }).withTabName(marker('Render')),
        unmanagedFields: new FormGroup({
          renderStep: new FormGroup({
            customizedCssClass: new FormControl()
          })
        })
      });
  }

  public customControls = {
    title: this.get('title') as TitleInputFormControl,
    dataStep: {
      collection: this.get('dataStep').get('collection') as SelectFormControl,
      metrics: this.get('dataStep').get('metrics') as MetricWithFieldListFormControl,
      function: this.get('dataStep').get('function') as TextareaFormControl,
    },
    renderStep: {
      shortValue: this.get('renderStep').get('shortValue') as SlideToggleFormControl,
      valuePrecision: this.get('renderStep').get('valuePrecision') as InputFormControl,
      beforeValue: this.get('renderStep').get('beforeValue') as InputFormControl,
      afterValue: this.get('renderStep').get('afterValue') as InputFormControl,
    },
    unmanagedFields: {
      renderStep: {
        customizedCssClass: this.get('unmanagedFields.renderStep.customizedCssClass')
      }
    }
  };

}

@Injectable({
  providedIn: 'root'
})
export class MetricFormBuilderService extends WidgetFormBuilder {

  public defaultKey = 'analytics.widgets.metric';

  constructor(
    protected mainFormService: MainFormService,
    protected collectionService: CollectionService,
    private defaultValuesService: DefaultValuesService,
  ) {
    super(collectionService, mainFormService);
  }

  public build(collection: string) {

    const formGroup = new MetricFormGroup(collection, this.collectionService);
    this.defaultValuesService.setDefaultValueRecursively(this.defaultKey, formGroup);

    return formGroup;
  }
}
