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
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { marker } from '@colsen1991/ngx-translate-extract-marker';
import { CollectionService } from '@services/collection-service/collection.service';
import { CollectionField } from '@services/collection-service/models';
import { NUMERIC_OR_DATE_TYPES } from '@services/collection-service/tools';
import { SelectFormControl } from '@shared-models/config-form';
import { Metric } from 'arlas-api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'arlas-add-subtable-dialog',
  templateUrl: './add-subtable-dialog.component.html',
  styleUrls: ['./add-subtable-dialog.component.scss']
})
export class AddSubtableDialogComponent implements OnInit, OnDestroy {
  public formGroup: SubTableFormGroup;
  public defaultKey: string;
  @ViewChild('columnTable', { static: true }) public columnTable;
  public dragDisabled = true;
  public displayedColumns: string[] = ['action', 'metric', 'field'];
  public title: string = marker('Add a sub table');
  public buttonLabel: string = marker('Add');

  private metricCollectFunctionValuesChangeSub: Subscription;
  private collectionValuesChangeSub: Subscription;

  public constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: {
      subTable: SubTableFormGroup;
      collection: string;
    },
    public dialogRef: MatDialogRef<AddSubtableDialogComponent>,
    private metricsTableFormBuilder: MetricsTableFormBuilderService,
    private collectionService: CollectionService
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
    this.metricCollectFunctionValuesChangeSub = subTableColumn.get('metricCollectFunction').valueChanges.subscribe(v => {
      this.setMetricCollectFieldValues(v, control);

    });
  }

  private setMetricCollectFieldValues(v: any, control: SelectFormControl) {
    if (v && v !== 'count') {
      control.enable();
      const filterCallback = (field: CollectionField) => v === Metric.CollectFctEnum.CARDINALITY ?
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

  public ngOnDestroy(): void {
    if (!!this.metricCollectFunctionValuesChangeSub) {
      this.metricCollectFunctionValuesChangeSub.unsubscribe();
    }
    if (!!this.collectionValuesChangeSub) {
      this.collectionValuesChangeSub.unsubscribe();
    }
  }
}
