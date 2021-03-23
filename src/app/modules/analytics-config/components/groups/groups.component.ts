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
import { Component, OnInit, Input, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { moveInFormArray as moveItemInFormArray } from '@utils/tools';
import { MatDialog } from '@angular/material';
import { ConfigExportHelper } from '@services/main-form-manager/config-export-helper';
import { ContributorConfig } from '@services/main-form-manager/models-config';
import {
  ArlasStartupService,
  ArlasConfigService
} from 'arlas-wui-toolkit/services/startup/startup.service';

import { AnalyticsInitService } from '@analytics-config/services/analytics-init/analytics-init.service';
import { ConfirmModalComponent } from '@shared-components/confirm-modal/confirm-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { Subject } from 'rxjs/internal/Subject';
import { debounceTime } from 'rxjs/operators';
import { ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';
import { AnalyticsBoardComponent } from 'arlas-wui-toolkit/components/analytics-board/analytics-board.component';
import { ArlasColorService } from 'arlas-web-components/services/color.generator.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit, OnDestroy {

  @Input() public contentFg: FormGroup;
  @ViewChild('analyticsBoard', { static: false }) public analyticsBoard: AnalyticsBoardComponent;

  public updateDisplay: Subject<any> = new Subject<any>();

  public groupsPreview = [];

  private afterClosedSub: Subscription;

  constructor(
    private defaultValuesService: DefaultValuesService,
    public dialog: MatDialog,
    private arlasStartupService: ArlasStartupService,
    private configService: ArlasConfigService,
    private analyticsInitService: AnalyticsInitService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private colorService: ArlasColorGeneratorLoader,
    private cs: ArlasColorService,
    protected mainFormService: MainFormService,

  ) {}

  public ngOnInit() {
    this.analyticsInitService.initTabContent(this.contentFg);
    this.updateDisplay.pipe(
      debounceTime(200)
    ).subscribe(() => this.updateAnalytics());
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
        let currentContributors = this.configService.getValue('arlas.web.contributors') as Array<ContributorConfig>;
        if (currentContributors !== undefined) {
          this.groupsFa.at(gi).value.content.forEach(c => {
            if (c.widgetData && c.widgetData.dataStep) {
              const contributorId = ConfigExportHelper.getContributorId(c.widgetData, c.widgetType);
              // remove contributors from registry
              this.arlasStartupService.contributorRegistry.delete(contributorId);
              // remove contributors from config
              currentContributors = currentContributors.filter(config => config.identifier !== contributorId);
            }
          });
          // set new config
          const currentConfig = this.configService.getConfig() as any;
          currentConfig.arlas.web.contributors = currentContributors;
        }
        this.groupsFa.removeAt(gi);
        this.updateAnalytics();
      }
    });
  }

  get groupsFa() {
    return this.contentFg.get('groupsFa') as FormArray;
  }

  public updateAnalytics() {
    // get the keyToColors list to inject it in the ColorService used by the arlas-web-components
    this.cs.colorGenerator = this.colorService;
    const analytics = [];
    this.groupsPreview = [];
    this.cdr.detectChanges();
    this.groupsFa.value.forEach(group => {
      analytics.push(group.preview);
    });
    this.groupsPreview = analytics;
  }

  public drop(event: CdkDragDrop<string[]>) {
    moveItemInFormArray(event.previousIndex, event.currentIndex, this.groupsFa);
    this.updateAnalytics();
  }

  public ngOnDestroy() {
    if (this.afterClosedSub) { this.afterClosedSub.unsubscribe(); }
    if (this.updateDisplay) { this.updateDisplay.unsubscribe(); }
    // TODO: activate when toolkit updated
    // this.analyticsBoard.ngOnDestroy();
    this.analyticsBoard = null;
    this.groupsPreview = null;
    this.contentFg = null;
  }
}
