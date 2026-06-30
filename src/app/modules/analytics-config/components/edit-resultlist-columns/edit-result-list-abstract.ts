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
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatError } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { ConfigFormControlComponent } from '@shared-components/config-form-control/config-form-control.component';
import { SelectFormControl } from '@shared-models/config-form';

@Component({
    selector: 'arlas-edit-result-list',
    template: ''
})
export abstract class EditResultListComponent implements OnInit {

    public abstract control: FormArray;
    public abstract collection: SelectFormControl;
    public abstract columnTable;

    public dragDisabled = true;

    public abstract displayedColumns: string[];

    public constructor(
        protected resultlistFormBuilder: ResultlistFormBuilderService
    ) {
    }

    public ngOnInit() {
        if (!!this.collection) {
            this.collection.valueChanges.subscribe(c => {
                (this.control as FormArray).clear();
            });
        }
    }

    public  abstract  addColumn(collection: string);

    public deleteColumn(colIndex: number) {
        this.control.removeAt(colIndex);
        this.columnTable.renderRows();
    }

    public get columns() {
        return this.control.controls as Array<ResultlistColumnFormGroup>;
    }

    public drop(event: CdkDragDrop<any[]>) {
        const previousIndex = this.control.controls.findIndex(row => row === event.item.data);
        moveItemInArray(this.control.controls, previousIndex, event.currentIndex);
        this.columnTable.renderRows();
    }

    public dragStarted(event) {
        this.dragDisabled = true;
    }

    public setSort(index, sort: string) {
        this.control.controls.forEach( c => c.get('sort').setValue(''));
        if (sort === '') {
            this.control.controls[index].get('sort').setValue('asc');
        } else if (sort === 'asc') {
            this.control.controls[index].get('sort').setValue('desc');
        } else {
            this.control.controls[index].get('sort').setValue('');
        }
    }
}
