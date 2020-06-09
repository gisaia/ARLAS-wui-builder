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
          '',
          {
            resetDependantsOnChange: true
          }
        ),
        // using container because form groups with tabs cannot be at same level as form control
        tabsContainer: new ConfigFormGroup({
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
                  control.enableIf(this.customControls.useDetailedTimeline.value)
              }
            ).withTitle('Detailed timeline')
          }).withTabName('Data'),
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
                  control.enableIf(this.customControls.useDetailedTimeline.value)
              }).withTitle('Detailed timeline'),

          }).withTabName('Render')
        })
      });
  }

  public customControls = {
    useDetailedTimeline: this.get('useDetailedTimeline') as SlideToggleFormControl,
    tabsContainer: {
      dataStep: {
        timeline: {
          aggregation: this.get('tabsContainer.dataStep.timeline.aggregation') as BucketsIntervalFormGroup
        },
        detailedTimeline: {
          bucketsNumber: this.get('tabsContainer.dataStep.detailedTimeline.bucketsNumber') as SliderFormControl
        }
      },
      renderStep: {
        timeline: {
          chartTitle: this.get('tabsContainer.renderStep.timeline.chartTitle') as InputFormControl,
          chartType: this.get('tabsContainer.renderStep.timeline.chartType') as SelectFormControl,
          dateFormat: this.get('tabsContainer.renderStep.timeline.dateFormat') as SelectFormControl,
          isMultiselectable: this.get('tabsContainer.renderStep.timeline.isMultiselectable') as SlideToggleFormControl
        },
        detailedTimeline: {
          chartTitle: this.get('tabsContainer.renderStep.detailedTimeline.chartTitle') as InputFormControl,
          chartType: this.get('tabsContainer.renderStep.detailedTimeline.chartType') as SelectFormControl,
          dateFormat: this.get('tabsContainer.renderStep.detailedTimeline.dateFormat') as SelectFormControl,
          selectionExtentPercent: this.get('tabsContainer.renderStep.detailedTimeline.selectionExtentPercent') as SliderFormControl
        }
      }
    }
  };

  public customGroups = {
    tabsContainer: this.get('tabsContainer') as ConfigFormGroup,
    dataStep: this.get('tabsContainer.dataStep') as ConfigFormGroup,
    dataStepTimeline: this.get('tabsContainer.dataStep.timeline') as ConfigFormGroup,
    dataStepDetailedTimeline: this.get('tabsContainer.dataStep.detailedTimeline') as ConfigFormGroup,
    renderStep: this.get('tabsContainer.renderStep') as ConfigFormGroup,
    renderStepTimeline: this.get('tabsContainer.renderStep.timeline') as ConfigFormGroup,
    renderStepDetailedTimeline: this.get('tabsContainer.renderStep.detailedTimeline') as ConfigFormGroup,
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
