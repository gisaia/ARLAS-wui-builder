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
import { Component, OnInit, ViewChildren, QueryList, ViewContainerRef, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { TranslateService } from '@ngx-translate/core';
import { MainFormService } from '@services/main-form/main-form.service';
import { moveInFormArray as moveItemInFormArray } from '@utils/tools';
import { MatTabGroup } from '@angular/material';
import { AnalyticsInitService } from '@analytics-config/services/analytics-init/analytics-init.service';
import { MainFormManagerService } from '@services/main-form-manager/main-form-manager.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements OnInit {

  public tabsFa: FormArray;
  public editingTabIndex = -1;
  public editingTabName = '';
  @ViewChild('matTabGroup', { static: false }) private matTabGroup: MatTabGroup;

  constructor(
    private defaultValuesService: DefaultValuesService,
    private translateService: TranslateService,
    private mainFormService: MainFormService,
    private mainFormManager: MainFormManagerService,
    private analyticsInitService: AnalyticsInitService
  ) {

    this.tabsFa = this.mainFormService.analyticsConfig.getListFa();
  }

  public ngOnInit() {
  }

  get tabs() {
    return this.tabsFa.controls.map(fg => fg.value.tabName);
  }

  public getTab = (index: number) => this.tabsFa.at(index) as FormGroup;

  public addTab() {
    // add new formgroup
    this.tabsFa.controls.push(this.analyticsInitService.initNewTab(
      this.translateService.instant(
        this.defaultValuesService.getValue('analytics.tabs.new'))
    ));

    // select the newly created tab
    this.matTabGroup.selectedIndex = this.matTabGroup._tabs.length;
  }

  public removeTab(tabIndex: number) {
    this.tabsFa.removeAt(tabIndex);
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
