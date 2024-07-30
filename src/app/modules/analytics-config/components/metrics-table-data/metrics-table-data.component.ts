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
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray } from '@angular/forms';
import { Subject } from 'rxjs';
import { AddSubtableDialogComponent } from '../add-subtable-dialog/add-subtable-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MetricsTableSortConfig } from '@services/main-form-manager/models-config';
import { MainFormService } from '@services/main-form/main-form.service';

@Component({
  selector: 'arlas-metrics-table-data',
  templateUrl: './metrics-table-data.component.html',
  styleUrls: ['./metrics-table-data.component.scss']
})
export class MetricsTableDataComponent implements OnInit {

  @Input() public control: FormArray = new FormArray([]);
  @Input() public collection: string;
  @Input() public displaySchema = true;
  @Output() public sort = new Subject<any>();
  @ViewChild('subTables', { static: true }) public subTables;

  public dragDisabled = true;
  public displayedColumns: string[] = ['drag', 'collection', 'field', 'columns', 'actions'];
  private metricsTableSortConfig: MetricsTableSortConfig = {};

  public constructor(private dialog: MatDialog, private main: MainFormService,

  ) { }



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
          setTimeout(() => this.subTables.renderRows(), 100);
        }
      });
  }

  public dragStarted(event) {
    this.dragDisabled = true;
  }
  public drop(event: CdkDragDrop<any[]>) {
    const previousIndex = this.control.controls.findIndex(row => row === event.item.data);
    moveItemInArray(this.control.controls, previousIndex, event.currentIndex);
    const newOrders = new Array(...this.control.controls);
    newOrders.forEach((v, i) => {
      this.control.setControl(i, v);
    });
    this.subTables.renderRows();
  }

  public editSubTable(index, collection) {
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
          setTimeout(() => this.subTables.renderRows(), 100);
        }
      });

  }

  public deleteSubTable(index) {
    this.control.removeAt(index);
    this.subTables.renderRows();
    if (this.control.length === 0) {
      this.displaySchema = true;
    }
  }

  public setSort(column, sort, collection, termfield, metric, field) {
    this.control.controls.forEach(subTable => {
      (subTable as any).controls.columns.controls.forEach(c => {
        c.get('sort').setValue('');
      });
    });

    let sortToSet = 'asc';
    if (sort === '') {
      column.get('sort').setValue('asc');
    } else if (sort === 'asc') {
      column.get('sort').setValue('desc');
      sortToSet = 'desc';
    } else {
      column.get('sort').setValue('');
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
