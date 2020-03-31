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
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-anaytics-layout',
  templateUrl: './anaytics-layout.component.html',
  styleUrls: ['./anaytics-layout.component.scss']
})
export class AnayticsLayoutComponent implements OnInit {

  public tabsFa: FormArray;
  public editingTabIndex = -1;
  public editingTabName = '';

  constructor(
    private formBuilder: FormBuilder,
    private defaultValuesService: DefaultValuesService,
    private translateService: TranslateService
  ) {

    this.tabsFa = formBuilder.array([
      this.createNewTab(
        translateService.instant(
          defaultValuesService.getValue('analytics.tabs.default')))
    ]);
  }

  public ngOnInit() {
  }

  get tabs() {
    return this.tabsFa.controls.map(fg => fg.value.tabName);
  }

  public addTab() {
    this.tabsFa.controls.push(this.createNewTab(
      this.translateService.instant(
        this.defaultValuesService.getValue('analytics.tabs.new'))
    ));
  }

  public removeTab(tabIndex: number) {
    this.tabsFa.removeAt(tabIndex);
  }

  public startEditTabName(tabIndex: number) {
    this.editingTabIndex = tabIndex;
    this.editingTabName = this.tabsFa.at(tabIndex).get('tabName').value;
  }

  public finishEditTabName(tabIndex: number) {
    this.tabsFa.at(tabIndex).get('tabName').setValue(this.editingTabName);
    this.editingTabIndex = -1;
  }

  private createNewTab(name: string) {
    return this.formBuilder.group({
      tabName: [
        name,
        Validators.required
      ]
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
    const currentIndex = parseInt(event.container.id.replace('tab-', ''), 10);
    const previousTab = this.tabsFa.at(previousIndex);

    if (previousIndex === currentIndex) {
      return;
    }

    if (previousIndex < currentIndex) {
      this.tabsFa.insert(currentIndex + 1, previousTab);
      this.tabsFa.removeAt(previousIndex);
    } else {
      this.tabsFa.insert(currentIndex, previousTab);
      this.tabsFa.removeAt(previousIndex + 1);
    }
  }

}
