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
import {DragDropModule} from '@angular/cdk/drag-drop';
import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {FormArray} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatError} from '@angular/material/select';
import {MatTableModule} from '@angular/material/table';
import {MatTooltipModule} from '@angular/material/tooltip';
import {TranslatePipe} from '@ngx-translate/core';
import {ConfigFormControlComponent} from '@shared-components/config-form-control/config-form-control.component';
import {SelectFormControl} from '@shared-models/config-form';
import {EditResultListComponent} from '@analytics-config/components/edit-resultlist-columns/edit-result-list-abstract';

@Component({
  selector: 'arlas-edit-hybrid-resultlist-columns',
  templateUrl: './edit-hybrid-resultlist-columns.component.html',
  styleUrls: ['./edit-hybrid-resultlist-columns.component.scss'],
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
export class EditHybridResultlistColumnsComponent extends EditResultListComponent implements OnInit {
  @Input() public control: FormArray;
  @Input() public collection: SelectFormControl;
  @ViewChild('columnTable', { static: true }) public columnTable;
  public displayedColumns: string[] = ['action', 'name', 'field', 'unit', 'process', 'title', 'icon'];

  public addColumn(collection: string) {
    this.control.push(this.resultlistFormBuilder.buildHybridColumn(collection));
    this.columnTable.renderRows();
  }
}
