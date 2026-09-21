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
  SubTableColumnFormGroup, SubTableFormGroup
} from '@analytics-config/services/metrics-table-form-builder/metrics-table-form-builder.service';
import { CdkDragDrop, CdkDragStart, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatError } from '@angular/material/select';
import { MatTable, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { MainFormService } from '@services/main-form/main-form.service';
import { Metric as ArlasApiMetric } from 'arlas-api';
import { GetCollectionDisplayNamePipe, GetFieldDisplayNamePipe } from 'arlas-web-components';
import { MetricsTableSortConfig } from 'arlas-web-contributors/models/metrics-table.config';
import { Subject } from 'rxjs';
import { AddSubtableDialogComponent } from '../add-subtable-dialog/add-subtable-dialog.component';

@Component({
  selector: 'arlas-metrics-table-data',
  templateUrl: './metrics-table-data.component.html',
  styleUrls: ['./metrics-table-data.component.scss'],
  imports: [
    MatAccordion,
    MatExpansionModule,
    TranslatePipe,
    MatTableModule,
    DragDropModule,
    MatIconModule,
    GetCollectionDisplayNamePipe,
    MatTooltipModule,
    GetFieldDisplayNamePipe,
    MatMenuModule,
    MatError,
    MatButtonModule
  ]
})
export class MetricsTableDataComponent implements OnInit {

  @Input() public control = new FormArray<SubTableFormGroup>([]);
  @Input() public collection: string;
  @Input() public displaySchema = true;
  @Output() public sort = new Subject<any>();
  @ViewChild('subTables', { static: true }) public subTables?: MatTable<SubTableFormGroup>;

  public dragDisabled = true;
  public displayedColumns: string[] = ['drag', 'collection', 'field', 'columns', 'actions'];
  private metricsTableSortConfig: MetricsTableSortConfig | undefined;

  public constructor(private readonly dialog: MatDialog, private readonly main: MainFormService) { }

  public ngOnInit(): void {
    if (!this.collection) {
      this.collection = this.main.getMainCollection();
    }
  }

  public addSubtable() {
    this.dialog.open(AddSubtableDialogComponent, {
      width: '1200px', data: {
        collection: this.collection
      }
    })
      .afterClosed().subscribe(result => {
        if (result) {
          this.control.push(result);
          this.displaySchema = false;
          setTimeout(() => this.subTables?.renderRows(), 100);
        }
      });
  }

  public dragStarted(event: CdkDragStart) {
    this.dragDisabled = true;
  }

  public drop(event: CdkDragDrop<any[]>) {
    const previousIndex = this.control.controls.findIndex(row => row === event.item.data);
    moveItemInArray(this.control.controls, previousIndex, event.currentIndex);
    const newOrders = new Array(...this.control.controls);
    newOrders.forEach((v, i) => {
      this.control.setControl(i, v);
    });
    this.subTables?.renderRows();
  }

  public editSubTable(index: number, collection: string) {
    this.dialog.open(AddSubtableDialogComponent, {
      width: '1200px', data: {
        collection: collection,
        subTable: this.control.at(index)
      }
    })
      .afterClosed().subscribe(result => {
        if (result) {
          this.control.removeAt(index);
          this.control.insert(index, result);
          setTimeout(() => this.subTables?.renderRows(), 100);
        }
      });

  }

  public deleteSubTable(index: number) {
    this.control.removeAt(index);
    this.subTables?.renderRows();
    if (this.control.length === 0) {
      this.displaySchema = true;
    }
  }

  public setSort(column: SubTableColumnFormGroup, sort: 'asc' | 'desc' | '',
    collection: string, termfield: string, metric: ArlasApiMetric.CollectFctEnum | 'count', field: string
  ) {
    this.control.controls.forEach(subTable => {
      subTable.customControls.columns.controls.forEach(c => {
        c.customControls.sort.setValue('');
      });
    });

    let sortToSet = 'asc';
    if (sort === '') {
      column.customControls.sort.setValue('asc');
    } else if (sort === 'asc') {
      column.customControls.sort.setValue('desc');
      sortToSet = 'desc';
    } else {
      column.customControls.sort.setValue('');
      sortToSet = '';
    }
    if (!!field) {
      this.metricsTableSortConfig = {
        collection,
        termfield,
        order: sortToSet as any,
        on: 'metric',
        metric: {
          field,
          metric
        }
      };
    } else {
      this.metricsTableSortConfig = {
        collection,
        termfield,
        order: sortToSet as any,
        on: 'count'
      };
    }
    this.sort.next(this.metricsTableSortConfig);
  }
}
