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
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ConfigFormGroup, ConfigFormGroupArray } from '@shared-models/config-form';

@Component({
  selector: 'arlas-config-form-group-array',
  templateUrl: './config-form-group-array.component.html',
  styleUrls: ['./config-form-group-array.component.scss']
})
export class ConfigFormGroupArrayComponent implements OnInit, OnDestroy {

  @Input() public configFormGroupArray: ConfigFormGroupArray;
  @Input() public defaultKey: string;

  public constructor() { }

  public ngOnInit() {
  }

  public ngOnDestroy() {
    this.configFormGroupArray = null;
    this.defaultKey = null;
  }

  public get formGroups() {
    return this.configFormGroupArray.controls as Array<ConfigFormGroup>;
  }

}
