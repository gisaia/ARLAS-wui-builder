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
import { Pipe, PipeTransform } from '@angular/core';
import { ConfigFormGroup } from '@shared-models/config-form';

@Pipe({
  name: 'orderConfigFormTabControls',
  standalone: true
})
export class OrderConfigFormTabControlsPipe implements PipeTransform {
  public transform(config: ConfigFormGroup) {
    if(config.tabsOrder && config.tabsOrder.length > 0) {
      return config.tabsOrder
        .map((item, index) => ({key:item, value: config.controls[item]}));
    } else {
      return Object.entries(config.controls)
        .map(([key, control]) => ({key, value: control}));
    }
  }
}
