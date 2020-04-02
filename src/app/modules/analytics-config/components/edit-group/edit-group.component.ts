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
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { COMPONENT_TYPE } from './models';

@Component({
  selector: 'app-edit-group',
  templateUrl: './edit-group.component.html',
  styleUrls: ['./edit-group.component.scss']
})
export class EditGroupComponent implements OnInit {

  @Input() public formGroup: FormGroup;
  @Output() public remove = new EventEmitter();

  public contentTypes = [
    [COMPONENT_TYPE.histogram],
    [COMPONENT_TYPE.donut],
    [COMPONENT_TYPE.powerbar],
    [COMPONENT_TYPE.resultlist],
    [COMPONENT_TYPE.metric],
    [COMPONENT_TYPE.swimlane],
    [COMPONENT_TYPE.metric, COMPONENT_TYPE.metric],
    [COMPONENT_TYPE.donut, COMPONENT_TYPE.powerbar],
    [COMPONENT_TYPE.donut, COMPONENT_TYPE.swimlane],
    [COMPONENT_TYPE.histogram, COMPONENT_TYPE.histogram],
    [COMPONENT_TYPE.powerbar, COMPONENT_TYPE.powerbar],
    [COMPONENT_TYPE.metric, COMPONENT_TYPE.metric, COMPONENT_TYPE.metric],
    [COMPONENT_TYPE.powerbar, COMPONENT_TYPE.powerbar, COMPONENT_TYPE.powerbar]
  ];
  public getContentTypes = (nbComponents: number) => this.contentTypes.filter(elmt => elmt.length === nbComponents);

  constructor(
    private formBuilder: FormBuilder
  ) { }

  public ngOnInit() {
  }

  public editComponent(componentIndex: number) {
    this.contentType.forEach(t => {
      // create the FG related to each component
      (this.formGroup.controls.content as FormArray).push(this.formBuilder.group({
        componentType: [t],
        component: this.formBuilder.group({})
      }));
    });
  }

  get contentType() {
    return this.formGroup.controls.contentType.value as Array<string>;
  }

}
