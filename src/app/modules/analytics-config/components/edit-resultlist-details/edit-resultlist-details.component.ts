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
import { ResultlistDetailFormGroup } from '@analytics-config/services/resultlist-form-builder/form-group';
import { buildDetailField } from '@analytics-config/services/resultlist-form-builder/utils';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Component, inject, input, OnInit } from '@angular/core';
import { FormArray } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatError } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { CollectionService } from '@services/collection-service/collection.service';
import { ConfigFormControlComponent } from '@shared-components/config-form-control/config-form-control.component';
import { SelectFormControl } from '@shared-models/config-form';
import { moveInFormArray as moveItemInFormArray } from '@utils/tools';

@Component({
    selector: 'arlas-edit-resultlist-details',
    templateUrl: './edit-resultlist-details.component.html',
    styleUrls: ['./edit-resultlist-details.component.scss'],
    imports: [
      MatCardModule,
      ConfigFormControlComponent,
      MatIconModule,
      MatButtonModule,
      MatError,
      MatTooltipModule,
      TranslatePipe,
      DragDropModule
    ]
})
export class EditResultlistDetailsComponent implements OnInit {
  private readonly collectionService = inject(CollectionService);

  public control = input.required<FormArray<ResultlistDetailFormGroup>>();
  public collection = input.required<SelectFormControl>();

  public ngOnInit() {
    this.collection().valueChanges.subscribe(c => {
      this.control().clear();
    });
  }

  public addDetail() {
    this.control().push(new ResultlistDetailFormGroup());
  }

  public deleteDetail(detailIndex: number) {
    this.control().removeAt(detailIndex);
  }

  public deleteField(detailIndex: number, fieldIndex: number) {
    this.getDetail(detailIndex).customControls.fields.removeAt(fieldIndex);
  }

  public addField(detailIndex: number) {
    this.getDetail(detailIndex).customControls.fields.push(
      buildDetailField(this.collectionService, this.collection().value));
  }

  public get details() {
    return this.control().controls;
  }

  public getDetail = (detailIndex: number) => this.control().at(detailIndex);
  public getFields = (detailIndex: number) => this.getDetail(detailIndex).customControls.fields.controls;

  public drop = (event: CdkDragDrop<string[]>) => moveItemInFormArray(event.previousIndex, event.currentIndex, this.control());

}
