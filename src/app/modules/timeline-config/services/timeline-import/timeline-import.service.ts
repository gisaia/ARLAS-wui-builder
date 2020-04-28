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
import { Config, AnalyticComponentConfig, ContributorConfig } from '@services/main-form-manager/models-config';
import { TimelineFormGroup } from '../timeline-form-builder/timeline-form-builder.service';

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

    // as timeline form is still using sub-forms, due to their nature we cannot get an instance to their form controls.
    // We can only set the value of the parent Form Control, angular will then propagate to every sub-control.
    // TODO after turning timeline forms to config forms, use a direct reference to the field, like in Search module

    timelineFg.patchValue({
      useDetailedTimeline: hasDetailedTimeline,
      timeline: this.getTimelineFormGroupValue(false, timelineContributor, timelineComponent)
    });

    if (hasDetailedTimeline) {
      timelineFg.patchValue({
        detailedTimeline: this.getTimelineFormGroupValue(true, detailedTimelineContributor, detailedTimelineComponent)
      });
    }

  }

  public getTimelineFormGroupValue(isDetailedTimeline: boolean, contributor: ContributorConfig, component: AnalyticComponentConfig) {
    return {
      isDetailedTimeline,
      field: contributor.aggregationmodels[0].field,
      bucketOrInterval: !!contributor.aggregationmodels[0].interval,
      bucketsNumber: contributor.numberOfBuckets,
      intervalUnit: !!contributor.aggregationmodels[0].interval ?
        !!contributor.aggregationmodels[0].interval.unit : null,
      intervalSize: !!contributor.aggregationmodels[0].interval ?
        !!contributor.aggregationmodels[0].interval.value : null,
      chartTitle: component.input.chartTitle,
      chartType: component.input.chartType,
      dateFormat: component.input.ticksDateFormat,
      isMultiselectable: component.input.multiselectable,
      selectionExtentPercent: contributor.selectionExtentPercentage * 100,
    };
  }

}
