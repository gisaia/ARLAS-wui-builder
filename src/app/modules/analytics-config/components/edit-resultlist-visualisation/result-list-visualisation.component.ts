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
  ManageVisualisationComponent
} from '@analytics-config/components/edit-resultlist-visualisation/manage-visualisation/manage-visualisation.component';

import {
  ResultlistFormBuilderService,
  ResultListVisualisationsFormGroup
} from '@analytics-config/services/resultlist-form-builder/resultlist-form-builder.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, inject, Input, signal, ViewChild } from '@angular/core';
import { FormArray } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTable } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { SelectFormControl } from '@shared-models/config-form';
import { SharedModule } from '@shared/shared.module';

@Component({
    selector: 'arlas-edit-resultlist-visualisation',
    imports: [
        TranslateModule,
        MatButton,
        MatIcon,
        SharedModule,
        ManageVisualisationComponent
    ],
    templateUrl: './result-list-visualisation.component.html',
    styleUrl: './result-list-visualisation.component.scss',
    animations: [
        trigger('openClose', [
            transition(':enter', [style({ opacity: 0 }), animate('200ms', style({ opacity: 1 }))]),
            transition(':leave', [animate('200ms', style({ opacity: 0 }))]),
        ])
    ]
})
export class ResultListVisualisationComponent {

  @Input() public collectionControl: SelectFormControl;
  @Input() public control: FormArray<ResultListVisualisationsFormGroup>;
  /** helper to create new form **/
  private readonly resultListFormBuilder = inject(ResultlistFormBuilderService);
  /** disable drag when dropping an element **/
  public dragDisabled = true;
  /** handle the switch between visualisation list and edit **/
  public manageViewIsOpened = false;
  public isEdition = signal(false);
  /** store the current visualisation edited or created **/
  public currentVisualisation: ResultListVisualisationsFormGroup = null;
  public displayedColumns = ['drag', 'name', 'description', 'applyTo', 'action'];
  @ViewChild(MatTable) protected table: MatTable<ResultListVisualisationsFormGroup>;

  public get visualisation(): ResultListVisualisationsFormGroup[] {
    return this.control? this.control.controls as Array<ResultListVisualisationsFormGroup> : [];
  }

  public dropVisualisation(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.control.controls, event.previousIndex, event.currentIndex);
    this.table.renderRows();
    this.dragDisabled = true;
  }

  public addVisualisation() {
    this.manageViewIsOpened = true;
    const newVisualisation = this.resultListFormBuilder.buildVisualisation();
    newVisualisation.customControls.name.setValue('New Visualisation name');
    this.currentVisualisation = newVisualisation;
  }

  /**
   * Launch when we create a new visualisation
   * add the new visualisation to the existing list
   * @param {boolean} $event
   */
  public manageVisualisationValidated($event: boolean) {
    this.manageViewIsOpened = false;
    if(!this.isEdition()){
      this.control.push(this.currentVisualisation);
      this.currentVisualisation = null;
      setTimeout(() => {
        this.table.renderRows();
      }, 0);

    }
    this.isEdition.set(false);
  }

  public manageVisualisationCanceled($event: boolean) {
    this.manageViewIsOpened = false;
    this.isEdition.set(false);
    this.currentVisualisation = null;
  }

  public removeVisualisation(visualisationIndex: number) {
    this.control.removeAt(visualisationIndex);
    this.table.renderRows();
  }

  public openManageVisualisationForEdition(visualisationIndex: any) {
    this.isEdition.set(true);
    this.manageViewIsOpened = true;
    this.currentVisualisation = this.control.at(visualisationIndex);
  }
}
