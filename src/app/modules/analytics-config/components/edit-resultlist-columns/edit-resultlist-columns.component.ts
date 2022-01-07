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
  ResultlistColumnFormGroup, ResultlistFormBuilderService
} from '@analytics-config/services/resultlist-form-builder/resultlist-form-builder.service';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray } from '@angular/forms';
import { SelectFormControl } from '@shared-models/config-form';

@Component({
  selector: 'arlas-edit-resultlist-columns',
  templateUrl: './edit-resultlist-columns.component.html',
  styleUrls: ['./edit-resultlist-columns.component.scss']
})
export class EditResultlistColumnsComponent implements OnInit {

  @Input() public control: FormArray;
  @Input() public collection: SelectFormControl;

  public constructor(
    private resultlistFormBuilder: ResultlistFormBuilderService
  ) {
  }

  public ngOnInit() {
    if (!!this.collection) {
      this.collection.valueChanges.subscribe(c => {
        (this.control as FormArray).clear();
      });
    }
  }

  public addColumn(collection: string) {
    this.control.push(this.resultlistFormBuilder.buildColumn(collection));
  }

  public deleteColumn(colIndex: number) {
    this.control.removeAt(colIndex);
  }

  public get columns() {
    return this.control.controls as Array<ResultlistColumnFormGroup>;
  }

}
