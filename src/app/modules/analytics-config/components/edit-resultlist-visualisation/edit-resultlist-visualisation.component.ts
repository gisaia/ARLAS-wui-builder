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
import { Component, inject, Input } from '@angular/core';
import { SelectFormControl } from '@shared-models/config-form';
import { FormArray } from '@angular/forms';
import {
  ResultlistFormBuilderService,
  ResultListVisualisationsFormGroup
} from '@analytics-config/services/resultlist-form-builder/resultlist-form-builder.service';
import { CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { SharedModule } from '@shared/shared.module';
import {
  CastToConfigFormGroupPipe,
  CastVisualisationItemFamilyPipe
} from '@shared/pipes/cast-visualisation-item-family.pipe';

@Component({
  selector: 'arlas-edit-resultlist-visualisation',
  standalone: true,
  imports: [
    TranslateModule,
    CdkDropList,
    MatButton,
    MatIcon,
    MatIconButton,
    MatTooltip,
    SharedModule,
    CastVisualisationItemFamilyPipe,
    CastVisualisationItemFamilyPipe,
    CastToConfigFormGroupPipe
  ],
  templateUrl: './edit-resultlist-visualisation.component.html',
  styleUrl: './edit-resultlist-visualisation.component.scss'
})
export class EditResultlistVisualisationComponent {

  @Input() public collectionControl: SelectFormControl;
  @Input() public control: FormArray<ResultListVisualisationsFormGroup>;
  private resultlistFormBuilder = inject(ResultlistFormBuilderService);
  public dragDisabled = true;
  public ItemFamilyDragDisabled = true;


  public get visualisation(): ResultListVisualisationsFormGroup[] {
    return this.control? this.control.controls as Array<ResultListVisualisationsFormGroup> : [];
  }

  public constructor() { }

  public removeVisualisation(quicklookIndex: number) {
    this.control.removeAt(quicklookIndex);
  }

  public dropVisualisation(event: CdkDragDrop<any[]>) {
    const previousIndex = this.control.controls.findIndex(row => row === event.item.data);
    moveItemInArray(this.control.controls, previousIndex, event.currentIndex);
    this.dragDisabled = true;
  }

  public dropItemFamily(event: CdkDragDrop<any[]>, index: number){
    const previousIndex = (this.control.controls[index].get('itemsFamilies') as FormArray).controls.findIndex(row => row === event.item.data);
    console.log(event, previousIndex);
    moveItemInArray((this.control.controls[index].get('itemsFamilies') as FormArray).controls, previousIndex, event.currentIndex);
    this.ItemFamilyDragDisabled = true;
  }

  public removeItemFamily(index: number, itemIndex: number) {
    (this.control.controls[index].get('itemsFamilies') as FormArray).removeAt(itemIndex);
  }

  public addVisualisation() {
    this.control.push(this.resultlistFormBuilder.buildVisualisation());
  }

  public addItemFamily(index: number) {
    (this.control.controls[index].get('itemsFamilies') as FormArray).push(
      this.resultlistFormBuilder.buildVisualisationsItemFamily(this.collectionControl.value)
    );
  }
}
