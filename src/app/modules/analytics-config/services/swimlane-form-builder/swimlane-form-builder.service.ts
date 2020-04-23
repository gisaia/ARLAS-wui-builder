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
import { WidgetFormBuilder } from '../widget-form-builder';
import { FormGroup } from '@angular/forms';
import {
  ConfigFormGroup, InputFormControl, SelectFormControl, SliderFormControl,
  SlideToggleFormControl, HuePaletteFormControl, HiddenFormControl
} from '@shared-models/config-form';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';
import { CollectionService } from '@services/collection-service/collection.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { SwimlaneMode } from 'arlas-web-components';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { BucketsIntervalFormBuilderService } from '../buckets-interval-form-builder/buckets-interval-form-builder.service';
import { MetricFormBuilderService } from '../metric-form-builder/metric-form-builder.service';
import { Observable } from 'rxjs';
import { CollectionField } from '@services/collection-service/models';
import { toKeywordFieldsObs } from '@services/collection-service/tools';

export class SwimlaneFormGroup extends ConfigFormGroup {

  public get isZeroRepresentative() {
    return this.get('renderStep').get('isZeroRepresentative') as SlideToggleFormControl;
  }

  public get zerosColors() {
    return this.get('renderStep').get('zerosColors') as HiddenFormControl;
  }

  public get NaNColors() {
    return this.get('renderStep').get('NaNColors') as HiddenFormControl;
  }

  constructor(
    private bucketsIntervalBuilderService: BucketsIntervalFormBuilderService,
    private defaultValuesService: DefaultValuesService,
    private metricBuilderService: MetricFormBuilderService,
    collectionFieldsObs: Observable<CollectionField[]>
  ) {
    super(
      {
        dataStep: new ConfigFormGroup({
          name: new InputFormControl(
            '',
            'Name',
            'description'),
          dateAggregation:
            bucketsIntervalBuilderService
              .build(collectionFieldsObs)
              .withTitle('Date aggregation'),
          termAggregation: new ConfigFormGroup({
            termAggregationField: new SelectFormControl(
              '',
              'Term field',
              'description',
              true,
              toKeywordFieldsObs(collectionFieldsObs)),
            termAggregationSize: new SliderFormControl(
              '',
              'Term size',
              'description',
              0,
              10,
              1)
          }).withTitle('Term aggregation'),
          metric: metricBuilderService.build(collectionFieldsObs).withTitle('Metric')
        }),
        renderStep: new ConfigFormGroup({
          swimlaneMode: new SelectFormControl(
            '',
            'Swimlane mode',
            'description',
            false,
            [
              { value: SwimlaneMode[SwimlaneMode.fixedHeight].toString(), label: 'Fixed' },
              { value: SwimlaneMode[SwimlaneMode.variableHeight].toString(), label: 'Variable' },
              { value: SwimlaneMode[SwimlaneMode.circles].toString(), label: 'Circles' }
            ]
          ),
          swimlaneRepresentation: new SlideToggleFormControl(
            '',
            'Represent globally',
            'description',
            'or by column'
          ),
          paletteColors: new HuePaletteFormControl(
            '',
            'Palette colors',
            'description',
            defaultValuesService.getDefaultConfig().huePalettes
          ),
          isZeroRepresentative: new SlideToggleFormControl(
            '',
            'Is zero representative?',
            'Description',
            undefined,
            {
              childs: () => [this.zerosColors, this.NaNColors]
            }
          ),
          zerosColors: new HiddenFormControl(
            '',
            {
              optional: true,
              dependsOn: () => [this.isZeroRepresentative],
              onDependencyChange: (control: HiddenFormControl) =>
                control.setValue(!!this.isZeroRepresentative.value ? defaultValuesService.getDefaultConfig().swimlaneZeroColor : null)
            }),
          NaNColors: new HiddenFormControl(
            defaultValuesService.getDefaultConfig().swimlaneNanColor
          )
        }),
      }
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class SwimlaneFormBuilderService extends WidgetFormBuilder {

  public defaultKey = 'analytics.widgets.swimlane';
  public widgetFormGroup: FormGroup;

  constructor(
    private formBuilderDefault: FormBuilderWithDefaultService,
    protected collectionService: CollectionService,
    protected mainFormService: MainFormService,
    private defaultValuesService: DefaultValuesService,
    private bucketsIntervalBuilderService: BucketsIntervalFormBuilderService,
    private metricBuilderService: MetricFormBuilderService,
  ) {
    super(collectionService, mainFormService);
  }

  public build() {

    const collectionFieldsObs = this.collectionService.getCollectionFields(
      this.mainFormService.getCollections()[0]);

    const formGroup = new SwimlaneFormGroup(
      this.bucketsIntervalBuilderService, this.defaultValuesService, this.metricBuilderService, collectionFieldsObs);

    this.formBuilderDefault.setDefaultValueRecursively(this.defaultKey, formGroup);

    return formGroup;
  }

}
