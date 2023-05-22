import { Injectable } from '@angular/core';
import { ShortcutsConfig } from '@services/main-form-manager/models-config';
import { WidgetConfigFormGroup } from '@shared-models/widget-config-form';

@Injectable({
  providedIn: 'root'
})
export class ShortcutsService {

  public shortcutsMap: Map<string, ShortcutsConfig> = new Map();
  public widgets: Map<string, WidgetConfigFormGroup> = new Map();
  public shortcuts: Array<ShortcutsConfig> = [];


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

}
