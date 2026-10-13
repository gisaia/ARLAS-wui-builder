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
    ResultListCardFieldsFormGroup, ResultListCardLineFormGroup
} from '@analytics-config/services/resultlist-form-builder/form-group';
import { buildCardViewProperties } from '@analytics-config/services/resultlist-form-builder/utils';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatError } from '@angular/material/select';
import { MatTable, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { CollectionService } from '@services/collection-service/collection.service';
import { ConfigFormControlComponent } from '@shared-components/config-form-control/config-form-control.component';
import { ConfigIconPickerComponent } from '@shared-components/config-icon-picker/config-icon-picker.component';
import { SelectFormControl } from '@shared-models/config-form';

@Component({
    selector: 'arlas-edit-card-resultlist-columns',
    templateUrl: './edit-card-resultlist.component.html',
    styleUrls: ['./edit-card-resultlist.component.scss'],
    imports: [MatTableModule, DragDropModule, MatIconModule, MatButtonModule,
    MatTooltipModule, ConfigFormControlComponent, TranslatePipe, MatError, MatCard, ConfigIconPickerComponent]
})
export class EditCardResultListComponent implements OnInit {
    /** The form array controlling the card lines. */
    @Input() public control: FormArray<ResultListCardLineFormGroup>;
    /** The collection selector control used to detect collection changes and reset the cards. */
    @Input() public collection: SelectFormControl;

    /** Whether drag is currently disabled on the tables. */
    public dragDisabled = true;
    /** Columns displayed in each card line table. */
    public displayedColumns: string[] = ['action', 'icon', 'name', 'field', 'unit', 'process', 'title', 'delete'];
    /** Reference to the previously dragged table, used to re-render it after a cross-table drop. */
    public previousTable: MatTable<ResultListCardFieldsFormGroup>;
    /** Maximum number of card lines allowed. */
    protected readonly maxLine = 3;
    private readonly collectionService = inject(CollectionService);
    private readonly destroyRef = inject(DestroyRef);

    /** Returns the list of card line form groups. */
    public get cards() {
        return this.control.controls ;
    }

    public ngOnInit() {
        if (this.collection) {
            this.collection.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(c => {
                this.control.clear();
            });
        }
    }

    /** Called when a drag interaction starts. Disables drag and stores the source table. */
    public dragStarted(event, lineTable: MatTable<ResultListCardFieldsFormGroup>) {
        this.dragDisabled = true;
        this.previousTable = lineTable;
    }

    /** Removes the field at the given index from the specified card line. */
    public deleteField(lineIndex: number, fieldIndex: number, lineTable: MatTable<ResultListCardFieldsFormGroup>) {
        this.getCard(lineIndex)?.customControls.fields.removeAt(fieldIndex);
        lineTable.renderRows();
    }

    /** Adds a new field to the specified card line. */
    public addField(lineIndex: number, lineTable: MatTable<ResultListCardFieldsFormGroup>) {
        const prop = buildCardViewProperties(this.collectionService, this.collection.value);
        prop.customControls.lineNumber.setValue(lineIndex);
        this.getCard(lineIndex)?.customControls.fields.controls.push(prop);
        lineTable.renderRows();
    }

    /** Returns the card form group for the given line index, or null if out of bounds. */
    public getCard = (lineIndex: number): ResultListCardLineFormGroup | null => this.control.at(lineIndex);

    /** Returns the fields controls of the card at the given index, or undefined. */
    public getFields = (detailIndex: number) => this.getCard(detailIndex)?.customControls.fields.controls;

    /** Handles the drop event for reordering fields within or between card lines. */
    public drop = (event: CdkDragDrop<any>, lineTable: MatTable<ResultListCardFieldsFormGroup>, lineIndex: number) => {

        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex,);
            if (this.previousTable) {
                this.previousTable.renderRows();
                this.previousTable = null;
            }
        }
        this.getFields(lineIndex)?.at(event.currentIndex)?.get('lineNumber')?.setValue(lineIndex);
        lineTable.renderRows();
    };

    /** Cycles through asc / desc / no-sort for the field at the given index. */
    public setSort(lineIndex: number, index: number, sort: string) {
        this.getCard(lineIndex)?.customControls.fields.controls.forEach(c => c.get('sort')?.setValue(''));
        if (sort === '') {
            this.getCard(lineIndex)?.customControls.fields.at(index)?.get('sort')?.setValue('asc');
        } else if (sort === 'asc') {
            this.getCard(lineIndex)?.customControls.fields.at(index)?.get('sort')?.setValue('desc');
        } else {
            this.getCard(lineIndex)?.customControls.fields.at(index)?.get('sort')?.setValue('');
        }
    }

    /** Adds a new empty card line if the limit has not been reached. */
    protected addLine() {
        if (this.cards.length < this.maxLine) {
            this.control.push(new ResultListCardLineFormGroup());
        }
    }

    /** Removes the card line at the given index. */
    protected deleteLine(lineIndex: number) {
        this.control.removeAt(lineIndex);
    }
}
