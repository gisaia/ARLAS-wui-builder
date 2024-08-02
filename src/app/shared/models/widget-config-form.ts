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

import { AbstractControl } from '@angular/forms';
import { HiddenFormControl } from './config-form';
import { CollectionConfigFormGroup } from './collection-config-form';
import { v4 as uuidv4 } from 'uuid';
import { ShortcutsConfig, WidgetUsage } from '@services/main-form-manager/models-config';

export class WidgetConfigFormGroup extends CollectionConfigFormGroup {
  public usage: WidgetUsage = 'analytics';
  public uuidControl: HiddenFormControl;
  public constructor(
    collection: string,
    controls: {
      [key: string]: AbstractControl;
    }) {
    controls['uuid'] = new HiddenFormControl(
      uuidv4(),
      null,
      {
        optional: true
      });
    controls['usage'] = new HiddenFormControl(
      'analytics',
      null,
      {
        optional: true
      });
    super(collection, controls);
    this.uuidControl = controls['uuid'] as HiddenFormControl;
    controls['usage'].valueChanges.subscribe(v => {
      this.usage = v;
    });
  }

  public setUsage(u: WidgetUsage) {
    this.usage = u;
    this.controls['usage'].setValue(u);
  }

  public getShortcutConfig(): ShortcutsConfig {
    return {
      uuid: this.uuidControl.value,
      title: this.controls['title'].value
    };
  }

}

