import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray } from '@angular/forms';
// tslint:disable-next-line: max-line-length
import { CollectionUnitFormGroup } from '@look-and-feel-config/services/look-and-feel-global-form-builder/look-and-feel-global-form-builder.service';
import { SlideToggleFormControl } from '@shared-models/config-form';

@Component({
  selector: 'app-collections-units',
  templateUrl: './collections-units.component.html',
  styleUrls: ['./collections-units.component.scss']
})
export class CollectionsUnitsComponent implements OnInit {

  @Input() public collections: string[];
  @Input() public unitsArray: FormArray;

  public showTitle = false;
  constructor() { }

  public ngOnInit() {
    this.showTitle = this.unitsArray.controls.filter((c: CollectionUnitFormGroup) => c.customControls.ignored.value).length > 0;

  }

  public drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.unitsArray.value, event.previousIndex, event.currentIndex);
    this.unitsArray.setValue(this.unitsArray.value);
  }


  public hide(c: SlideToggleFormControl): void {
    c.setValue(true);
    this.showTitle = this.unitsArray.controls.filter((cu: CollectionUnitFormGroup) => cu.customControls.ignored.value).length > 0;
  }

  public display(c: SlideToggleFormControl): void {
    c.setValue(false);
    this.showTitle = this.unitsArray.controls.filter((cu: CollectionUnitFormGroup) => cu.customControls.ignored.value).length > 0;
  }


}
