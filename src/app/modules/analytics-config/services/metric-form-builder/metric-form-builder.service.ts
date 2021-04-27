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
  ConfigFormGroup, InputFormControl, MetricWithFieldListFormControl, TextareaFormControl, SlideToggleFormControl, TitleInputFormControl
} from '@shared-models/config-form';
import { Observable } from 'rxjs';
import { CollectionField } from '@services/collection-service/models';
import { MainFormService } from '@services/main-form/main-form.service';
import { CollectionService } from '@services/collection-service/collection.service';
import { WidgetFormBuilder } from '../widget-form-builder';
import { FormGroup, FormControl } from '@angular/forms';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

export class MetricFormGroup extends ConfigFormGroup {

  constructor(
    collectionFields: Observable<Array<CollectionField>>
  ) {
    super({
      title: new TitleInputFormControl(
        '',
        marker('metric title'),
        marker('metric title description')
      ),
      dataStep: new ConfigFormGroup({
        metrics: new MetricWithFieldListFormControl(
          '',
          'metric/field',
          '',
          collectionFields
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
      metrics: this.get('dataStep').get('metrics') as MetricWithFieldListFormControl,
      function: this.get('dataStep').get('function') as TextareaFormControl,
    },
    renderStep: {
      shortValue: this.get('renderStep').get('shortValue') as SlideToggleFormControl,
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

  public build() {

    const formGroup = new MetricFormGroup(
      this.collectionService.getCollectionFields(this.mainFormService.getMainCollection())
    );
    this.defaultValuesService.setDefaultValueRecursively(this.defaultKey, formGroup);

    return formGroup;
  }
}
