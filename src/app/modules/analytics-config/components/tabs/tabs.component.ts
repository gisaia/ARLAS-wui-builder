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
import { Component, ViewChild } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { TranslateService } from '@ngx-translate/core';
import { MainFormService } from '@services/main-form/main-form.service';
import { moveInFormArray as moveItemInFormArray } from '@utils/tools';
import { AnalyticsInitService } from '@analytics-config/services/analytics-init/analytics-init.service';
import { MainFormManagerService } from '@services/main-form-manager/main-form-manager.service';
import { MatDialog } from '@angular/material/dialog';
import { InputModalComponent } from '@shared-components/input-modal/input-modal.component';
import { ConfirmModalComponent } from '@shared-components/confirm-modal/confirm-modal.component';
import { MatTabGroup } from '@angular/material/tabs';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent {

  public tabsFa: FormArray;
  public editingTabIndex = -1;
  public editingTabName = '';
  @ViewChild('matTabGroup', { static: false }) private matTabGroup: MatTabGroup;

  constructor(
    private defaultValuesService: DefaultValuesService,
    private translateService: TranslateService,
    private mainFormService: MainFormService,
    private mainFormManager: MainFormManagerService,
    private analyticsInitService: AnalyticsInitService,
    private dialog: MatDialog,
    private translate: TranslateService
  ) {

    this.tabsFa = this.mainFormService.analyticsConfig.getListFa();
  }

  get tabs() {
    return this.tabsFa.controls.map(fg => fg.value.tabName);
  }

  public getTab = (index: number) => this.tabsFa.at(index) as FormGroup;

  public newTab() {
    const dialogRef = this.dialog.open(InputModalComponent);
    dialogRef.afterClosed().subscribe(tabName => {
      if (tabName) {
        this._addTab(tabName);
      }
    });
  }

  public addTab() {
    this._addTab(this.translateService.instant(
      this.defaultValuesService.getValue('analytics.tabs.new')));
  }

  private _addTab(tabName: string) {
    // add new formgroup
    this.tabsFa.controls.push(this.analyticsInitService.initNewTab(tabName));

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
      data: { message: this.translate.instant('delete this tab') }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.tabsFa.removeAt(tabIndex);
        this.matTabGroup.selectedIndex = Math.min(tabIndex, this.tabsFa.controls.length - 1);
      }
    });
  }

  public startEditTabName(index: number) {
    this.editingTabIndex = index;
    this.editingTabName = this.getTab(index).get('tabName').value;
  }

  public finishEditTabName(tabIndex: number) {
    this.getTab(tabIndex).get('tabName').setValue(this.editingTabName);
    this.editingTabIndex = -1;
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
    moveItemInFormArray(previousIndex, newIndex, this.tabsFa);
    this.matTabGroup.selectedIndex = newIndex;
  }

  public tabHasError(index: number) {
    return this.mainFormManager.isExportExpected && this.tabsFa.at(index).invalid;
  }

}
