
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
import { Config, ShortcutsConfig } from '@services/main-form-manager/models-config';
import { WidgetConfigFormGroup } from '@shared-models/widget-config-form';

@Injectable({
  providedIn: 'root'
})
export class ShortcutsService {

  public shortcutsMap: Map<string, ShortcutsConfig> = new Map();
  public widgets: Map<string, WidgetConfigFormGroup> = new Map();
  public shortcuts: Array<ShortcutsConfig> = [];


  public doImport(config: Config) {
    this.widgets.clear();
    this.shortcutsMap.clear();
    this.shortcuts = [];
    const filtersShortcuts = config.arlas.web.filters_shortcuts;
    if (filtersShortcuts) {
      filtersShortcuts.forEach(fs => {
        this.shortcutsMap.set(fs.uuid, fs);
        this.shortcuts.push(fs);
      });
    }
  }


  public addShortcut(widget: WidgetConfigFormGroup) {
    const uuid = widget.uuidControl.value;
    this.widgets.set(uuid, widget);
    const shortcutConfig = widget.getShortcutConfig();
    const existingShortcutConfig = this.shortcutsMap.get(uuid);
    if (!!existingShortcutConfig) {
      shortcutConfig.order = existingShortcutConfig.order;
    } else {
      shortcutConfig.order = this.shortcutsMap.size + 1;
    }
    this.shortcutsMap.set(uuid, shortcutConfig);
    this.shortcuts = Array.from(this.shortcutsMap.values()).sort((a, b) => a.order - b.order);
  }

  public removeShortcut(uuid: string) {
    const widget = this.widgets.get(uuid);
    if (widget) {
      widget.setUsage('analytics');
      this.widgets.delete(uuid);
    }
    this.shortcutsMap.delete(uuid);
    this.shortcuts = this.shortcuts.filter(s => s.uuid !== uuid);
    this.shortcuts.forEach((s, i) => {
      s.order = i + 1;
      this.shortcutsMap.set(s.uuid, s);
    });
  }

  public isShortcut(uuid: string): boolean {
    return this.shortcutsMap.has(uuid);
  }

  public reorderFromList() {
    this.shortcuts.forEach((s, index) => {
      s.order = index + 1;
      this.shortcutsMap.set(s.uuid, s);
    });
  }

}
