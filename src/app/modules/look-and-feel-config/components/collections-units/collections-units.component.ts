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
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray } from '@angular/forms';
import { SlideToggleFormControl } from '@shared-models/config-form';

@Component({
  selector: 'arlas-collections-units',
  templateUrl: './collections-units.component.html',
  styleUrls: ['./collections-units.component.scss']
})
export class CollectionsUnitsComponent implements OnInit {

  @Input() public collections: string[];
  @Input() public unitsArray: FormArray;

  public constructor() { }

  public ngOnInit() {

  }

  public drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.unitsArray.value, event.previousIndex, event.currentIndex);
    this.unitsArray.setValue(this.unitsArray.value);
  }


  public hide(c: SlideToggleFormControl): void {
    c.setValue(true);
  }

  public display(c: SlideToggleFormControl): void {
    c.setValue(false);
  }


}
