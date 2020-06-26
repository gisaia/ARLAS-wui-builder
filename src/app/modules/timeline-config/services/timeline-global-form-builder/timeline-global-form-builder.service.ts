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
import { FormGroup, FormControl } from '@angular/forms';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

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
          marker('Use detailed timeline?'),
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
            ).withTitle(marker('Timeline')),
            detailedTimeline: new ConfigFormGroup({
              bucketsNumber: new SliderFormControl(
                '',
                marker('Number of buckets'),
                marker('Number of buckets description'),
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
            ).withTitle(marker('Detailed timeline'))
          }).withTabName(marker('Data')),
          renderStep: new ConfigFormGroup({
            timeline: new ConfigFormGroup({
              ...TimelineGlobalFormGroup.getCommonsControls(),
              isMultiselectable: new SlideToggleFormControl(
                false,
                marker('Is multi-selectable'),
                marker('Is timeline multi-selectable description')
              )
            }).withTitle('Timeline'),
            detailedTimeline: new ConfigFormGroup({
              ...TimelineGlobalFormGroup.getCommonsControls(),
              selectionExtentPercent: new SliderFormControl(
                '',
                marker('Percent of selection extent'),
                marker('Timeline percent of selection extent description'),
                0,
                100,
                5
              )
            },
              {
                dependsOn: () => [this.customControls.useDetailedTimeline],
                onDependencyChange: (control) =>
                  control.enableIf(this.customControls.useDetailedTimeline.value)
              }).withTitle(marker('Detailed timeline')),

          }).withTabName(marker('Render'))
        }),
        unmanagedFields: new FormGroup({
          dataStep: new FormGroup({
            timeline: new FormGroup({
              name: new FormControl(),
              icon: new FormControl(),
              isOneDimension: new FormControl(),
            }),
            detailedTimeline: new FormGroup({
              name: new FormControl(),
              icon: new FormControl(),
              isOneDimension: new FormControl(),
            })
          }),
          renderStep: new FormGroup({
            timeline: new FormGroup({
              xTicks: new FormControl(),
              yTicks: new FormControl(),
              xLabels: new FormControl(),
              yLabels: new FormControl(),
              customizedCssClass: new FormControl(),
              chartHeight: new FormControl(),
              brushHandlesHeightWeight: new FormControl(),
              isHistogramSelectable: new FormControl(),
              chartWidth: new FormControl(),
              xAxisPosition: new FormControl(),
              yAxisStartsFromZero: new FormControl(),
              descriptionPosition: new FormControl(),
              showXTicks: new FormControl(),
              showYTicks: new FormControl(),
              showXLabels: new FormControl(),
              showYLabels: new FormControl(),
              showHorizontalLines: new FormControl(),
              isSmoothedCurve: new FormControl(),
              barWeight: new FormControl(),
              topOffsetRemoveInterval: new FormControl(),
            }),
            detailedTimeline: new FormGroup({
              xTicks: new FormControl(),
              yTicks: new FormControl(),
              xLabels: new FormControl(),
              yLabels: new FormControl(),
              customizedCssClass: new FormControl(),
              chartHeight: new FormControl(),
              multiselectable: new FormControl(),
              brushHandlesHeightWeight: new FormControl(),
              isHistogramSelectable: new FormControl(),
              chartWidth: new FormControl(),
              xAxisPosition: new FormControl(),
              yAxisStartsFromZero: new FormControl(),
              descriptionPosition: new FormControl(),
              showXTicks: new FormControl(),
              showYTicks: new FormControl(),
              showXLabels: new FormControl(),
              showYLabels: new FormControl(),
              showHorizontalLines: new FormControl(),
              isSmoothedCurve: new FormControl(),
              barWeight: new FormControl(),
            })
          }),

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
    },
    unmanagedFields: {
      dataStep: {
        timeline: {
          name: this.get('unmanagedFields.dataStep.timeline.name'),
          icon: this.get('unmanagedFields.dataStep.timeline.icon'),
          isOneDimension: this.get('unmanagedFields.dataStep.timeline.isOneDimension'),
        },
        detailedTimeline: {
          name: this.get('unmanagedFields.dataStep.detailedTimeline.name'),
          icon: this.get('unmanagedFields.dataStep.detailedTimeline.icon'),
          isOneDimension: this.get('unmanagedFields.dataStep.detailedTimeline.isOneDimension'),
        }
      },
      renderStep: {
        timeline: {
          xTicks: this.get('unmanagedFields.renderStep.timeline.xTicks'),
          yTicks: this.get('unmanagedFields.renderStep.timeline.yTicks'),
          xLabels: this.get('unmanagedFields.renderStep.timeline.xLabels'),
          yLabels: this.get('unmanagedFields.renderStep.timeline.yLabels'),
          customizedCssClass: this.get('unmanagedFields.renderStep.timeline.customizedCssClass'),
          chartHeight: this.get('unmanagedFields.renderStep.timeline.chartHeight'),
          brushHandlesHeightWeight: this.get('unmanagedFields.renderStep.timeline.brushHandlesHeightWeight'),
          isHistogramSelectable: this.get('unmanagedFields.renderStep.timeline.isHistogramSelectable'),
          chartWidth: this.get('unmanagedFields.renderStep.timeline.chartWidth'),
          xAxisPosition: this.get('unmanagedFields.renderStep.timeline.xAxisPosition'),
          yAxisStartsFromZero: this.get('unmanagedFields.renderStep.timeline.yAxisStartsFromZero'),
          descriptionPosition: this.get('unmanagedFields.renderStep.timeline.descriptionPosition'),
          showXTicks: this.get('unmanagedFields.renderStep.timeline.showXTicks'),
          showYTicks: this.get('unmanagedFields.renderStep.timeline.showYTicks'),
          showXLabels: this.get('unmanagedFields.renderStep.timeline.showXLabels'),
          showYLabels: this.get('unmanagedFields.renderStep.timeline.showYLabels'),
          showHorizontalLines: this.get('unmanagedFields.renderStep.timeline.showHorizontalLines'),
          isSmoothedCurve: this.get('unmanagedFields.renderStep.timeline.isSmoothedCurve'),
          barWeight: this.get('unmanagedFields.renderStep.timeline.barWeight'),
          topOffsetRemoveInterval: this.get('unmanagedFields.renderStep.timeline.topOffsetRemoveInterval'),
        },
        detailedTimeline: {
          xTicks: this.get('unmanagedFields.renderStep.detailedTimeline.xTicks'),
          yTicks: this.get('unmanagedFields.renderStep.detailedTimeline.yTicks'),
          xLabels: this.get('unmanagedFields.renderStep.detailedTimeline.xLabels'),
          yLabels: this.get('unmanagedFields.renderStep.detailedTimeline.yLabels'),
          customizedCssClass: this.get('unmanagedFields.renderStep.detailedTimeline.customizedCssClass'),
          chartHeight: this.get('unmanagedFields.renderStep.detailedTimeline.chartHeight'),
          multiselectable: this.get('unmanagedFields.renderStep.detailedTimeline.multiselectable'),
          brushHandlesHeightWeight: this.get('unmanagedFields.renderStep.detailedTimeline.brushHandlesHeightWeight'),
          isHistogramSelectable: this.get('unmanagedFields.renderStep.detailedTimeline.isHistogramSelectable'),
          chartWidth: this.get('unmanagedFields.renderStep.detailedTimeline.chartWidth'),
          xAxisPosition: this.get('unmanagedFields.renderStep.detailedTimeline.xAxisPosition'),
          yAxisStartsFromZero: this.get('unmanagedFields.renderStep.detailedTimeline.yAxisStartsFromZero'),
          descriptionPosition: this.get('unmanagedFields.renderStep.detailedTimeline.descriptionPosition'),
          showXTicks: this.get('unmanagedFields.renderStep.detailedTimeline.showXTicks'),
          showYTicks: this.get('unmanagedFields.renderStep.detailedTimeline.showYTicks'),
          showXLabels: this.get('unmanagedFields.renderStep.detailedTimeline.showXLabels'),
          showYLabels: this.get('unmanagedFields.renderStep.detailedTimeline.showYLabels'),
          showHorizontalLines: this.get('unmanagedFields.renderStep.detailedTimeline.showHorizontalLines'),
          isSmoothedCurve: this.get('unmanagedFields.renderStep.detailedTimeline.isSmoothedCurve'),
          barWeight: this.get('unmanagedFields.renderStep.detailedTimeline.barWeight'),
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
        marker('Chart title'),
        marker('Chart title description')
      ),
      chartType: new SelectFormControl(
        '',
        marker('Chart type'),
        marker('Chart type description'),
        false,
        [ChartType[ChartType.area], ChartType[ChartType.bars]].map(s =>
          ({ label: s, value: s }))
      ),
      dateFormat: new SelectFormControl(
        '',
        marker('Date format'),
        marker('Date format description'),
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
    private defaultValuesService: DefaultValuesService,
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

    this.defaultValuesService.setDefaultValueRecursively(
      'timeline.global',
      timelineFormGroup);

    return timelineFormGroup;
  }
}
