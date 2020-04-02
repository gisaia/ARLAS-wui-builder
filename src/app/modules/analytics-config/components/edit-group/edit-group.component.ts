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
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { WIDGET_TYPE as WIDGET_TYPE } from './models';
import { MatDialog } from '@angular/material';
import { WidgetHistogramComponent } from '../widget-histogram/widget-histogram.component';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-edit-group',
  templateUrl: './edit-group.component.html',
  styleUrls: ['./edit-group.component.scss']
})
export class EditGroupComponent implements OnInit {

  @Input() public formGroup: FormGroup;
  @Output() public remove = new EventEmitter();

  public contentTypes = [
    [WIDGET_TYPE.histogram],
    [WIDGET_TYPE.donut],
    [WIDGET_TYPE.powerbar],
    [WIDGET_TYPE.resultlist],
    [WIDGET_TYPE.metric],
    [WIDGET_TYPE.swimlane],
    [WIDGET_TYPE.metric, WIDGET_TYPE.metric],
    [WIDGET_TYPE.donut, WIDGET_TYPE.powerbar],
    [WIDGET_TYPE.donut, WIDGET_TYPE.swimlane],
    [WIDGET_TYPE.histogram, WIDGET_TYPE.histogram],
    [WIDGET_TYPE.powerbar, WIDGET_TYPE.powerbar],
    [WIDGET_TYPE.metric, WIDGET_TYPE.metric, WIDGET_TYPE.metric],
    [WIDGET_TYPE.powerbar, WIDGET_TYPE.powerbar, WIDGET_TYPE.powerbar]
  ];
  public getContentTypes = (nbWidgets: number) => this.contentTypes.filter(elmt => elmt.length === nbWidgets);

  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private logger: NGXLogger
  ) { }

  public ngOnInit() {

    this.resetWidgetsOnTypeChange();
  }

  /**
   * on content type change, re-create the formgroup for each widget to define
   */
  private resetWidgetsOnTypeChange() {
    this.contentType.valueChanges.subscribe(values => {
      this.content.clear();
      values.forEach(v => this.content.push(this.formBuilder.group({
        widgetType: [v],
        widgetData: new FormGroup({}, (fg: FormGroup) => ({ validateWidget: { valid: !!fg.controls.length } }))
      })));
    });
  }

  public editWidget(widgetIndex: number) {

    const widgetFg = this.content.get(widgetIndex.toString()) as FormGroup;
    let widgetComponent: any;

    switch (widgetFg.value.widgetType) {
      case WIDGET_TYPE.histogram:
        widgetComponent = WidgetHistogramComponent;
        break;
    }

    this.dialog.open(widgetComponent, {
      data: widgetFg.value.widgetData
    })
      .afterClosed().subscribe(result => {
        if (result) {
          widgetFg.setControl('widgetData', result);
        }
      });
  }

  get contentType() {
    return this.formGroup.controls.contentType;
  }

  get contentTypeValue() {
    return this.formGroup.controls.contentType.value as Array<string>;
  }

  get content() {
    return this.formGroup.controls.content as FormArray;
  }

}
