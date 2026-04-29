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
import { Component } from '@angular/core';
import { MapGlobalFormGroup } from '@map-config/services/map-global-form-builder/map-global-form-builder.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { ConfigFormGroupComponent } from '@shared-components/config-form-group/config-form-group.component';

@Component({
  selector: 'arlas-global',
  templateUrl: './global-map.component.html',
  styleUrls: ['./global-map.component.scss'],
  imports: [
    ConfigFormGroupComponent
  ]
})
export class GlobalMapComponent {
  public globalFg: MapGlobalFormGroup;

  public constructor(
    private readonly mainFormService: MainFormService,
  ) {
    this.globalFg = this.mainFormService.mapConfig.getGlobalFg();
  }
}
