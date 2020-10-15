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
import {
  Component, OnInit, Input, Output, EventEmitter,
  ChangeDetectorRef
} from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { WIDGET_TYPE } from './models';
import { MatDialog } from '@angular/material';
import { EditWidgetDialogComponent } from '../edit-widget-dialog/edit-widget-dialog.component';
import { EditWidgetDialogData } from '../edit-widget-dialog/models';
import { AnalyticsInitService } from '@analytics-config/services/analytics-init/analytics-init.service';
import { OperationEnum } from 'arlas-web-core';
import { ConfigExportHelper } from '@services/main-form-manager/config-export-helper';
import { MatDialogRef } from '@angular/material/dialog';
import { ConfirmModalComponent } from '@shared-components/confirm-modal/confirm-modal.component';
import { Subject } from 'rxjs/internal/Subject';

@Component({
  selector: 'app-add-widget-dialog',
  templateUrl: './edit-group-add-widget.component.html',
  styleUrls: ['./edit-group-add-widget.component.scss']
})
export class AddWidgetDialogComponent {
  public widgetType: Array<string> = [];

  public contentTypes: { label: WIDGET_TYPE, icon: string }[] = [
    { label: WIDGET_TYPE.histogram, icon: 'bar_chart' },
    { label: WIDGET_TYPE.donut, icon: 'donut_small' },
    { label: WIDGET_TYPE.powerbars, icon: 'sort' },
    { label: WIDGET_TYPE.resultlist, icon: 'table_chart' },
    { label: WIDGET_TYPE.metric, icon: 'functions' },
    { label: WIDGET_TYPE.swimlane, icon: 'waves' }
  ];
  constructor(
    public dialogRef: MatDialogRef<AddWidgetDialogComponent>
  ) { }

  public cancel(): void {
    this.dialogRef.close();
  }

  public pressEvent(event: KeyboardEvent) {
    if (event.code === 'Enter' && this.widgetType) {
      this.dialogRef.close(this.widgetType);
    }
  }
}

@Component({
  selector: 'app-edit-group',
  templateUrl: './edit-group.component.html',
  styleUrls: ['./edit-group.component.scss']
})
export class EditGroupComponent implements OnInit {

  @Input() public formGroup: FormGroup;
  @Input() public updateDisplay: Subject<any>;
  @Output() public remove = new EventEmitter();

  public content: FormArray;

  constructor(
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private analyticsInitService: AnalyticsInitService
  ) { }

  public ngOnInit() {
    this.content = this.formGroup.controls.content as FormArray;
    this.resetWidgetsOnTypeChange();
  }
  /**
   * on content type change, re-create the formgroup for each widget to define
   */
  private resetWidgetsOnTypeChange() {
    this.contentType.valueChanges.subscribe(values => {
      // if a widget is removed
      if (this.contentTypeValue.length < this.content.length) {
        this.content.removeAt(this.content.length - 1);
      } else {
        // if a new widget is added
        values.forEach((v, i) => {
          if (i === this.content.length) {
            this.content.push(this.analyticsInitService.initNewWidget(v));
          }
        });
      }
    });
  }

  public addWidget() {
    this.dialog.open(AddWidgetDialogComponent, { width: '350px' })
      .afterClosed().subscribe(result => {
        if (result) {
          // add the new widget to the previous ones if they exist
          if (!!this.contentTypeValue) {
            this.contentTypeValue.push(result);
          }
          const finalResult = this.contentTypeValue ? this.contentTypeValue : [result];
          this.formGroup.controls.contentType.setValue(finalResult);
          this.editWidget(this.contentTypeValue.length - 1, true);
        }
      });
  }

  public editWidget(widgetIndex: number, newWidget?: boolean) {
    const widgetFg = this.content.get(widgetIndex.toString()) as FormGroup;
    this.dialog.open(EditWidgetDialogComponent, {
      data: {
        widgetType: widgetFg.value.widgetType,
        formData: widgetFg.value.widgetData
      } as EditWidgetDialogData
    })
      .afterClosed().subscribe(result => {
        if (result) {
          widgetFg.setControl('widgetData', result);
          const contrib = this.analyticsInitService.createContributor(
            widgetFg.value.widgetType,
            widgetFg.value.widgetData,
            this.formGroup.controls.icon.value
          );
          this.updatePreview();
          contrib.updateFromCollaboration({
            id: '',
            operation: OperationEnum.add,
            all: false
          });
          this.cdr.detectChanges();
        } else {
          if (newWidget) {
            // delete a new created widget after clicking on cancel
            this.content.removeAt(this.content.length - 1);
            this.contentTypeValue.pop();
            this.formGroup.controls.contentType.setValue(this.contentTypeValue);
          }
        }
      });
  }

  public deleteWidget(widgetIndex: number) {
    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      width: '400px',
      data: { message: 'delete the widget' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.content.removeAt(widgetIndex);
        this.contentTypeValue.splice(widgetIndex, 1);
        this.formGroup.controls.contentType.setValue(this.contentTypeValue);
        this.updatePreview();
      }
    });
  }

  public onIconPickerSelect(icon: string): void {
    this.formGroup.controls.icon.setValue(icon);
    this.updatePreview();
  }

  public updatePreview() {
    this.formGroup.controls.preview.setValue(null);

    this.formGroup.controls.preview.setValue(
      ConfigExportHelper.getAnalyticsGroup('preview', this.formGroup.value, this.analyticsInitService.groupIndex++)
    );
    this.updateDisplay.next();


  }

  get contentType() {
    return this.formGroup.controls.contentType;
  }

  get contentTypeValue() {
    return this.formGroup.controls.contentType.value as Array<string>;
  }
}


