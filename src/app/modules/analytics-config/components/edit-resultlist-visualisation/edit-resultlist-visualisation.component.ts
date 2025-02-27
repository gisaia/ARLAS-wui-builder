import { Component, inject, Input, OnInit } from '@angular/core';
import { ConfigFormControl, SelectFormControl } from '@shared-models/config-form';
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
  }

  public dropItemFamily(event: CdkDragDrop<any[]>, index: number){
    const previousIndex = (this.control.controls[index].get('itemsFamilies') as FormArray).controls.findIndex(row => row === event.item.data);
    moveItemInArray(this.control.controls, previousIndex, event.currentIndex);
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
