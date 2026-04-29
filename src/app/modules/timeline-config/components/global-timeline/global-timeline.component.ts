/*
 * Licensed to Gisaïa under one or more contributor
 * license agreements. See the NOTICE.txt file distributed with
 * this work for additional information regarding copyright
 * ownership. Gisaïa licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { Component, forwardRef, inject } from '@angular/core';
import { MainFormService } from '@services/main-form/main-form.service';
import { ConfigFormControlComponent } from '@shared-components/config-form-control/config-form-control.component';
import { ConfigFormGroupComponent } from '@shared-components/config-form-group/config-form-group.component';
import { TimelineGlobalFormGroup } from '@timeline-config/services/timeline-global-form-builder/timeline-global-form-builder.service';

@Component({
  selector: 'arlas-global-timeline',
  templateUrl: './global-timeline.component.html',
  styleUrls: ['./global-timeline.component.scss'],
  imports: [
    forwardRef(() => ConfigFormControlComponent),
    forwardRef(() => ConfigFormGroupComponent)
  ]
})
export class GlobalTimelineComponent {
  private readonly mainFormService = inject(MainFormService);

  public globalFg: TimelineGlobalFormGroup = this.mainFormService.timelineConfig.getGlobalFg();
}
