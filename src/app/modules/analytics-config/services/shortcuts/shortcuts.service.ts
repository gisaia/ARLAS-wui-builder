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
    shortcutConfig.order = this.shortcutsMap.size + 1;
    this.shortcuts.push(shortcutConfig);
    this.shortcutsMap.set(uuid, shortcutConfig);
  }

  public removeShortcut(uuid: string) {
    const widget = this.widgets.get(uuid);
    widget.setUsage('analytics');
    this.widgets.delete(uuid);
    this.shortcutsMap.delete(uuid);
    this.shortcuts = this.shortcuts.filter(s => s.uuid !== uuid);
    this.shortcuts.forEach((s, i) => {
      s.order = i + 1;
    });
  }

}
