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

import { Component, input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';
import { IconPickerDirective } from '@gisaia-team/ngx-icon-picker';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Display an icon picker for the given FormControl
 */
@Component({
  selector: 'arlas-config-icon-picker',
  imports: [
    MatIconModule,
    MatInputModule,
    IconPickerDirective,
    MatButtonModule,
    TranslatePipe,
    MatTooltip
],
  templateUrl: './config-icon-picker.component.html',
  styleUrl: './config-icon-picker.component.scss',
})
export class ConfigIconPickerComponent {
  public control = input.required<FormControl>();

  /**
   * Icon to display by default when the control has no value.
   * If the default is '', then a button is displayed to allow to remove the selected icon
   */
  public default = input<string>('short_text');

  private firstPick = true;

  /**
   * Based on the icon selected in the picker, updates the value of the form.
   * When there is no default value, a first selection is emitted, which gets bypassed.
   * @param event Selected icon
   */
  public onIconPickerSelect(event: string) {
    if (!this.default() && this.firstPick) {
      this.firstPick = false;
      return;
    }

    this.control().setValue(event);
  }
}
