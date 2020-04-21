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
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';
import {
  ConfigFormGroup, SlideToggleFormControl, SelectFormControl, InputFormControl
} from '@shared-models/config-form';
import { ChartType } from 'arlas-web-components';
import { FormGroup } from '@angular/forms';
import { WidgetFormBuilder } from '../widget-form-builder';
import { BucketsIntervalFormBuilderService } from '../buckets-interval-form-builder/buckets-interval-form-builder.service';
import { MetricFormBuilderService } from '../metric-form-builder/metric-form-builder.service';

// TODO put in common with timeline
enum DateFormats {
  English = '%b %d %Y  %H:%M',
  French = '%d %b %Y  %H:%M'
}

@Injectable()
export class HistogramFormBuilderService extends WidgetFormBuilder {

  public defaultKey = 'analytics.widgets.histogram';
  public widgetFormGroup: FormGroup;

  constructor(
    protected collectionService: CollectionService,
    protected mainFormService: MainFormService,
    private formBuilderDefault: FormBuilderWithDefaultService,
    private bucketsIntervalBuilderService: BucketsIntervalFormBuilderService,
    private metricBuilderService: MetricFormBuilderService
  ) {
    super(collectionService, mainFormService);

    this.widgetFormGroup = this.formBuilderDefault.group(this.defaultKey, {
      dataStep: new ConfigFormGroup({
        name: new InputFormControl(
          '',
          'Name',
          'description'),
        aggregation:
          bucketsIntervalBuilderService.build(this.getNumericOrDateFieldsObs(), this.collectionFieldsObs),
        metric:
          metricBuilderService.build(this.collectionFieldsObs)
      }),
      renderStep: new ConfigFormGroup({
        multiselectable: new SlideToggleFormControl(
          '',
          'Is multiselectable?',
          'description'
        ),
        chartType: new SelectFormControl(
          '',
          'Chart type',
          'description',
          false,
          [ChartType[ChartType.area], ChartType[ChartType.bars]].map(value => ({ value, label: value }))
        ),
        showHorizontalLines: new SlideToggleFormControl(
          '',
          'Show horizontal lines?',
          'description'
        ),
        ticksDateFormat: new SelectFormControl(
          '',
          'Date format',
          'description',
          false,
          Object.keys(DateFormats).map(df => ({ value: DateFormats[df], label: df }))
        )
      })
    });
  }

}
