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
import { AfterViewInit, Component, DestroyRef, inject, Input, OnInit, ViewChild } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MultipleSelectFormControl } from '@shared-models/config-form';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReplaySubject, take } from 'rxjs';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { AsyncPipe } from '@angular/common';
import { ArlasColorService } from 'arlas-web-components';
import { CollectionService } from '@services/collection-service/collection.service';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
    selector: 'arlas-multi-select-search',
    imports: [
        MatFormField,
        MatSelect,
        MatOption,
        ReactiveFormsModule,
        TranslateModule,
        NgxMatSelectSearchModule,
        AsyncPipe,
        MatToolbarModule
    ],
    templateUrl: './multi-select-search.component.html',
    styleUrl: './multi-select-search.component.scss'
})
export class MultiSelectSearchComponent implements OnInit, AfterViewInit {
  @Input() public control: MultipleSelectFormControl;
  @Input() public defaultKey: string;
  @Input() public warningMessage: string;
  public selectSearchFilterFc = new FormControl();
  public selectMultiFc = new FormControl();
  private readonly _destroyRef = inject(DestroyRef);
  public filteredSyncOption = new ReplaySubject<any[]>(1);
  private readonly colorService = inject(ArlasColorService);
  private readonly collectionService = inject(CollectionService);
  @ViewChild('multiSelect', { static: true }) public multiSelect: MatSelect;

  public ngOnInit() {
    // updates the input if the value of another input with which it is linked changes
    this.control?.syncOptionsUpdated
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(_ => {
        if(this.control.syncOptions.length === 0 && this.control.selectedMultipleItems.length === 0){
          this.selectMultiFc.disable();
          this.selectMultiFc.setValue([]);
          this.filteredSyncOption.next([]);
        } else {
          this.selectMultiFc.enable();
          this.filteredSyncOption.next(this.control.syncOptions.slice());
        }
      });

    if(this.control?.syncOptions.length === 0 && this.control.selectedMultipleItems.length === 0){
      this.selectMultiFc.disable();
    }
    // retrieve selected value for the input
    this.selectMultiFc.setValue(this.control?.selectedMultipleItems.slice());
    this.filteredSyncOption.next(this.control?.syncOptions.slice() ?? []);
    this.selectSearchFilterFc.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((v) => {
        this.filterData();
      });

    this.selectMultiFc?.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((v) => {
        this.updateFcValue(v);
      });
  }

  public ngAfterViewInit() {
    this.setInitialValue();
  }


  protected filterData(){
    const search = this.selectSearchFilterFc.value;
    const result = search
      ? this.control.syncOptions.filter(option => option.value.toLowerCase().includes(search.toLowerCase()))
      : this.control.syncOptions.slice();
    this.filteredSyncOption.next(result);
  }


  protected setInitialValue() {
    this.filteredSyncOption?.pipe(take(1), takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this.multiSelect.compareWith = (a: any, b: any) => a && b && a.value === b.value;
      });
  }

  public updateFcValue(value: {value: string; label: string;}[]) {
    this.control.savedItems = new Set<string>(value.map(i => i.value));
    this.control.selectedMultipleItems = Array.from(this.control.savedItems)
      .filter(i =>  i !== undefined && i !== null)
      .map(i => ({ value: i, color: this.colorService.getColor(i), detail: this.collectionService.getCollectionInterval(i) }));
    this.control.setValue([...this.control.selectedMultipleItems]);
  }
}
