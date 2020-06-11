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
import { FormGroup, FormControl } from '@angular/forms';
import {
  ConfigFormGroup, InputFormControl, SelectFormControl, SliderFormControl,
  SlideToggleFormControl, HuePaletteFormControl, HiddenFormControl, SelectOption, ButtonToggleFormControl
} from '@shared-models/config-form';
import { CollectionService } from '@services/collection-service/collection.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { SwimlaneMode } from 'arlas-web-components';
import { DefaultValuesService, DefaultConfig } from '@services/default-values/default-values.service';
import {
  BucketsIntervalFormBuilderService, BucketsIntervalFormGroup
} from '../buckets-interval-form-builder/buckets-interval-form-builder.service';
import {
  MetricCollectFormBuilderService, MetricCollectFormGroup
} from '../metric-collect-form-builder/metric-collect-form-builder.service';
import { Observable } from 'rxjs';
import { toKeywordOptionsObs, toDateFieldsObs } from '@services/collection-service/tools';

enum SWIMLANE_REPRESENTATION {
  GLOBALLY = 'global',
  BY_COLUMN = 'column'
}
export class SwimlaneFormGroup extends ConfigFormGroup {

  constructor(
    dateAggregationFg: BucketsIntervalFormGroup,
    metricFg: MetricCollectFormGroup,
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
          aggregation: dateAggregationFg,
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
        }).withTabName('Data'),
        renderStep: new ConfigFormGroup({
          swimlaneMode: new SelectFormControl(
            '',
            'Swimlane mode',
            'description',
            false,
            [
              { value: SwimlaneMode[SwimlaneMode.fixedHeight].toString(), label: 'Fixed height' },
              { value: SwimlaneMode[SwimlaneMode.variableHeight].toString(), label: 'Variable height' },
              { value: SwimlaneMode[SwimlaneMode.circles].toString(), label: 'Circles' }
            ]
          ),
          swimlaneRepresentation: new ButtonToggleFormControl(
            '',
            [
              { label: 'Represent globally', value: SWIMLANE_REPRESENTATION.GLOBALLY },
              { label: 'or by column', value: SWIMLANE_REPRESENTATION.BY_COLUMN },
            ]
            ,
            'description'
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
            {
              childs: () => [this.customControls.renderStep.zerosColors, this.customControls.renderStep.NaNColor]
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
          NaNColor: new HiddenFormControl(
            defaultConfig.swimlaneNanColor
          )
        }).withTabName('Render'),
        unmanagedFields: new FormGroup({
          dataStep: new FormGroup({
            isOneDimension: new FormControl(),
          }),
          renderStep: new FormGroup({
            showExportCsv: new FormControl(),
            isHistogramSelectable: new FormControl(),
            topOffsetRemoveInterval: new FormControl(),
            leftOffsetRemoveInterval: new FormControl(),
            brushHandlesHeightWeight: new FormControl(),
            yAxisStartsFromZero: new FormControl(),
            xAxisPosition: new FormControl(),
            descriptionPosition: new FormControl(),
            xTicks: new FormControl(),
            yTicks: new FormControl(),
            xLabels: new FormControl(),
            yLabels: new FormControl(),
            showXTicks: new FormControl(),
            showYTicks: new FormControl(),
            showXLabels: new FormControl(),
            showYLabels: new FormControl(),
            barWeight: new FormControl(),
            swimLaneLabelsWidth: new FormControl(),
            swimlaneHeight: new FormControl(),
            swimlaneBorderRadius: new FormControl(),
          })
        })
      }
    );
  }

  public customControls = {
    dataStep: {
      name: this.get('dataStep').get('name') as InputFormControl,
      aggregation: this.get('dataStep').get('aggregation') as BucketsIntervalFormGroup,
      termAggregation: {
        termAggregationField: this.get('dataStep').get('termAggregation').get('termAggregationField') as SelectFormControl,
        termAggregationSize: this.get('dataStep').get('termAggregation').get('termAggregationSize') as SliderFormControl
      },
      metric: this.get('dataStep').get('metric') as MetricCollectFormGroup
    },
    renderStep: {
      swimlaneMode: this.get('renderStep').get('swimlaneMode') as SelectFormControl,
      swimlaneRepresentation: this.get('renderStep').get('swimlaneRepresentation') as SlideToggleFormControl,
      paletteColors: this.get('renderStep').get('paletteColors') as HuePaletteFormControl,
      isZeroRepresentative: this.get('renderStep').get('isZeroRepresentative') as SlideToggleFormControl,
      zerosColors: this.get('renderStep').get('zerosColors') as HiddenFormControl,
      NaNColor: this.get('renderStep').get('NaNColor') as HiddenFormControl
    },
    unmanagedFields: {
      renderStep: {
        showExportCsv: this.get('unmanagedFields.renderStep.showExportCsv'),
        isHistogramSelectable: this.get('unmanagedFields.renderStep.isHistogramSelectable'),
        topOffsetRemoveInterval: this.get('unmanagedFields.renderStep.topOffsetRemoveInterval'),
        leftOffsetRemoveInterval: this.get('unmanagedFields.renderStep.leftOffsetRemoveInterval'),
        brushHandlesHeightWeight: this.get('unmanagedFields.renderStep.brushHandlesHeightWeight'),
        yAxisStartsFromZero: this.get('unmanagedFields.renderStep.yAxisStartsFromZero'),
        xAxisPosition: this.get('unmanagedFields.renderStep.xAxisPosition'),
        descriptionPosition: this.get('unmanagedFields.renderStep.descriptionPosition'),
        xTicks: this.get('unmanagedFields.renderStep.xTicks'),
        yTicks: this.get('unmanagedFields.renderStep.yTicks'),
        xLabels: this.get('unmanagedFields.renderStep.xLabels'),
        yLabels: this.get('unmanagedFields.renderStep.yLabels'),
        showXTicks: this.get('unmanagedFields.renderStep.showXTicks'),
        showYTicks: this.get('unmanagedFields.renderStep.showYTicks'),
        showXLabels: this.get('unmanagedFields.renderStep.showXLabels'),
        showYLabels: this.get('unmanagedFields.renderStep.showYLabels'),
        barWeight: this.get('unmanagedFields.renderStep.barWeight'),
        swimLaneLabelsWidth: this.get('unmanagedFields.renderStep.swimLaneLabelsWidth'),
        swimlaneHeight: this.get('unmanagedFields.renderStep.swimlaneHeight'),
        swimlaneBorderRadius: this.get('unmanagedFields.renderStep.swimlaneBorderRadius'),
      }
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
    protected collectionService: CollectionService,
    protected mainFormService: MainFormService,
    private defaultValuesService: DefaultValuesService,
    private bucketsIntervalBuilderService: BucketsIntervalFormBuilderService,
    private metricBuilderService: MetricCollectFormBuilderService,
  ) {
    super(collectionService, mainFormService);
  }

  public build() {

    const collectionFieldsObs = this.collectionService.getCollectionFields(
      this.mainFormService.getCollections()[0]);

    const formGroup = new SwimlaneFormGroup(
      this.bucketsIntervalBuilderService
        .build(toDateFieldsObs(collectionFieldsObs))
        .withTitle('Date aggregation'),
      this.metricBuilderService
        .build(collectionFieldsObs)
        .withTitle('Metric'),
      this.defaultValuesService.getDefaultConfig(),
      toKeywordOptionsObs(collectionFieldsObs));

    this.defaultValuesService.setDefaultValueRecursively(this.defaultKey, formGroup);

    return formGroup;
  }

}
