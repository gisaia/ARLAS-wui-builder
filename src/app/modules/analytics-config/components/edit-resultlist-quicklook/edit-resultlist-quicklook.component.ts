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

import {
  ResultlistFormBuilderService, ResultlistQuicklookFormGroup
} from '@analytics-config/services/resultlist-form-builder/resultlist-form-builder.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray } from '@angular/forms';
import { SelectFormControl } from '@shared-models/config-form';


@Component({
  selector: 'arlas-edit-resultlist-quicklook',
  templateUrl: './edit-resultlist-quicklook.component.html',
  styleUrls: ['./edit-resultlist-quicklook.component.scss']
})
export class EditResultlistQuicklookComponent implements OnInit {

  @Input() public collectionControl: SelectFormControl;
  @Input() public control: FormArray;
  @ViewChild('quicklookTable', { static: true }) public quicklookTable;

  public displayedColumns: string[] = ['action', 'url', 'description', 'filterField', 'filterValues'];
  public dragDisabled = true;

  public constructor(
    private resultlistFormBuilder: ResultlistFormBuilderService
  ) { }

  public ngOnInit(): void {
    if (!!this.collectionControl) {
      this.collectionControl.valueChanges.subscribe(c => {
        this.control.clear();
      });
    }
  }

  public addQuicklook() {
    this.control.push(this.resultlistFormBuilder.buildQuicklook(this.collectionControl.value));
    this.quicklookTable.renderRows();
  }

  public removeQuicklook(quicklookIndex: number) {
    this.control.removeAt(quicklookIndex);
    this.quicklookTable.renderRows();
  }

  public dragStarted(event) {
    this.dragDisabled = true;
  }

  public drop(event: CdkDragDrop<any[]>) {
    const previousIndex = this.control.controls.findIndex(row => row === event.item.data);
    moveItemInArray(this.control.controls, previousIndex, event.currentIndex);
    this.quicklookTable.renderRows();
  }

  public get quicklooks() {
    return this.control.controls as Array<ResultlistQuicklookFormGroup>;
  }
}
