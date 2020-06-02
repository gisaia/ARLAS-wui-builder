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
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';
import {
  ConfigFormGroup, SlideToggleFormControl, InputFormControl, SelectFormControl, SliderFormControl, ConfigFormControl, HiddenFormControl
} from '@shared-models/config-form';
import {
  BucketsIntervalFormGroup, BucketsIntervalFormBuilderService
} from '@analytics-config/services/buckets-interval-form-builder/buckets-interval-form-builder.service';
import { CollectionService, FIELD_TYPES } from '@services/collection-service/collection.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { ChartType } from 'arlas-web-components';
import { map } from 'rxjs/operators';
import { toDateFieldsObs } from '@services/collection-service/tools';

enum DateFormats {
  English = '%b %d %Y  %H:%M',
  French = '%d %b %Y  %H:%M'
}

export class TimelineGlobalFormGroup extends ConfigFormGroup {

  constructor(
    timelineBucketsIntervalFg: BucketsIntervalFormGroup
  ) {
    super(
      {
        useDetailedTimeline: new SlideToggleFormControl(
          '',
          'Use detailed timeline?',
          'Description'
        ),
        dataStep: new ConfigFormGroup({
          timeline: new ConfigFormGroup({
            aggregation: timelineBucketsIntervalFg,
          }
          ).withTitle('Timeline'),
          detailedTimeline: new ConfigFormGroup({
            bucketsNumber: new SliderFormControl(
              '',
              'Number of buckets',
              'description',
              10,
              200,
              5
            )
          },
            {
              dependsOn: () => [this.customControls.useDetailedTimeline],
              onDependencyChange: (control) =>
                this.customControls.useDetailedTimeline.value ? control.enable() : control.disable()
            }
          ).withTitle('Detailed timeline')
        }),
        renderStep: new ConfigFormGroup({
          timeline: new ConfigFormGroup({
            ...TimelineGlobalFormGroup.getCommonsControls(),
            isMultiselectable: new SlideToggleFormControl(
              false,
              'Is multi-selectable',
              'Description'
            )
          }).withTitle('Timeline'),
          detailedTimeline: new ConfigFormGroup({
            ...TimelineGlobalFormGroup.getCommonsControls(),
            selectionExtentPercent: new SliderFormControl(
              '',
              'Percent of selection extent',
              'Description',
              0,
              100,
              5
            )
          },
            {
              dependsOn: () => [this.customControls.useDetailedTimeline],
              onDependencyChange: (control) =>
                this.customControls.useDetailedTimeline.value ? control.enable() : control.disable()
            }).withTitle('Detailed timeline'),

        })
      });
  }

  public customControls = {
    useDetailedTimeline: this.get('useDetailedTimeline') as SlideToggleFormControl,
    dataStepGrp: this.get('dataStep') as ConfigFormControl,
    dataStep: {
      timeline: {
        aggregation: this.get('dataStep').get('timeline').get('aggregation') as BucketsIntervalFormGroup
      },
      detailedTimeline: {
        bucketsNumber: this.get('dataStep').get('detailedTimeline').get('bucketsNumber') as SliderFormControl
      }
    },
    renderStepGrp: this.get('renderStep') as ConfigFormControl,
    renderStep: {
      timeline: {
        chartTitle: this.get('renderStep').get('timeline').get('chartTitle') as InputFormControl,
        chartType: this.get('renderStep').get('timeline').get('chartType') as SelectFormControl,
        dateFormat: this.get('renderStep').get('timeline').get('dateFormat') as SelectFormControl,
        isMultiselectable: this.get('renderStep').get('timeline').get('isMultiselectable') as SlideToggleFormControl
      },
      detailedTimeline: {
        chartTitle: this.get('renderStep').get('detailedTimeline').get('chartTitle') as InputFormControl,
        chartType: this.get('renderStep').get('detailedTimeline').get('chartType') as SelectFormControl,
        dateFormat: this.get('renderStep').get('detailedTimeline').get('dateFormat') as SelectFormControl,
        selectionExtentPercent: this.get('renderStep').get('detailedTimeline').get('selectionExtentPercent') as SliderFormControl
      }
    }
  };

  private static getCommonsControls() {
    return {
      chartTitle: new InputFormControl(
        '',
        'Chart title',
        'Description'
      ),
      chartType: new SelectFormControl(
        '',
        'Chart type',
        'Description',
        false,
        [ChartType[ChartType.area], ChartType[ChartType.bars]].map(s =>
          ({ label: s, value: s }))
      ),
      dateFormat: new SelectFormControl(
        '',
        'Date format',
        'Description',
        false,
        Object.keys(DateFormats).map(df => ({
          label: df + ' (' + DateFormats[df] + ')', value: DateFormats[df]
        }))
      )
    };
  }

}

@Injectable({
  providedIn: 'root'
})
export class TimelineGlobalFormBuilderService {

  constructor(
    private collectionService: CollectionService,
    private mainFormService: MainFormService,
    private formBuilderDefault: FormBuilderWithDefaultService,
    private bucketsIntervalBuilderService: BucketsIntervalFormBuilderService,
  ) { }

  public build() {

    const longDateFields = toDateFieldsObs(this.collectionService.getCollectionFields(
      this.mainFormService.getCollections()[0]))
      .pipe(map(fields => fields.sort((a, b) => {
        // sort by DATE first, then by name
        if (a.type !== b.type) {
          return a.type === FIELD_TYPES.DATE ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      })));

    const timelineBucketIntervalFg = this.bucketsIntervalBuilderService.build(longDateFields);

    const timelineFormGroup = new TimelineGlobalFormGroup(
      timelineBucketIntervalFg);

    this.formBuilderDefault.setDefaultValueRecursively(
      'timeline.global',
      timelineFormGroup);

    return timelineFormGroup;
  }
}
