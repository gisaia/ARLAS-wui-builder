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
  ConfigFormGroup, InputFormControl, MetricWithFieldListFormControl, TextareaFormControl, SlideToggleFormControl
} from '@shared-models/config-form';
import { Observable } from 'rxjs';
import { CollectionField } from '@services/collection-service/models';
import { MainFormService } from '@services/main-form/main-form.service';
import { CollectionService } from '@services/collection-service/collection.service';
import { WidgetFormBuilder } from '../widget-form-builder';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';

export class MetricFormGroup extends ConfigFormGroup {

  constructor(
    collectionFields: Observable<Array<CollectionField>>
  ) {
    super({
      dataStep: new ConfigFormGroup({
        name: new InputFormControl(
          '',
          'Title',
          'Description'
        ),
        metrics: new MetricWithFieldListFormControl(
          '',
          'metric/field',
          '',
          collectionFields
        ),
        function: new TextareaFormControl(
          '',
          'Function',
          'Description',
          undefined,
          {
            optional: true
          }
        )
      }).withTabName('Data'),
      renderStep: new ConfigFormGroup({
        shortValue: new SlideToggleFormControl(
          '',
          'Short value',
          'Description',
          {
            optional: true
          }
        ),
        beforeValue: new InputFormControl(
          '',
          'Before value',
          'Description',
          'text',
          {
            optional: true
          }
        ),
        afterValue: new InputFormControl(
          '',
          'After value',
          'Description',
          'text',
          {
            optional: true
          }
        )
      }).withTabName('Render'),
    });
  }

  public customControls = {
    dataStep: {
      name: this.get('dataStep').get('name') as InputFormControl,
      metrics: this.get('dataStep').get('metrics') as MetricWithFieldListFormControl,
      function: this.get('dataStep').get('function') as TextareaFormControl,
    },
    renderStep: {
      shortValue: this.get('renderStep').get('shortValue') as SlideToggleFormControl,
      beforeValue: this.get('renderStep').get('beforeValue') as InputFormControl,
      afterValue: this.get('renderStep').get('afterValue') as InputFormControl,
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
    private formBuilderDefault: FormBuilderWithDefaultService,
  ) {
    super(collectionService, mainFormService);
  }

  public build() {

    const formGroup = new MetricFormGroup(
      this.collectionService.getCollectionFields(this.mainFormService.getCollections()[0])
    );
    this.formBuilderDefault.setDefaultValueRecursively(this.defaultKey, formGroup);

    return formGroup;
  }
}
