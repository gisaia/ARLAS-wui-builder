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
  SlideToggleFormControl, HuePaletteFormControl, HiddenFormControl, SelectOption
} from '@shared-models/config-form';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';
import { CollectionService } from '@services/collection-service/collection.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { SwimlaneMode } from 'arlas-web-components';
import { DefaultValuesService, DefaultConfig } from '@services/default-values/default-values.service';
import {
  BucketsIntervalFormBuilderService, BucketsIntervalFormGroup
} from '../buckets-interval-form-builder/buckets-interval-form-builder.service';
import { MetricFormBuilderService, MetricFormGroup } from '../metric-form-builder/metric-form-builder.service';
import { Observable } from 'rxjs';
import { toKeywordOptionsObs } from '@services/collection-service/tools';

export class SwimlaneFormGroup extends ConfigFormGroup {

  constructor(
    dateAggregationFg: BucketsIntervalFormGroup,
    metricFg: MetricFormGroup,
    defaultConfig: DefaultConfig,
    keywordsFieldsObs: Observable<SelectOption[]>
  ) {
    super(
      {
        dataStep: new ConfigFormGroup({
          name: new InputFormControl(
            '',
            'Name',
            'description'),
          dateAggregation: dateAggregationFg,
          termAggregation: new ConfigFormGroup({
            termAggregationField: new SelectFormControl(
              '',
              'Term field',
              'description',
              true,
              keywordsFieldsObs),
            termAggregationSize: new SliderFormControl(
              '',
              'Term size',
              'description',
              0,
              10,
              1)
          }).withTitle('Term aggregation'),
          metric: metricFg
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
            defaultConfig.huePalettes
          ),
          isZeroRepresentative: new SlideToggleFormControl(
            '',
            'Is zero representative?',
            'Description',
            undefined,
            {
              childs: () => [this.customControls.renderStep.zerosColors, this.customControls.renderStep.NaNColors]
            }
          ),
          zerosColors: new HiddenFormControl(
            '',
            null,
            {
              optional: true,
              dependsOn: () => [this.customControls.renderStep.isZeroRepresentative],
              onDependencyChange: (control: HiddenFormControl) =>
                control.setValue(!!this.customControls.renderStep.isZeroRepresentative.value ? defaultConfig.swimlaneZeroColor : null)
            }),
          NaNColors: new HiddenFormControl(
            defaultConfig.swimlaneNanColor
          )
        }),
      }
    );
  }

  public customControls = {
    dataStep: {
      name: this.get('dataStep').get('name') as InputFormControl,
      dateAggregation: this.get('dataStep').get('dateAggregation') as BucketsIntervalFormGroup,
      termAggregation: {
        termAggregationField: this.get('dataStep').get('termAggregation').get('termAggregationField') as SelectFormControl,
        termAggregationSize: this.get('dataStep').get('termAggregation').get('termAggregationSize') as SliderFormControl
      },
      metric: this.get('dataStep').get('metric') as MetricFormGroup
    },
    renderStep: {
      swimlaneMode: this.get('renderStep').get('swimlaneMode') as SelectFormControl,
      swimlaneRepresentation: this.get('renderStep').get('swimlaneRepresentation') as SlideToggleFormControl,
      paletteColors: this.get('renderStep').get('paletteColors') as HuePaletteFormControl,
      isZeroRepresentative: this.get('renderStep').get('isZeroRepresentative') as SlideToggleFormControl,
      zerosColors: this.get('renderStep').get('zerosColors') as HiddenFormControl,
      NaNColors: this.get('renderStep').get('NaNColors') as HiddenFormControl
    }
  };

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
      this.bucketsIntervalBuilderService
        .build(collectionFieldsObs)
        .withTitle('Date aggregation'),
      this.metricBuilderService
        .build(collectionFieldsObs)
        .withTitle('Metric'),
      this.defaultValuesService.getDefaultConfig(),
      toKeywordOptionsObs(collectionFieldsObs));

    this.formBuilderDefault.setDefaultValueRecursively(this.defaultKey, formGroup);

    return formGroup;
  }

}
