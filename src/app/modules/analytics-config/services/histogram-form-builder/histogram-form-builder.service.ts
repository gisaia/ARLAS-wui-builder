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
import { CollectionService } from '@services/collection-service/collection.service';
import { MainFormService } from '@services/main-form/main-form.service';
import {
  ConfigFormGroup, SlideToggleFormControl, SelectFormControl, InputFormControl, TitleInputFormControl
} from '@shared-models/config-form';
import { ChartType } from 'arlas-web-components';
import { FormGroup, FormControl } from '@angular/forms';
import { WidgetFormBuilder } from '../widget-form-builder';
import {
  BucketsIntervalFormBuilderService, BucketsIntervalFormGroup
} from '../buckets-interval-form-builder/buckets-interval-form-builder.service';
import {
  MetricCollectFormBuilderService, MetricCollectFormGroup
} from '../metric-collect-form-builder/metric-collect-form-builder.service';
import { toNumericOrDateFieldsObs } from '@services/collection-service/tools';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

// TODO put in common with timeline
enum DateFormats {
  English = '%b %d %Y  %H:%M',
  French = '%d %b %Y  %H:%M'
}

export class HistogramFormGroup extends ConfigFormGroup {

  constructor(
    bucketsIntervalFg: BucketsIntervalFormGroup,
    metricFg: MetricCollectFormGroup
  ) {
    super(
      {
        title: new TitleInputFormControl(
          '',
          marker('histogram title'),
          marker('histogram title description')
        ),
        dataStep: new ConfigFormGroup({
          aggregation: bucketsIntervalFg.withTitle(marker('histogram x-Axis')),
          useUtc: new SlideToggleFormControl(
            '',
            marker('Use UTC time Zone to display date?'),
            marker('Use UTC time Zone to display date description'),
            {
              optional: true,
              dependsOn: () => [this.customControls.dataStep.aggregation],
              onDependencyChange: (control) =>
                control.enableIf(this.customControls.dataStep.aggregation.value.aggregationFieldType === 'time')
            }
          ),
          metric: metricFg.withTitle(marker('histogram y-Axis'))
        }).withTabName(marker('Data')),
        renderStep: new ConfigFormGroup({
          multiselectable: new SlideToggleFormControl(
            '',
            marker('Is multiselectable?'),
            marker('histogram multiselectable description')
          ),
          chartType: new SelectFormControl(
            '',
            marker('Chart type'),
            marker('chart type description'),
            false,
            [ChartType[ChartType.area], ChartType[ChartType.bars]].map(value => ({ value, label: value }))
          ),
          showHorizontalLines: new SlideToggleFormControl(
            '',
            marker('Show horizontal lines?'),
            ''
          ),
          ticksDateFormat: new SelectFormControl(
            '',
            marker('Date format'),
            marker('Date format description'),
            false,
            Object.keys(DateFormats).map(df => ({ value: DateFormats[df], label: df + '  (' + DateFormats[df] + ')' })),
            {
              optional: true,
              dependsOn: () => [this.customControls.dataStep.aggregation],
              onDependencyChange: (control) =>
                control.enableIf(this.customControls.dataStep.aggregation.value.aggregationFieldType === 'time')
            }
          ),
          showExportCsv: new SlideToggleFormControl(
            '',
            marker('export csv histogram'),
            marker('export csv histogram description')
          ),
        }).withTabName(marker('Render')),
        unmanagedFields: new FormGroup({
          dataStep: new FormGroup({
            isOneDimension: new FormControl(),
          }),
          renderStep: new FormGroup({
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
            xUnit: new FormControl(),
            yUnit: new FormControl(),
            chartXLabel: new FormControl(),
            showXTicks: new FormControl(),
            showYTicks: new FormControl(),
            showXLabels: new FormControl(),
            showYLabels: new FormControl(),
            shortYLabels: new FormControl(),
            barWeight: new FormControl(),
            isSmoothedCurve: new FormControl(),
            chartWidth: new FormControl(),
            chartHeight: new FormControl()
          })
        })
      }
    );
  }

  public customControls = {
    title: this.get('title') as TitleInputFormControl,
    dataStep: {
      aggregation: this.get('dataStep').get('aggregation') as BucketsIntervalFormGroup,
      useUtc: this.get('dataStep').get('useUtc') as SlideToggleFormControl,
      metric: this.get('dataStep').get('metric') as MetricCollectFormGroup
    },
    renderStep: {
      multiselectable: this.get('renderStep').get('multiselectable') as SlideToggleFormControl,
      chartType: this.get('renderStep').get('chartType') as SelectFormControl,
      showHorizontalLines: this.get('renderStep').get('showHorizontalLines') as SlideToggleFormControl,
      ticksDateFormat: this.get('renderStep').get('ticksDateFormat') as SelectFormControl,
      showExportCsv: this.get('renderStep').get('showExportCsv') as SlideToggleFormControl
    },
    unmanagedFields: {
      dataStep: {
        isOneDimension: this.get('unmanagedFields.dataStep.isOneDimension'),
      },
      renderStep: {
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
        xUnit: this.get('unmanagedFields.renderStep.xUnit'),
        yUnit: this.get('unmanagedFields.renderStep.yUnit'),
        chartXLabel: this.get('unmanagedFields.renderStep.chartXLabel'),
        showXTicks: this.get('unmanagedFields.renderStep.showXTicks'),
        showYTicks: this.get('unmanagedFields.renderStep.showYTicks'),
        showXLabels: this.get('unmanagedFields.renderStep.showXLabels'),
        showYLabels: this.get('unmanagedFields.renderStep.showYLabels'),
        shortYLabels: this.get('unmanagedFields.renderStep.shortYLabels'),
        barWeight: this.get('unmanagedFields.renderStep.barWeight'),
        isSmoothedCurve: this.get('unmanagedFields.renderStep.isSmoothedCurve'),
        chartWidth: this.get('unmanagedFields.renderStep.chartWidth'),
        chartHeight: this.get('unmanagedFields.renderStep.chartHeight'),
      }
    }
  };

}

@Injectable({
  providedIn: 'root'
})
export class HistogramFormBuilderService extends WidgetFormBuilder {

  public defaultKey = 'analytics.widgets.histogram';
  public widgetFormGroup: FormGroup;

  constructor(
    protected collectionService: CollectionService,
    protected mainFormService: MainFormService,
    private bucketsIntervalBuilderService: BucketsIntervalFormBuilderService,
    private defaultValuesService: DefaultValuesService,
    private metricBuilderService: MetricCollectFormBuilderService
  ) {
    super(collectionService, mainFormService);
  }

  public build(): HistogramFormGroup {

    const collectionFieldsObs = this.collectionService.getCollectionFields(
      this.mainFormService.getCollections()[0]);

    const formGroup = new HistogramFormGroup(
      this.bucketsIntervalBuilderService.build(toNumericOrDateFieldsObs(collectionFieldsObs), 'histogram'),
      this.metricBuilderService.build(collectionFieldsObs, 'histogram')
    );

    this.defaultValuesService.setDefaultValueRecursively(this.defaultKey, formGroup);

    return formGroup;
  }

}
