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
  ResultListVisualisationsDataGroupFilter
} from '@analytics-config/services/resultlist-form-builder/resultlist-form-builder';
import {
  ResultListVisualisationsFormGroup,
  ResultListVisualisationsDataGroup, ResultlistFormBuilderService
} from '@analytics-config/services/resultlist-form-builder/resultlist-form-builder.service';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { LowerCasePipe } from '@angular/common';
import { Component, inject, input, OnInit, output, signal, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormControl } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow,
  MatHeaderRowDef, MatRow, MatRowDef, MatTable
} from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { CollectionService } from '@services/collection-service/collection.service';
import { ConfigFormGroupComponent } from '@shared-components/config-form-group/config-form-group.component';
import { ConfigFormGroup } from '@shared-models/config-form';
import { SharedModule } from '@shared/shared.module';

@Component({
  selector: 'arlas-data-group-edition',
  standalone: true,
  imports: [
    LowerCasePipe,
    MatButton,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatIcon,
    MatRow,
    MatRowDef,
    MatTable,
    SharedModule,
    TranslateModule
  ],
  templateUrl: './data-group-edition.component.html',
  styleUrl: './data-group-edition.component.scss'
})
export class DataGroupEditionComponent implements OnInit{
  protected validate = output<boolean>();
  protected cancel = output<boolean>();
  protected displayedColumns = ['field', 'operator', 'value', 'actions'];
  private resultlistFormBuilder = inject(ResultlistFormBuilderService);
  public data = inject<{ edit: boolean; dataGroup: ResultListVisualisationsDataGroup;collectionControlName: string; }>(MAT_DIALOG_DATA);
  public collectionService = inject(CollectionService);
  @ViewChild(MatTable) protected table: MatTable<ResultListVisualisationsFormGroup>;
  public disabled = signal(true);


  public get filterConditions(): FormArray<ResultListVisualisationsDataGroup> | any[] {
    return this.data.dataGroup.controls.filters ?  (this.data.dataGroup.controls.filters as FormArray).controls : [];
  }

  public ngOnInit() {
    // TODO: IMPROVE !!
    setTimeout(() =>  {
      this.disabled.set(this.data.dataGroup.invalid);
    });
    this.data.dataGroup.statusChanges.subscribe(s => {
      this.disabled.set(s === 'INVALID');
    });
  }

  public removeCondition(index: number) {
    this.data.dataGroup.customControls.filters.removeAt(index);
    this.table.renderRows();
  }

  public addCondition() {
    const filter = this.resultlistFormBuilder
      .buildVisualisationsDataGroupFilter(this.data.collectionControlName);
    this.data.dataGroup.customControls.filters.insert(0, filter);
    this.table.renderRows();
  }

  public updateList(event: { prefix: string; }, index: number) {
    const control = this.data.dataGroup.customControls.filters.at(index).customControls;
    if (control.filterOperation.value === 'IN') {
      control.filterValues.filterInValues.setSyncOptions([]);
      this.collectionService.getTermAggregation(
        this.data.collectionControlName,
        control.filterField.value.value, true, undefined, event.prefix)
        .then(keywords => {
          control.filterValues.filterInValues.setSyncOptions(keywords.map(k => ({ value: k, label: k })));
        });
    }
  }

}
