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
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { TranslateService } from '@ngx-translate/core';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { ConfirmModalComponent } from '@shared-components/confirm-modal/confirm-modal.component';
import { WidgetConfigFormGroup } from '@shared-models/widget-config-form';
import { moveInFormArray as moveItemInFormArray } from '@utils/tools';
import { ArlasColorService } from 'arlas-web-components';
import { AnalyticsBoardComponent, AnalyticsService } from 'arlas-wui-toolkit';
import { Subscription } from 'rxjs';
import { Subject } from 'rxjs/internal/Subject';
import { debounceTime } from 'rxjs/operators';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';


@Component({
  selector: 'arlas-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit, OnDestroy {

  @Input() public contentFg: FormGroup;
  @ViewChild('analyticsBoard', { static: false }) public analyticsBoard: AnalyticsBoardComponent;

  public updateDisplay: Subject<any> = new Subject<any>();

  public groupsPreview = [];

  private afterClosedSub: Subscription;

  public spinnerColor: string;
  public spinnerDiameter: number;
  public showSpinner: boolean;
  public constructor(
    private defaultValuesService: DefaultValuesService,
    public dialog: MatDialog,
    private analyticsInitService: AnalyticsInitService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private cs: ArlasColorService,
    private shortcutsService: ShortcutsService,
    protected mainFormService: MainFormService,
    private analyticsService: AnalyticsService

  ) { }

  public ngOnInit() {
    this.analyticsInitService.initTabContent(this.contentFg);
    this.updateDisplay.pipe(
      debounceTime(200)
    ).subscribe(() => this.updateAnalytics());
    this.spinnerColor = this.mainFormService.lookAndFeelConfig?.control.value.LookAndFeelConfigGlobal.spinnerColor;
    this.spinnerDiameter = this.mainFormService.lookAndFeelConfig?.control.value.LookAndFeelConfigGlobal.spinnerDiameter;
    this.showSpinner = this.mainFormService.lookAndFeelConfig?.control.value.LookAndFeelConfigGlobal.spinner;
  }

  public addGroup() {
    this.groupsFa.push(this.analyticsInitService.initNewGroup(
      this.translate.instant(
        this.defaultValuesService.getValue('analytics.groups.new'))
    )
    );
  }

  public getGroup = (index: number) => this.groupsFa.at(index) as FormGroup;


  public remove(gi) {
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
    return !!this.contentFg ? this.contentFg.get('groupsFa') as FormArray : null;
  }

  public updateAnalytics() {
    const analytics = [];
    this.groupsPreview = [];
    this.cdr.detectChanges();
    this.groupsFa?.value.forEach(group => {
      analytics.push(group.preview);
    });
    this.analyticsService.initializeGroups(analytics);
    this.groupsPreview = analytics;
    this.analyticsService.selectTab(0);


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

    this.analyticsBoard = null;
    this.groupsPreview = null;
    this.contentFg = null;
  }

  private removeAllShortcuts(groupIndex: number) {
    const group = this.getGroup(groupIndex);
    const widgetsFa: FormArray = group.controls.content as FormArray;
    if (widgetsFa) {
      widgetsFa.controls.forEach((widget: FormGroup) => {
        const widgetConfigFg = widget.controls.widgetData as WidgetConfigFormGroup;
        this.shortcutsService.removeShortcut(widgetConfigFg.uuidControl.value);
      });
    }
  }
}
