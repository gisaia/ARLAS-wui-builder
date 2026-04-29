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
  MetricsTableFormBuilderService,
  SubTableColumnFormGroup,
  SubTableFormGroup
} from '@analytics-config/services/metrics-table-form-builder/metrics-table-form-builder.service';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, DestroyRef, forwardRef, inject, Inject, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormArray } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatError } from '@angular/material/select';
import { MatTable, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { marker } from '@colsen1991/ngx-translate-extract-marker';
import { TranslatePipe } from '@ngx-translate/core';
import { CollectionService } from '@services/collection-service/collection.service';
import { CollectionField } from '@services/collection-service/models';
import { NUMERIC_OR_DATE_TYPES } from '@services/collection-service/tools';
import { ConfigFormControlComponent } from '@shared-components/config-form-control/config-form-control.component';
import { ConfigFormGroupComponent } from '@shared-components/config-form-group/config-form-group.component';
import { SelectFormControl } from '@shared-models/config-form';
import { Metric } from 'arlas-api';

@Component({
  selector: 'arlas-add-subtable-dialog',
  templateUrl: './add-subtable-dialog.component.html',
  styleUrls: ['./add-subtable-dialog.component.scss'],
  imports: [
    TranslatePipe,
    forwardRef(() => ConfigFormGroupComponent),
    MatTableModule,
    DragDropModule,
    MatIconModule,
    MatButtonModule,
    forwardRef(() => ConfigFormControlComponent),
    MatError,
    MatDialogModule,
    MatTooltipModule
  ]
})
export class AddSubtableDialogComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  public formGroup: SubTableFormGroup;
  public defaultKey: string;
  @ViewChild('columnTable', { static: true }) public columnTable: MatTable<AbstractControl>;
  public dragDisabled = true;
  public displayedColumns: string[] = ['action', 'metric', 'field'];
  public title: string = marker('Add a sub table');
  public buttonLabel: string = marker('Add');

  public constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: {
      subTable: SubTableFormGroup;
      collection: string;
    },
    private readonly dialogRef: MatDialogRef<AddSubtableDialogComponent>,
    private readonly metricsTableFormBuilder: MetricsTableFormBuilderService,
    private readonly collectionService: CollectionService
  ) { }

  public ngOnInit(): void {
    const formBuilder = this.metricsTableFormBuilder;
    if (!!this.dialogData.subTable) {
      this.formGroup = this.dialogData.subTable;
      (this.formGroup.get('columns') as FormArray).controls.forEach(c => {
        this.initMetricCollectField(c as SubTableColumnFormGroup);
      });
      this.title = marker('Edit sub table');
      this.buttonLabel = marker('Edit');

    } else {
      this.formGroup = formBuilder.buildSubTable(this.dialogData.collection);
    }
    this.defaultKey = formBuilder.defaultKey;
    if (this.formGroup) {
      this.formGroup.get('collection').valueChanges.subscribe(v => {
        this.columns.clear();
        this.columnTable.renderRows();
      });
    }
  }

  public add(): void {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.valid) {
      this.dialogRef.close(this.formGroup);
    }
  }

  public addColumn() {
    const subTableColumn = this.metricsTableFormBuilder.buildSubTableColumn(this.collection);
    this.initMetricCollectField(subTableColumn);
    this.columns.push(subTableColumn);
    this.columnTable.renderRows();
  }

  private initMetricCollectField(subTableColumn: SubTableColumnFormGroup) {
    const control: SelectFormControl = subTableColumn.get('metricCollectField') as SelectFormControl;
    control.disable();
    if (control.value && control.value !== '') {
      control.enable();
      this.setMetricCollectFieldValues(control.value, control);
    }
    subTableColumn.get('metricCollectFunction').valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(v => {
        this.setMetricCollectFieldValues(v, control);
      });
  }

  private setMetricCollectFieldValues(v: any, control: SelectFormControl) {
    if (v && v !== 'count') {
      control.enable();
      const filterCallback = (field: CollectionField) => v === Metric.CollectFctEnum.CARDINALITY.toString().toLowerCase() ?
        field : NUMERIC_OR_DATE_TYPES.indexOf(field.type) >= 0;
      const sub = this.collectionService.getCollectionFields(this.collection).subscribe(
        fields => {
          control.setSyncOptions(
            fields
              .filter(filterCallback)
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(f => ({ value: f.name, label: f.name, enabled: f.indexed })));
          sub.unsubscribe();
        });
    } else {
      control.disable();
    }
  }

  public deleteColumn(colIndex: number) {
    (this.formGroup.get('columns') as FormArray).removeAt(colIndex);
    this.columnTable.renderRows();
  }

  public get columns() {
    return this.formGroup?.get('columns') as FormArray;
  }

  public get collection() {
    return this.formGroup?.get('collection').value;
  }

  public drop(event: CdkDragDrop<any[]>) {
    const previousIndex = this.columns.controls.findIndex(row => row === event.item.data);
    moveItemInArray(this.columns.controls, previousIndex, event.currentIndex);
    const newOrders = new Array(...this.columns.controls);
    newOrders.forEach((v, i) => {
      this.columns.setControl(i, v);
    });
    this.columnTable.renderRows();
  }

  public dragStarted(event) {
    this.dragDisabled = true;
  }
}
