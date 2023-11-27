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
import { AnalyticsInitService } from '@analytics-config/services/analytics-init/analytics-init.service';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { ConfigExportHelper } from '@services/main-form-manager/config-export-helper';
import { ContributorConfig } from '@services/main-form-manager/models-config';
import { MainFormService } from '@services/main-form/main-form.service';
import { ConfirmModalComponent } from '@shared-components/confirm-modal/confirm-modal.component';
import { moveInFormArray as moveItemInFormArray } from '@utils/tools';
import { ArlasColorService } from 'arlas-web-components';
import { AnalyticsBoardComponent, ArlasConfigService, ArlasStartupService } from 'arlas-wui-toolkit';
import { Subscription } from 'rxjs';
import { Subject } from 'rxjs/internal/Subject';
import { debounceTime } from 'rxjs/operators';


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
    private arlasStartupService: ArlasStartupService,
    private configService: ArlasConfigService,
    private analyticsInitService: AnalyticsInitService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
    protected mainFormService: MainFormService,

  ) {}

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

  public remove(gi) {
    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      width: '400px',
      data: { message: 'delete this group' }
    });

    this.afterClosedSub = dialogRef.afterClosed().subscribe(result => {
      if (result) {
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
    this.groupsPreview = analytics;
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
    // TODO: activate when toolkit updated
    // this.analyticsBoard.ngOnDestroy();
    this.analyticsBoard = null;
    this.groupsPreview = null;
    this.contentFg = null;
  }
}
