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
  ResultListVisualisationsFormGroup,
  ResultListVisualisationsItemFamily
} from '@analytics-config/services/resultlist-form-builder/resultlist-form-builder.service';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, input, output } from '@angular/core';
import { FormArray } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/shared.module';

@Component({
  selector: 'arlas-manage-visualisation',
  standalone: true,
  imports: [
    TranslateModule,
    SharedModule
  ],
  templateUrl: './manage-visualisation.component.html',
  styleUrl: './manage-visualisation.component.scss',

})
export class ManageVisualisationComponent {
  protected visualisation = input<ResultListVisualisationsFormGroup>();
  protected isEdition = input<boolean>();
  protected validate = output<boolean>();
  protected cancel = output<boolean>();
  protected displayedColumns = ['drag', 'dataGroup', 'protocol', 'visualisationUrl', 'conditions', 'actions'];
  public dragDisabled = true;

  public get groupItem(): FormArray<ResultListVisualisationsItemFamily> | any[] {
    return this.visualisation().customControls.dataGroups ?  this.visualisation().customControls.dataGroups.value  : [];
  }

  public validateVisualisation(){
    this.validate.emit(true);
  }
  public cancelVisualisation(){
    this.cancel.emit(true);
  }

  public dropItemFamily(event: CdkDragDrop<any[]>, index: number){
  /*  const previousIndex = (this.control.controls[index].get('itemsFamilies') as FormArray).controls.findIndex(row => row === event.item.data);
    moveItemInArray((this.control.controls[index].get('itemsFamilies') as FormArray).controls, previousIndex, event.currentIndex);
    this.ItemFamilyDragDisabled = true;*/
  }

  public removeItemFamily(index: number, itemIndex: number) {
    // (this.control.controls[index].get('itemsFamilies') as FormArray).removeAt(itemIndex);
  }

  public addItemFamily(index: number) {
  /*  (this.control.controls[index].get('itemsFamilies') as FormArray).push(
      this.resultlistFormBuilder.buildVisualisationsItemFamily(this.collectionControl.value)
    );*/
  }

}
