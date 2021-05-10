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
import { map } from 'rxjs/internal/operators/map';
import { TimelineGlobalFormBuilderService } from '../timeline-global-form-builder/timeline-global-form-builder.service';

@Injectable({
  providedIn: 'root'
})
export class TimelineInitService {

  constructor(
    private mainFormService: MainFormService,
    private timelineGlobalFormBuilder: TimelineGlobalFormBuilderService,
    private collectionService: CollectionService
  ) { }

  public initModule(initCollectionTimepath: boolean) {


    this.mainFormService.timelineConfig.initGlobalFg(
      this.timelineGlobalFormBuilder.build(this.mainFormService.getMainCollection())
    );

    if (initCollectionTimepath) {
      this.initCollectionFields();
    }

  }

  // init the aggregation field, only when creating a new configuration
  private initCollectionFields() {

    this.collectionService.getDescribe(this.mainFormService.getMainCollection())
      .subscribe(collection => {
        if (!!collection.params.timestamp_path) {
          this.mainFormService.timelineConfig.getGlobalFg()
            .customControls.tabsContainer.dataStep.timeline.aggregation.get('aggregationField').setValue(collection.params.timestamp_path);
        }
      });

  }

}
