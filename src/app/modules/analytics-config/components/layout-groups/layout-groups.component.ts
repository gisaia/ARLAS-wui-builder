/*
Licensed to Gisaïa under one or more contributor
license agreements. See the NOTICE.txt file distributed with
this work for additional information regarding copyright
ownership. Gisaïa licenses this file to you under
the Apache License, Version 2.0 (the "License"); you may
not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/
import { Component, OnInit, Input } from '@angular/core';
import { FormArray, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { moveInFormArray as moveItemInFormArray } from '@utils/tools';

@Component({
  selector: 'app-layout-groups',
  templateUrl: './layout-groups.component.html',
  styleUrls: ['./layout-groups.component.scss']
})
export class LayoutGroupsComponent implements OnInit {

  @Input() public contentFg: FormGroup;
  public contentTypes = new Map([
    [
      'With single component',
      ['histogram', 'donut', 'powerbar', 'resultlist', 'metric', 'swimlane']
    ],
    [
      'With paired components',
      ['metric / metric', 'donut / powerbar', 'donut / swimlane', 'histogram / histogram', 'powerbar / powerbar']
    ],
    [
      'With more components',
      ['metric / metric / metric', 'powerbar / powerbar / powerbar']
    ]
  ]);
  // to be used by the view to keep original contentTypes order
  public unsorted = () => 0;

  constructor(
    private formBuilder: FormBuilder
  ) {
  }

  public ngOnInit() {
    this.contentFg.addControl('groupsFa', this.formBuilder.array(
      [],
      Validators.required
    ));
  }

  public addGroup() {
    const newGroupFg = this.formBuilder.group({
      icon: [
        null,
        Validators.required
      ],
      title: [
        null,
        Validators.required
      ],
      contentType: [
        null,
        Validators.required
      ],
      content: [
        null,
        Validators.required
      ]
    });
    this.groupsFa.push(newGroupFg);
  }

  get groupsFa() {
    return this.contentFg.get('groupsFa') as FormArray;
  }

  public getGroup = (index: number) => this.groupsFa.at(index) as FormGroup;

  public drop(event: CdkDragDrop<string[]>) {
    moveItemInFormArray(event.previousIndex, event.currentIndex, this.groupsFa);
  }

}
