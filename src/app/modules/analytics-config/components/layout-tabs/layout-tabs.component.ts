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
import { Component, OnInit, ViewChildren, QueryList, ViewContainerRef, ElementRef } from '@angular/core';
import { FormArray, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { TranslateService } from '@ngx-translate/core';
import { MainFormService } from '@services/main-form/main-form.service';
import { moveInFormArray as moveItemInFormArray } from '@utils/tools';
import { MainFormImportExportService } from '@services/main-form-import-export/main-form-import-export.service';

@Component({
  selector: 'app-anaytics-layout',
  templateUrl: './layout-tabs.component.html',
  styleUrls: ['./layout-tabs.component.scss']
})
export class LayoutTabsComponent implements OnInit {

  public tabsFa: FormArray;
  public editingTabIndex = -1;
  public editingTabName = '';

  constructor(
    private formBuilder: FormBuilder,
    private defaultValuesService: DefaultValuesService,
    private translateService: TranslateService,
    private mainFormService: MainFormService,
    private importExportService: MainFormImportExportService
  ) {

    this.mainFormService.analyticsConfig.initListFa(
      formBuilder.array([
        this.createNewTab(
          translateService.instant(
            defaultValuesService.getValue('analytics.tabs.default')))
      ],
        Validators.required));

    this.tabsFa = this.mainFormService.analyticsConfig.getListFa();
  }

  public ngOnInit() {
  }

  get tabs() {
    return this.tabsFa.controls.map(fg => fg.value.tabName);
  }

  public getTab = (index: number) => this.tabsFa.at(index) as FormGroup;

  public addTab() {
    this.tabsFa.controls.push(this.createNewTab(
      this.translateService.instant(
        this.defaultValuesService.getValue('analytics.tabs.new'))
    ));
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

  private createNewTab(name: string) {
    return this.formBuilder.group({
      tabName: [
        name,
        Validators.required
      ],
      contentFg: this.formBuilder.group({})
    });
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
  }

  public tabHasError(index: number) {
    return this.importExportService.isExportExpected && this.tabsFa.at(index).invalid;
  }

}
