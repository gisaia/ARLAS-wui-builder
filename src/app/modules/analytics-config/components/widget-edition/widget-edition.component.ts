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

import { ShortcutsService } from '@analytics-config/services/shortcuts/shortcuts.service';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { WidgetUsage } from '@services/main-form-manager/models-config';
import { WidgetConfigFormGroup } from '@shared-models/widget-config-form';
import { WIDGET_TYPE } from '../edit-group/models';

@Component({
  selector: 'arlas-widget-edition',
  templateUrl: './widget-edition.component.html',
  styleUrls: ['./widget-edition.component.scss'],
  imports: [
    MatTooltipModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe
  ]
})
export class WidgetEditionComponent implements OnInit, OnChanges {
  @Input() public widgetControls: { widgetType: FormControl<WIDGET_TYPE>; widgetData: WidgetConfigFormGroup; };
  @Input() public isValid: boolean;

  @Output() public edit: EventEmitter<void> = new EventEmitter();
  @Output() public delete: EventEmitter<void> = new EventEmitter();

  /** pin action */
  public showPinInMenu = false;
  public pinIconName = 'add_circle_outline';
  public pinText = 'Pin widget';

  public constructor(public shortcutService: ShortcutsService) {
  }

  public ngOnInit(): void {
    if (!!this.widgetControls) {
      if (this.widgetControls.widgetType) {
        /** show add/remove shortcut only for powerbars and histograms */
        this.showPinInMenu =
          (this.widgetControls.widgetType.value === WIDGET_TYPE.metricstable ||
            this.widgetControls.widgetType.value === WIDGET_TYPE.powerbars ||
            this.widgetControls.widgetType.value === WIDGET_TYPE.histogram
          );
      }
      if (this.widgetControls.widgetData) {
        const widgetConfigFg = this.widgetControls.widgetData;
        this.updateTemplate(widgetConfigFg.usage);
      }
    }
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.ngOnInit();
  }

  public update() {
    if (this.widgetControls.widgetData) {
      const widgetConfigFg = this.widgetControls.widgetData;
      this.updateTemplate(widgetConfigFg.usage);
    }
  }

  /**
   * Adds/removes the widget from the filters bar shortcuts.
   */
  public pin() {
    const widgetConfigFg = this.widgetControls.widgetData;
    if (widgetConfigFg.usage === 'analytics') {
      widgetConfigFg.setUsage('both');
      this.shortcutService.addShortcut(widgetConfigFg);
    } else {
      widgetConfigFg.setUsage('analytics');
      this.shortcutService.removeShortcut(widgetConfigFg.uuidControl.value);
    }
    this.updateTemplate(widgetConfigFg.usage);
  }

  /** changes icon/text according to add/remove the shortcut */
  private updateTemplate(usage: WidgetUsage) {
    if (!usage || usage === 'analytics') {
      this.pinIconName = 'add_circle_outline';
      this.pinText = 'Pin widget';
    } else {
      this.pinIconName = 'remove_circle_outline';
      this.pinText = 'Unpin widget';
    }
  }
}
