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
import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatStepper } from '@angular/material';
import { Interval, Metric } from 'arlas-api';
import { CollectionService } from '@services/collection-service/collection.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { CollectionReferenceDescriptionProperty } from 'arlas-api';
import { CollectionField } from '@services/collection-service/models';
import {
  SelectFormControl, InputFormControl, SlideToggleFormControl, SliderFormControl, ConfigFormGroup
} from '@shared-models/config-form';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChartType } from 'arlas-web-components';
import { FormGroup } from '@angular/forms';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { WidgetComponent } from '../../models/widget-dialog';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';

// TODO put in common with timeline
enum DateFormats {
  English = '%b %d %Y  %H:%M',
  French = '%d %b %Y  %H:%M'
}

@Component({
  selector: 'app-widget-histogram',
  templateUrl: './widget-histogram.component.html',
  styleUrls: ['./widget-histogram.component.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true }
    }
  ]
})
export class WidgetHistogramComponent extends WidgetComponent implements OnInit {

  private static readonly NUMERIC_OR_DATE_TYPES = [
    CollectionReferenceDescriptionProperty.TypeEnum.DATE, CollectionReferenceDescriptionProperty.TypeEnum.INTEGER,
    CollectionReferenceDescriptionProperty.TypeEnum.LONG, CollectionReferenceDescriptionProperty.TypeEnum.DOUBLE,
    CollectionReferenceDescriptionProperty.TypeEnum.FLOAT
  ];

  private collectionFieldsObs: Observable<Array<CollectionField>>;
  public readonly defaultKey = 'analytics.widgets.histogram';

  constructor(
    public dialogRef: MatDialogRef<WidgetHistogramComponent>,
    @Inject(MAT_DIALOG_DATA) public componentValue: any,
    private collectionService: CollectionService,
    private mainFormService: MainFormService,
    private formBuilderDefault: FormBuilderWithDefaultService
  ) {

    super(dialogRef, componentValue);

    this.collectionFieldsObs = this.collectionService.getCollectionFields(
      this.mainFormService.getCollections()[0]);

    this.widgetFormGroup = formBuilderDefault.group(this.defaultKey, {
      dataStep: new ConfigFormGroup({
        name: new InputFormControl(
          '',
          'Name',
          'description'),
        aggregationField: new SelectFormControl(
          '',
          'Aggregation field',
          'description',
          true,
          this.collectionFieldsObs.pipe(map(
            fields => fields
              .filter(f => WidgetHistogramComponent.NUMERIC_OR_DATE_TYPES.indexOf(f.type) >= 0)
              .map(f => ({ key: f.name, value: f.name }))))),
        bucketOrInterval: new SlideToggleFormControl(
          '',
          'By bucket',
          'description',
          'or interval',
          {
            childs: () => [this.bucketsNumber, this.intervalUnit, this.intervalSize]
          }),
        bucketsNumber: new SliderFormControl(
          '',
          'Number of buckets',
          'description',
          10,
          200,
          5,
          {
            dependsOn: () => [this.bucketOrInterval],
            onDependencyChange: (control) =>
              !!this.bucketOrInterval.value ? control.disable() : control.enable()
          }),
        intervalUnit: new SelectFormControl(
          '',
          'Interval unit',
          'description',
          false,
          Array.from(
            new Set(
              Object.values(Interval.UnitEnum).map(v => {
                const value = typeof v === 'string' ? v.toLowerCase() : v.toString();
                return { key: value, value };
              })))
            .sort(),
          {
            dependsOn: () => [this.bucketOrInterval, this.aggregationField],
            onDependencyChange: (control) => {
              this.collectionFieldsObs.subscribe(fields => {
                if (this.bucketOrInterval.value &&
                  !!fields.find(f => f.name === this.aggregationField.value) &&
                  fields.find(f => f.name === this.aggregationField.value).type
                  === CollectionReferenceDescriptionProperty.TypeEnum.DATE) {
                  control.enable();
                } else {
                  control.disable();
                }
              });

            }
          }
        ),
        intervalSize: new InputFormControl(
          '',
          'Interval size',
          'description',
          'number',
          {
            dependsOn: () => [this.bucketOrInterval],
            onDependencyChange: (control) =>
              !!this.bucketOrInterval.value ? control.enable() : control.disable()
          }),
        metricCollectFunction: new SelectFormControl(
          '',
          'Metric collect function',
          'Descrip',
          false,
          [Metric.CollectFctEnum.AVG.toString(), Metric.CollectFctEnum.CARDINALITY.toString(),
          Metric.CollectFctEnum.MAX.toString(), Metric.CollectFctEnum.MIN.toString(),
          Metric.CollectFctEnum.SUM.toString()].map(value => ({ key: value, value })),
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

                const filterCallback = (field: CollectionField) => this.metricCollectFunction.value === Metric.CollectFctEnum.CARDINALITY ?
                  field : WidgetHistogramComponent.NUMERIC_OR_DATE_TYPES.indexOf(field.type) >= 0;

                this.collectionFieldsObs.subscribe(
                  fields => control.setSyncOptions(
                    fields
                      .filter(filterCallback)
                      .map(f => ({ key: f.name, value: f.name }))));
              } else {
                control.disable();
              }
            }
          }
        ),
        aggregationValue: new SelectFormControl(
          '',
          'Value used in aggregation',
          'description',
          false,
          [],
          {
            dependsOn: () => [this.metricCollectFunction],
            onDependencyChange: (control: SelectFormControl) => {
              // exclude metricCollectFunction.value if falsy
              control.setSyncOptions([this.metricCollectFunction.value, 'COUNT'].filter(Boolean).map(value => ({ key: value, value })));
            }
          }
        )
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
          [ChartType[ChartType.area], ChartType[ChartType.bars]].map(value => ({ key: value, value }))
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
          Object.keys(DateFormats).map(df => ({ key: DateFormats[df], value: df }))
        )
      })
    });
  }

  public ngOnInit() {
    super.ngOnInit();
  }

  get dataStep() {
    return this.widgetFormGroup.get('dataStep') as ConfigFormGroup;
  }

  get renderStep() {
    return this.widgetFormGroup.get('renderStep') as ConfigFormGroup;
  }

  get aggregationField() {
    return this.dataStep.get('aggregationField') as SelectFormControl;
  }

  get bucketOrInterval() {
    return this.dataStep.get('bucketOrInterval') as SlideToggleFormControl;
  }

  get bucketsNumber() {
    return this.dataStep.get('bucketsNumber') as SliderFormControl;
  }

  get intervalUnit() {
    return this.dataStep.get('intervalUnit') as SelectFormControl;
  }

  get intervalSize() {
    return this.dataStep.get('intervalSize') as InputFormControl;
  }

  get metricCollectFunction() {
    return this.dataStep.get('metricCollectFunction') as SelectFormControl;
  }

}

