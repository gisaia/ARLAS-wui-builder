/*
 * Licensed to Gisaïa under one or more contributor
 * license agreements. See the NOTICE.txt file distributed with
 * this work for additional information regarding copyright
 * ownership. Gisaïa licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import {
  ResultlistColumnFormGroup, ResultlistFormBuilderService
} from '@analytics-config/services/resultlist-form-builder/resultlist-form-builder.service';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, input, OnInit, ViewChild } from '@angular/core';
import { FormArray } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatError } from '@angular/material/select';
import { MatTable, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { ConfigFormControlComponent } from '@shared-components/config-form-control/config-form-control.component';
import { SelectFormControl } from '@shared-models/config-form';

@Component({
  selector: 'arlas-edit-resultlist-columns',
  templateUrl: './edit-resultlist-columns.component.html',
  styleUrls: ['./edit-resultlist-columns.component.scss'],
  imports: [
    MatTableModule,
    DragDropModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    ConfigFormControlComponent,
    TranslatePipe,
    MatError
  ]
})
export class EditResultlistColumnsComponent implements OnInit {

  public control = input.required<FormArray<ResultlistColumnFormGroup>>();
  public collection = input.required<SelectFormControl>();
  @ViewChild('columnTable', { static: true }) public columnTable?: MatTable<any>;

  public dragDisabled = true;

  public displayedColumns: string[] = ['action', 'name', 'field', 'unit', 'process', 'colorService'];

  public constructor(
    private readonly resultlistFormBuilder: ResultlistFormBuilderService
  ) {
  }

  public ngOnInit() {
    this.collection().valueChanges.subscribe(c => {
      this.control().clear();
    });
  }

  public addColumn(collection: string) {
    this.control().push(this.resultlistFormBuilder.buildColumn(collection));
    this.columnTable?.renderRows();
  }

  public deleteColumn(colIndex: number) {
    this.control().removeAt(colIndex);
    this.columnTable?.renderRows();
  }

  public get columns() {
    return this.control().controls;
  }

  public drop(event: CdkDragDrop<any[]>) {
    const previousIndex = this.control().controls.findIndex(row => row === event.item.data);
    moveItemInArray(this.control().controls, previousIndex, event.currentIndex);
    this.columnTable?.renderRows();
  }

  public dragStarted() {
    this.dragDisabled = true;
  }

  public setSort(index: number, sort: string) {
    this.control().controls.forEach(c => c.customControls.sort.setValue(''));
    if (sort === '') {
      this.control().controls[index].customControls.sort.setValue('asc');
    } else if (sort === 'asc') {
      this.control().controls[index].customControls.sort.setValue('desc');
    } else {
      this.control().controls[index].customControls.sort.setValue('');
    }
  }
}
