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
import {
  Config, AnalyticComponentConfig, AnalyticComponentHistogramInputConfig, ContributorConfig
} from '@services/main-form-manager/models-config';
import { TimelineGlobalFormGroup } from '../timeline-global-form-builder/timeline-global-form-builder.service';
import { importElements } from '@services/main-form-manager/tools';
import { BY_BUCKET_OR_INTERVAL } from '@analytics-config/services/buckets-interval-form-builder/buckets-interval-form-builder.service';
import { ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';
import { CollectionService } from '@services/collection-service/collection.service';

@Injectable({
  providedIn: 'root'
})
export class TimelineImportService {

  constructor(
    private mainFormService: MainFormService,
    private colorService: ArlasColorGeneratorLoader,
    private collectionService: CollectionService
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
        value: timelineContributor.useUtc !== undefined ? timelineContributor.useUtc : true,
        control: timelineFg.customControls.useUtc
      },
      {
        value: timelineComponent.input.multiselectable,
        control: timelineFg.customControls.tabsContainer.renderStep.timeline.isMultiselectable
      },
      {
        value: timelineContributor.collection,
        control: timelineDataStep.collection
      },
      {
        value: timelineContributor.aggregationmodels[0].field,
        control: timelineDataStep.aggregation.customControls.aggregationField
      },
      {
        value: !timelineContributor.numberOfBuckets ? BY_BUCKET_OR_INTERVAL.INTERVAL : BY_BUCKET_OR_INTERVAL.BUCKET,
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
    this.importUnmanagedFields(timelineContributor, timelineComponent, timelineFg, false);
    if (!!timelineContributor.additionalCollections) {
      this.importAddiontionalCollection(timelineContributor, timelineFg);
    }

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

      this.importUnmanagedFields(detailedTimelineContributor, detailedTimelineComponent, timelineFg, true);
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

  private importUnmanagedFields(
    contributor: ContributorConfig,
    timelineComponent: AnalyticComponentConfig,
    timelineFg: TimelineGlobalFormGroup,
    isDetailed: boolean
  ) {
    const componentInput = (timelineComponent.input as AnalyticComponentHistogramInputConfig);
    const unmanagedDataFields = isDetailed ?
      timelineFg.customControls.unmanagedFields.dataStep.detailedTimeline :
      timelineFg.customControls.unmanagedFields.dataStep.timeline;
    const unmanagedRenderTimelineFields = timelineFg.customControls.unmanagedFields.renderStep.timeline;
    const unmanagedRenderDetailedTimelineFields = timelineFg.customControls.unmanagedFields.renderStep.detailedTimeline;
    const unmanagedRenderFields = isDetailed ? unmanagedRenderDetailedTimelineFields : unmanagedRenderTimelineFields;


    importElements([
      {
        value: contributor.name,
        control: unmanagedDataFields.name
      },
      {
        value: contributor.icon,
        control: unmanagedDataFields.icon
      },
      {
        value: contributor.isOneDimension,
        control: unmanagedDataFields.isOneDimension
      },
      {
        value: componentInput.xTicks,
        control: unmanagedRenderFields.xTicks
      },
      {
        value: componentInput.yTicks,
        control: unmanagedRenderFields.yTicks
      },
      {
        value: componentInput.xLabels,
        control: unmanagedRenderFields.xLabels
      },
      {
        value: componentInput.yLabels,
        control: unmanagedRenderFields.yLabels
      },
      {
        value: componentInput.xUnit,
        control: unmanagedRenderFields.xUnit
      },
      {
        value: componentInput.yUnit,
        control: unmanagedRenderFields.yUnit
      },
      {
        value: componentInput.chartXLabel,
        control: unmanagedRenderFields.chartXLabel
      },
      {
        value: componentInput.shortYLabels,
        control: unmanagedRenderFields.shortYLabels
      },
      {
        value: componentInput.customizedCssClass,
        control: unmanagedRenderFields.customizedCssClass
      },
      {
        value: componentInput.chartHeight,
        control: unmanagedRenderFields.chartHeight
      },
      {
        value: componentInput.brushHandlesHeightWeight,
        control: unmanagedRenderFields.brushHandlesHeightWeight
      },
      {
        value: componentInput.isHistogramSelectable,
        control: unmanagedRenderFields.isHistogramSelectable
      },
      {
        value: componentInput.chartWidth,
        control: unmanagedRenderFields.chartWidth
      },
      {
        value: componentInput.xAxisPosition,
        control: unmanagedRenderFields.xAxisPosition
      },
      {
        value: componentInput.yAxisStartsFromZero,
        control: unmanagedRenderFields.yAxisStartsFromZero
      },
      {
        value: componentInput.descriptionPosition,
        control: unmanagedRenderFields.descriptionPosition
      },
      {
        value: componentInput.showXTicks,
        control: unmanagedRenderFields.showXTicks
      },
      {
        value: componentInput.showYTicks,
        control: unmanagedRenderFields.showYTicks
      },
      {
        value: componentInput.showXLabels,
        control: unmanagedRenderFields.showXLabels
      },
      {
        value: componentInput.showYLabels,
        control: unmanagedRenderFields.showYLabels
      },
      {
        value: componentInput.showHorizontalLines,
        control: unmanagedRenderFields.showHorizontalLines
      },
      {
        value: componentInput.isSmoothedCurve,
        control: unmanagedRenderFields.isSmoothedCurve
      },
      {
        value: componentInput.barWeight,
        control: unmanagedRenderFields.barWeight
      },
    ]);

    if (isDetailed) {
      importElements([
        {
          value: componentInput.multiselectable,
          control: unmanagedRenderDetailedTimelineFields.multiselectable
        }
      ]);
    } else {
      importElements([
        {
          value: componentInput.topOffsetRemoveInterval,
          control: unmanagedRenderTimelineFields.topOffsetRemoveInterval
        }
      ]);
    }
  }

  private importAddiontionalCollection(contributorConfig: ContributorConfig, timelineFg: TimelineGlobalFormGroup) {
    const additionalCollectionDataStep = timelineFg.customControls.tabsContainer.dataStep.additionalCollections;
    const additionalCollections = contributorConfig.additionalCollections.map(conf => conf.collectionName);
    importElements([
      {
        value: additionalCollections
          .map(c => ({ value: c, color: this.colorService.getColor(c), detail: this.collectionService.getCollectionInterval(c) })),
        control: additionalCollectionDataStep.collections
      }
    ]);
    additionalCollectionDataStep.collections.selectedMultipleItems = additionalCollections
      .map(c => ({ value: c, color: this.colorService.getColor(c), detail: this.collectionService.getCollectionInterval(c) }));
    additionalCollectionDataStep.collections.savedItems = new Set(additionalCollections);
  }

}
