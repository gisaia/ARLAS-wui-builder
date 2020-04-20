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
import { Component, OnInit, Inject, ViewChild, Injector, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatStepper } from '@angular/material';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { HistogramFormBuilderService } from '../../services/histogram-form-builder/histogram-form-builder.service';
import { WidgetFormBuilder } from '../../services/widget-form-builder';
import { SwimlaneFormBuilderService } from '../../services/swimlane-form-builder/swimlane-form-builder.service';
import { EditWidgetDialogData } from './models';
import { WIDGET_TYPE } from '../edit-group/models';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-edit-widget-dialog',
  templateUrl: './edit-widget-dialog.component.html',
  styleUrls: ['./edit-widget-dialog.component.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true }
    }
  ]
})
export class EditWidgetDialogComponent implements OnInit {

  @ViewChild('stepper', { static: false }) private stepper: MatStepper;
  public formGroup: FormGroup;
  public defaultKey: string;

  constructor(
    public dialogRef: MatDialogRef<EditWidgetDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: EditWidgetDialogData,
    private histogramBuilder: HistogramFormBuilderService,
    private swimlaneBuilder: SwimlaneFormBuilderService
  ) {

    this.initFormGroup();
  }

  private initFormGroup() {
    let formBuilder: WidgetFormBuilder;
    switch (this.dialogData.widgetType) {
      case WIDGET_TYPE.histogram:
        formBuilder = this.histogramBuilder;
        break;
      case WIDGET_TYPE.swimlane:
        formBuilder = this.swimlaneBuilder;
        break;
    }

    this.formGroup = formBuilder.build();
    this.formGroup.patchValue(this.dialogData.formData);
    this.defaultKey = formBuilder.defaultKey;
  }

  public ngOnInit() {

    this.dialogRef.disableClose = true;
    this.dialogRef.updateSize('1200px');
  }

  public save() {
    this.formGroup.markAllAsTouched();
    this.stepper.steps.setDirty();
    this.stepper.steps.forEach(s => s.interacted = true);
    if (this.formGroup.valid) {
      this.dialogRef.close(this.formGroup);
    }
  }

}

