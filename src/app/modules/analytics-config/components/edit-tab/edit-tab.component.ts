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
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AnalyticsTabs } from 'arlas-wui-toolkit';
import { MatSelectChange } from '@angular/material/select';

export enum TAB_DISPLAY_MODE {
  BOTH = 'both',
  TEXT = 'text',
  ICON = 'icon'
}

@Component({
  selector: 'arlas-edit-tab',
  templateUrl: './edit-tab.component.html',
  styleUrls: ['./edit-tab.component.scss']
})
export class EditTabComponent implements OnInit {

  public tabForm = new FormGroup({
    icon: new FormControl(false, Validators.required),
    name: new FormControl(false, Validators.required),
    showName: new FormControl(),
    showIcon: new FormControl(),
    display: new FormControl()
  });

  public constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: AnalyticsTabs,
  ) {
    this.tabForm.get('icon').setValue(dialogData.icon);
    this.tabForm.get('name').setValue(dialogData.name);
    this.tabForm.get('showName').setValue(dialogData.showName);
    this.tabForm.get('showIcon').setValue(dialogData.showIcon);
    if (dialogData.showName && dialogData.showIcon) {
      this.tabForm.get('display').setValue(TAB_DISPLAY_MODE.BOTH);
    } else if (dialogData.showName && !dialogData.showIcon) {
      this.tabForm.get('display').setValue(TAB_DISPLAY_MODE.TEXT);
    } else if (!dialogData.showName && dialogData.showIcon) {
      this.tabForm.get('display').setValue(TAB_DISPLAY_MODE.ICON);
    }
  }

  public ngOnInit(): void {

  }

  public displayChange(event: MatSelectChange): void {
    switch (event.value) {
      case TAB_DISPLAY_MODE.BOTH:
        this.tabForm.get('showName').setValue(true);
        this.tabForm.get('showIcon').setValue(true);
        break;
      case TAB_DISPLAY_MODE.TEXT:
        this.tabForm.get('showName').setValue(true);
        this.tabForm.get('showIcon').setValue(false);
        break;
      case TAB_DISPLAY_MODE.ICON:
        this.tabForm.get('showName').setValue(false);
        this.tabForm.get('showIcon').setValue(true);
        break;
    }
  }

  public onIconPickerSelect(icon): void {
    this.tabForm.get('icon').setValue(icon);
  }

}
