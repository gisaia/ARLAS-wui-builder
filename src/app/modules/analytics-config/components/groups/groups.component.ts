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
import { AnalyticsInitService } from '@analytics-config/services/analytics-init/analytics-init.service';
import { ShortcutsService } from '@analytics-config/services/shortcuts/shortcuts.service';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { AfterViewInit, ChangeDetectorRef, Component, input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatError } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { marker } from '@colsen1991/ngx-translate-extract-marker';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { ConfigExportHelper } from '@services/main-form-manager/config-export-helper';
import { MainFormService } from '@services/main-form/main-form.service';
import { ConfirmModalComponent } from '@shared-components/confirm-modal/confirm-modal.component';
import { WidgetConfigFormGroup } from '@shared-models/widget-config-form';
import { moveInFormArray as moveItemInFormArray } from '@utils/tools';
import { AnalyticGroupConfiguration, AnalyticsBoardComponent, AnalyticsService } from 'arlas-wui-toolkit';
import { Subscription } from 'rxjs';
import { Subject } from 'rxjs/internal/Subject';
import { debounceTime } from 'rxjs/operators';
import { EditGroupComponent } from '../edit-group/edit-group.component';


@Component({
  selector: 'arlas-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatError,
    TranslatePipe,
    DragDropModule,
    MatTooltipModule,
    MatIconModule,
    MatButtonModule,
    EditGroupComponent,
    AnalyticsBoardComponent
  ]
})
export class GroupsComponent implements OnInit, OnDestroy, AfterViewInit {

  public contentFg = input.required<FormGroup>();

  public updateDisplay: Subject<any> = new Subject<any>();

  public groupsPreview = new Array<AnalyticGroupConfiguration>();

  private afterClosedSub?: Subscription;

  public spinnerColor: string;
  public spinnerDiameter: number;
  public showSpinner: boolean;

  public constructor(
    private readonly defaultValuesService: DefaultValuesService,
    private readonly dialog: MatDialog,
    private readonly analyticsInitService: AnalyticsInitService,
    private readonly translate: TranslateService,
    private readonly cdr: ChangeDetectorRef,
    private readonly shortcutsService: ShortcutsService,
    protected readonly mainFormService: MainFormService,
    private readonly analyticsService: AnalyticsService
  ) { }

  public ngOnInit() {
    this.analyticsInitService.initTabContent(this.contentFg());
    this.updateDisplay.pipe(
      debounceTime(200)
    ).subscribe(() => this.updateAnalytics());
    this.spinnerColor = this.mainFormService.lookAndFeelConfig?.control.value.LookAndFeelConfigGlobal.spinnerColor;
    this.spinnerDiameter = this.mainFormService.lookAndFeelConfig?.control.value.LookAndFeelConfigGlobal.spinnerDiameter;
    this.showSpinner = this.mainFormService.lookAndFeelConfig?.control.value.LookAndFeelConfigGlobal.spinner;
  }

  public ngAfterViewInit() {
    this.updateAnalytics();
  }

  public addGroup() {
    this.groupsFa.push(this.analyticsInitService.initNewGroup(
      this.translate.instant(
        this.defaultValuesService.getValue('analytics.groups.new'))
    )
    );
  }

  public getGroup = (index: number) => this.groupsFa.at(index) as FormGroup;


  public remove(gi: number) {
    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      width: '400px',
      data: { message: marker('Do you really want to delete this group?') }
    });

    this.afterClosedSub = dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.removeAllShortcuts(gi);
        this.groupsFa.removeAt(gi);
        this.updateAnalytics();
      }
    });
  }

  public get groupsFa() {
    return this.contentFg().get('groupsFa') as FormArray<FormGroup>;
  }

  public updateAnalytics() {
    this.groupsPreview = [];
    this.groupsFa?.value.forEach(group => {
      this.groupsPreview.push(ConfigExportHelper.getAnalyticsGroup('preview',
        group,
        this.analyticsInitService.groupIndex++,
        this.mainFormService.lookAndFeelConfig.getGlobalFg()));
    });
    this.analyticsService.initializeGroups(this.groupsPreview);
    this.analyticsService.selectTab(0);
    this.cdr.detectChanges();
  }

  public drop(event: CdkDragDrop<string[]>) {
    moveItemInFormArray(event.previousIndex, event.currentIndex, this.groupsFa);
    this.updateAnalytics();
  }

  public ngOnDestroy() {
    if (this.afterClosedSub) {
      this.afterClosedSub.unsubscribe();
    }
    if (this.updateDisplay) {
      this.updateDisplay.unsubscribe();
    }
  }

  private removeAllShortcuts(groupIndex: number) {
    const group = this.getGroup(groupIndex);
    const widgetsFa = group.controls.content as FormArray<FormGroup>;
    if (widgetsFa) {
      widgetsFa.controls.forEach(widget => {
        const widgetConfigFg = widget.controls.widgetData as WidgetConfigFormGroup;
        this.shortcutsService.removeShortcut(widgetConfigFg.uuidControl.value);
      });
    }
  }
}
