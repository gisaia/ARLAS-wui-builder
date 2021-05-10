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
import { Component, OnInit, Input } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import {
  ResultlistFormBuilderService, ResultlistDetailFormGroup
} from '@analytics-config/services/resultlist-form-builder/resultlist-form-builder.service';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { moveInFormArray as moveItemInFormArray } from '@utils/tools';
import { SelectFormControl } from '@shared-models/config-form';

@Component({
  selector: 'app-edit-resultlist-details',
  templateUrl: './edit-resultlist-details.component.html',
  styleUrls: ['./edit-resultlist-details.component.scss']
})
export class EditResultlistDetailsComponent implements OnInit {

  @Input() public control: FormArray;
  @Input() public collection: SelectFormControl;

  constructor(
    private resultlistFormBuilder: ResultlistFormBuilderService
  ) { }

  public ngOnInit() {
    if (!!this.collection) {
      this.collection.valueChanges.subscribe(c => {
        (this.control as FormArray).clear();
      });
    }
  }

  public addDetail() {
    this.control.push(this.resultlistFormBuilder.buildDetail());
  }

  public deleteDetail(detailIndex: number) {
    this.control.removeAt(detailIndex);
  }

  public deleteField(detailIndex: number, fieldIndex: number) {
    this.getDetail(detailIndex).customControls.fields.removeAt(fieldIndex);
  }

  public addField(detailIndex: number) {
    this.getDetail(detailIndex).customControls.fields.push(
      this.resultlistFormBuilder.buildDetailField(this.collection.value));
  }

  public get details() {
    return this.control.controls as Array<ResultlistDetailFormGroup>;
  }

  public getDetail = (detailIndex: number) => this.control.at(detailIndex) as ResultlistDetailFormGroup;
  public getFields = (detailIndex: number) => this.getDetail(detailIndex).customControls.fields.controls as Array<FormGroup>;

  public drop = (event: CdkDragDrop<string[]>) => moveItemInFormArray(event.previousIndex, event.currentIndex, this.control);

}
