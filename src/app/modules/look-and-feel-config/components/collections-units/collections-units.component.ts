import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray } from '@angular/forms';

@Component({
  selector: 'app-collections-units',
  templateUrl: './collections-units.component.html',
  styleUrls: ['./collections-units.component.scss']
})
export class CollectionsUnitsComponent implements OnInit {

  @Input() public collections: string[];
  @Input() public unitsArray: FormArray;
  constructor() { }

  public ngOnInit() {

  }

  public drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.unitsArray.value, event.previousIndex, event.currentIndex);
    this.unitsArray.setValue(this.unitsArray.value);
  }

}
