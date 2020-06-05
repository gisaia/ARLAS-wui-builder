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
import { MainFormService } from '@services/main-form/main-form.service';
import { Config, AnalyticComponentConfig } from '@services/main-form-manager/models-config';
import { TimelineGlobalFormGroup } from '../timeline-global-form-builder/timeline-global-form-builder.service';
import { importElements } from '@services/main-form-manager/tools';

@Injectable({
  providedIn: 'root'
})
export class TimelineImportService {

  constructor(
    private mainFormService: MainFormService
  ) { }

  public doImport(config: Config) {

    const timelineContributor = config.arlas.web.contributors.find(c => c.identifier === 'timeline');
    const detailedTimelineContributor = config.arlas.web.contributors.find(c => c.identifier === 'detailedTimeline');

    const timelineComponent = config.arlas.web.components.timeline;
    const detailedTimelineComponent = config.arlas.web.components.detailedTimeline;

    const timelineFg = this.mainFormService.timelineConfig.getGlobalFg();
    const hasDetailedTimeline = !!detailedTimelineContributor && !!detailedTimelineComponent;

    const timelineDataStep = timelineFg.customControls.tabsContainer.dataStep.timeline;
    const detailedTimelineDataStep = timelineFg.customControls.tabsContainer.dataStep.detailedTimeline;

    importElements([
      {
        value: hasDetailedTimeline,
        control: timelineFg.customControls.useDetailedTimeline
      },
      {
        value: timelineComponent.input.multiselectable,
        control: timelineFg.customControls.tabsContainer.renderStep.timeline.isMultiselectable
      },
      {
        value: timelineContributor.aggregationmodels[0].field,
        control: timelineDataStep.aggregation.customControls.aggregationField
      },
      {
        value: !!timelineContributor.aggregationmodels[0].interval,
        control: timelineDataStep.aggregation.customControls.aggregationBucketOrInterval
      },
      {
        value: timelineContributor.numberOfBuckets,
        control: timelineDataStep.aggregation.customControls.aggregationBucketsNumber
      },
      {
        value: !!timelineContributor.aggregationmodels[0].interval ? timelineContributor.aggregationmodels[0].interval.unit : null,
        control: timelineDataStep.aggregation.customControls.aggregationIntervalUnit
      },
      {
        value: !!timelineContributor.aggregationmodels[0].interval ? timelineContributor.aggregationmodels[0].interval.value : null,
        control: timelineDataStep.aggregation.customControls.aggregationIntervalSize
      }
    ]);
    this.importCommonElements(timelineComponent, timelineFg, false);

    if (hasDetailedTimeline) {

      this.importCommonElements(detailedTimelineComponent, timelineFg, true);
      importElements([
        {
          value: detailedTimelineContributor.selectionExtentPercentage * 100,
          control: timelineFg.customControls.tabsContainer.renderStep.detailedTimeline.selectionExtentPercent
        },
        {
          value: detailedTimelineContributor.numberOfBuckets,
          control: detailedTimelineDataStep.bucketsNumber
        }
      ]);
    }
  }

  private importCommonElements(
    timelineComponent: AnalyticComponentConfig,
    timelineFg: TimelineGlobalFormGroup,
    isDetailed: boolean) {

    const renderStep = isDetailed ?
      timelineFg.customControls.tabsContainer.renderStep.detailedTimeline :
      timelineFg.customControls.tabsContainer.renderStep.timeline;

    importElements([
      {
        value: timelineComponent.input.chartTitle,
        control: renderStep.chartTitle
      },
      {
        value: timelineComponent.input.chartType,
        control: renderStep.chartType
      },
      {
        value: timelineComponent.input.ticksDateFormat,
        control: timelineFg.customControls.tabsContainer.renderStep.timeline.dateFormat
      }
    ]);
  }

}
