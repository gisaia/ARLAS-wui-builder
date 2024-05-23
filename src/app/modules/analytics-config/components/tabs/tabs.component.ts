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
import { AnalyticsInitService } from '@analytics-config/services/analytics-init/analytics-init.service';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import { TranslateService } from '@ngx-translate/core';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { ConfirmModalComponent } from '@shared-components/confirm-modal/confirm-modal.component';
import { InputModalComponent } from '@shared-components/input-modal/input-modal.component';
import { isFullyTouched, moveInFormArray } from '@utils/tools';
import { Subscription } from 'rxjs';
import { EditTabComponent } from '@analytics-config/components/edit-tab/edit-tab.component';
import { WidgetConfigFormGroup } from '@shared-models/widget-config-form';
import { ShortcutsService } from '@analytics-config/services/shortcuts/shortcuts.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

@Component({
  selector: 'arlas-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements OnDestroy {

  public tabsFa: FormArray;
  public editingTabIndex = -1;
  public editingTabName = '';
  public isEditingTab = false;
  public selectedIndex = 0;
  @ViewChild('matTabGroup', { static: false }) private matTabGroup: MatTabGroup;

  private newAfterClosedSub: Subscription;
  private removeAfterClosedSub: Subscription;
  private finishAfterClosedSub: Subscription;
  private editDialogRef: MatDialogRef<EditTabComponent>;

  public constructor(
    private defaultValuesService: DefaultValuesService,
    private translateService: TranslateService,
    private mainFormService: MainFormService,
    private analyticsInitService: AnalyticsInitService,
    private dialog: MatDialog,
    private translate: TranslateService,
    private shortcutsService: ShortcutsService,
  ) {

    this.tabsFa = this.mainFormService.analyticsConfig.getListFa();
  }

  public get tabs() {
    return this.tabsFa.controls.map(fg => fg.value.tabName);
  }

  public getTab = (index: number) => this.tabsFa.at(index) as FormGroup;

  public newTab() {
    const dialogRef = this.dialog.open(InputModalComponent, {data: {title: marker('Tab name')}});
    this.newAfterClosedSub = dialogRef.afterClosed().subscribe(tabName => {
      if (tabName) {
        this._addTab(tabName);
      }
    });
  }

  public addTab() {
    const existingTabNames = this.tabsFa.controls.map((fg: FormGroup) => fg.value.tabName);
    const defaultTabName = this.translateService.instant(
      this.defaultValuesService.getValue('analytics.tabs.new'));
    let newTabName = defaultTabName;
    let i = 1;

    while (existingTabNames.indexOf(newTabName) >= 0) {
      newTabName = `${defaultTabName} (${i++})`;
    }

    this._addTab(newTabName);
  }

  private _addTab(tabName: string) {
    // add new formgroup
    this.tabsFa.push(this.analyticsInitService.initNewTab(tabName));

    // select the newly created tab
    // because of the "+" tab which is at last index in the MatTabGroup (but not in the this.tabsFa.controls),
    // angular fails to resolve indexes properly. Timeout was the easier way to make it work as expected,
    // there might be better ways...
    // Moreover, matTabGroup.selectedIndex works whereas passing a "selectedIndex" to the mat-tab-group fails
    setTimeout(() => {
      this.matTabGroup.selectedIndex = this.tabsFa.controls.length - 1;
    }, 0);
  }

  public removeTab(tabIndex: number) {
    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      width: '400px',
      data: { message: marker('Do you really want to delete this tab?') }
    });

    this.removeAfterClosedSub = dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.removeAllShortcuts(tabIndex);
        this.tabsFa.removeAt(tabIndex);
        this.matTabGroup.selectedIndex = Math.min(tabIndex, this.tabsFa.controls.length - 1);
      }
    });
  }

  public configTab(tabIndex: number){
    const tab = this.getTab(tabIndex);
    this.editDialogRef = this.dialog.open(EditTabComponent, {
      data: {
        name: tab.value.tabName,
        icon: tab.value.tabIcon,
        showName: tab.value.showName,
        showIcon: tab.value.showIcon
      }
    });

    this.editDialogRef.afterClosed().subscribe( result => {
      if (result) {
        const otherTabNames = Object.values(this.tabsFa.controls).filter((c, index) => index !== tabIndex).map(c => c.get('tabName').value);
        const updateByCheckingDuplicates = (newTabName: string) => {
          if (otherTabNames.indexOf(newTabName) >= 0) {
            const dialogRef = this.dialog.open(InputModalComponent, {
              data: {
                title: 'Tab name',
                message: 'Another tab already exists with the same name, please choose another one',
                initialValue: newTabName,
                noCancel: true
              }
            });
            this.finishAfterClosedSub = dialogRef.afterClosed().subscribe(tabName => {
              updateByCheckingDuplicates(tabName);
            });
          } else {
            this.getTab(tabIndex).get('tabName').setValue(newTabName);
          }
        };
        updateByCheckingDuplicates(result.name);
        this.getTab(tabIndex).get('tabIcon').setValue(result.icon);
        this.getTab(tabIndex).get('showName').setValue(result.showName);
        this.getTab(tabIndex).get('showIcon').setValue(result.showIcon);
      }
    });
  }

  public startEditTabName(index: number) {
    if (!this.isEditingTab && index === this.matTabGroup.selectedIndex) {
      this.editingTabIndex = index;
      this.editingTabName = this.getTab(index).get('tabName').value;
      this.isEditingTab = true;
    }
  }

  public finishEditTabName(tabIndex: number) {
    const otherTabNames = Object.values(this.tabsFa.controls).filter((c, index) => index !== tabIndex).map(c => c.get('tabName').value);

    // update the tabName, if it is a duplicate then ask recursively for a unique name
    const updateByCheckingDuplicates = (newTabName: string) => {
      if (otherTabNames.indexOf(newTabName) >= 0) {
        const dialogRef = this.dialog.open(InputModalComponent, {
          data: {
            title: 'Tab name',
            message: 'Another tab already exists with the same name, please choose another one',
            initialValue: newTabName,
            noCancel: true
          }
        });
        this.finishAfterClosedSub = dialogRef.afterClosed().subscribe(tabName => {
          updateByCheckingDuplicates(tabName);
        });
      } else {
        this.getTab(tabIndex).get('tabName').setValue(newTabName);
      }
    };

    this.editingTabIndex = -1;
    // wait until editingTabIndex update removes the related input
    // otherwise, opening the dialog throws an additional focusout event
    // and opens another dialog
    setTimeout(() => {
      updateByCheckingDuplicates(this.editingTabName);
      this.isEditingTab = false;
    }, 0);
  }

  public getOtherTabsIds(tabIndex: number) {
    return this.tabs
      .map((tab, i) => i)
      .filter(i => i !== tabIndex)
      .map(i => 'tab-' + i);
  }

  public drop(event: CdkDragDrop<string[]>) {
    const previousIndex = parseInt(event.previousContainer.id.replace('tab-', ''), 10);
    const newIndex = parseInt(event.container.id.replace('tab-', ''), 10);
    moveInFormArray(previousIndex, newIndex, this.tabsFa);
    this.matTabGroup.selectedIndex = newIndex;
  }

  public tabHasError(index: number) {
    return this.tabsFa.at(index).invalid && isFullyTouched(this.tabsFa.at(index));
  }

  public ngOnDestroy() {
    this.matTabGroup = null;
    this.tabsFa = null;
    this.editingTabIndex = null;
    this.editingTabName = null;
    this.isEditingTab = null;
    if (this.newAfterClosedSub) {
      this.newAfterClosedSub.unsubscribe();
    }
    if (this.removeAfterClosedSub) {
      this.removeAfterClosedSub.unsubscribe();
    }
    if (this.finishAfterClosedSub) {
      this.finishAfterClosedSub.unsubscribe();
    }
  }

  private removeAllShortcuts(tabIndex: number) {
    const tab = this.getTab(tabIndex);
    const groupsFa: FormArray = (tab.controls.contentFg as FormGroup).controls.groupsFa as FormArray;
    if (groupsFa) {
      groupsFa.controls.forEach((group: FormGroup) => {
        const widgetsFa: FormArray = group.controls.content as FormArray;
        if (widgetsFa) {
          widgetsFa.controls.forEach((widget: FormGroup) => {
            const widgetConfigFg = widget.controls.widgetData as WidgetConfigFormGroup;
            this.shortcutsService.removeShortcut(widgetConfigFg.uuidControl.value);
          });
        }
      });
    }
  }

}
