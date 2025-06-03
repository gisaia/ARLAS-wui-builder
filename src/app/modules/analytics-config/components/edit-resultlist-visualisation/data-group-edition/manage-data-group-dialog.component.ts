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
  ResultlistFormBuilderService,
  ResultListVisualisationsDataGroup,
  ResultListVisualisationsFormGroup
} from '@analytics-config/services/resultlist-form-builder/resultlist-form-builder.service';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  output,
  signal,
  ViewChild,
  WritableSignal
} from '@angular/core';
import { FormArray } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatTable, MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { CollectionService } from '@services/collection-service/collection.service';
import { SharedModule } from '@shared/shared.module';
import { Expression } from 'arlas-api';

interface DataGroupDialogData {
    edit: boolean;
    dataGroup: ResultListVisualisationsDataGroup;
    collectionControlName: string;
}

@Component({
  selector: 'arlas-manage-data-group-dialog',
  standalone: true,
  imports: [
    MatButton,
    MatTableModule,
    MatIcon,
    SharedModule,
    TranslateModule
  ],
  templateUrl: './manage-data-group-dialog.component.html',
  styleUrl: './manage-data-group-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageDataGroupDialogComponent implements OnInit {
  protected validate = output<boolean>();
  protected cancel = output<boolean>();
  protected displayedColumns = ['field', 'operator', 'value', 'actions'];
  private readonly resultListFormBuilder = inject(ResultlistFormBuilderService);
  public data = inject<DataGroupDialogData>(MAT_DIALOG_DATA);
  public collectionService = inject(CollectionService);
  public disableButton: WritableSignal<boolean>;
  @ViewChild(MatTable) protected table: MatTable<ResultListVisualisationsFormGroup>;

  public get criteriaList(){
    return (this.data.dataGroup.get('filters')  as FormArray);
  }

  public get criteria(): FormArray<ResultListVisualisationsDataGroup> | any[] {
    return this.criteriaList ? this.criteriaList.controls : [];
  }

  public ngOnInit() {
    // init status of the button to avoid change detection errors

    this.disableButton = signal(this.data.dataGroup?.invalid);
    this.data.dataGroup?.statusChanges.subscribe(s => {
      this.disableButton.set(s === 'INVALID');
    });
  }

  public removeCriteria(index: number) {
    (this.data.dataGroup.get('filters')  as FormArray).removeAt(index);
    this.table.renderRows();
  }

  public addCriteria() {
    const criteria = this.resultListFormBuilder
      .buildVisualisationsDataGroupCriteria(this.data.collectionControlName);
    this.criteriaList?.push(criteria);
    this.criteriaList?.setErrors({ 'new condition': true });
    this.table.renderRows();
  }

  /**
     * update keyword list when inputs change
     * @param {{prefix: string}} event
     * @param {number} index
     */
  public updateList(event: { prefix: string; }, index: number) {
    const control = this.data.dataGroup.customControls.filters.at(index).customControls;
    if (control.filterOperation.value ===  Expression.OpEnum.Like) {
      control.filterValues.filterInValues.setSyncOptions([]);
      this.collectionService.getTermAggregation(
        this.data.collectionControlName,
        control.filterField.value.value, true, undefined, event.prefix)
        .then(keywords => {
          control.filterValues.filterInValues.setSyncOptions(keywords.map(k => ({value: k, label: k})));
        });
    }
  }
}
