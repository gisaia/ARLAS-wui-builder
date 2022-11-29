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
import { FormControl, FormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { CollectionService } from '@services/collection-service/collection.service';
import { CollectionField } from '@services/collection-service/models';
import { NUMERIC_OR_DATE_TYPES, toNumericOrDateFieldsObs, toOptionsObs } from '@services/collection-service/tools';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { MainFormService } from '@services/main-form/main-form.service';
import {
  ConfigFormGroup, SelectFormControl, SlideToggleFormControl, TitleInputFormControl
} from '@shared-models/config-form';
import { Metric } from 'arlas-api';
import { ChartType } from 'arlas-web-components';
import {
  BucketsIntervalFormBuilderService, BucketsIntervalFormGroup
} from '../buckets-interval-form-builder/buckets-interval-form-builder.service';
import { BUCKET_TYPE } from '../buckets-interval-form-builder/models';
import {
  MetricCollectFormBuilderService, MetricCollectFormGroup
} from '../metric-collect-form-builder/metric-collect-form-builder.service';
import { METRIC_TYPE } from '../metric-collect-form-builder/models';
import { WidgetFormBuilder } from '../widget-form-builder';

// TODO put in common with timeline
enum DateFormats {
  English = '%b %d %Y  %H:%M',
  French = '%d %b %Y  %H:%M'
}

export class HistogramFormGroup extends ConfigFormGroup {

  public constructor(
    collection: string,
    collectionService: CollectionService,
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
          collection: new SelectFormControl(
            collection,
            marker('Collection'),
            marker('Histogram collection description'),
            false,
            collectionService.getCollections().map(c => ({ label: c, value: c })),
            {
              optional: false,
              resetDependantsOnChange: true
            }
          ),
          aggregation: bucketsIntervalFg.withTitle(marker('histogram x-Axis'))
            .withDependsOn(() => [this.customControls.dataStep.collection]).withOnDependencyChange(
              (control) => {
                bucketsIntervalFg.setCollection(this.customControls.dataStep.collection.value);
                toOptionsObs(toNumericOrDateFieldsObs(collectionService
                  .getCollectionFields(this.customControls.dataStep.collection.value))).subscribe(collectionFields => {
                  bucketsIntervalFg.customControls.aggregationField.setSyncOptions(collectionFields);
                });
              }
            ),
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
            .withDependsOn(() => [this.customControls.dataStep.collection]).withOnDependencyChange(
              (control) => {
                metricFg.setCollection(this.customControls.dataStep.collection.value);
                const filterCallback = (field: CollectionField) =>
                  metricFg.customControls.metricCollectFunction.value === Metric.CollectFctEnum.CARDINALITY ?
                    field : NUMERIC_OR_DATE_TYPES.indexOf(field.type) >= 0;
                collectionService.getCollectionFields(this.customControls.dataStep.collection.value).subscribe(
                  fields => {
                    metricFg.customControls.metricCollectField.setSyncOptions(
                      fields
                        .filter(filterCallback)
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(f => ({ value: f.name, label: f.name, enabled: f.indexed })));
                  }
                );
              }
            )
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
            marker('Chart type description'),
            false,
            [ChartType[ChartType.area], ChartType[ChartType.bars], ChartType[ChartType.curve]].map(value => ({ value, label: value }))
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
      collection: this.get('dataStep').get('collection') as SelectFormControl,
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

  public constructor(
    protected collectionService: CollectionService,
    protected mainFormService: MainFormService,
    private bucketsIntervalBuilderService: BucketsIntervalFormBuilderService,
    private defaultValuesService: DefaultValuesService,
    private metricBuilderService: MetricCollectFormBuilderService
  ) {
    super(collectionService, mainFormService);
  }

  public build(collection: string): HistogramFormGroup {

    const formGroup = new HistogramFormGroup(
      collection,
      this.collectionService,
      this.bucketsIntervalBuilderService.build(collection, BUCKET_TYPE.HISTOGRAM),
      this.metricBuilderService.build(collection, METRIC_TYPE.HISTOGRAM)
    );

    this.defaultValuesService.setDefaultValueRecursively(this.defaultKey, formGroup);

    return formGroup;
  }

}
