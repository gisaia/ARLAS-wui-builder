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

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit {

  @Input() public contentFg: FormGroup;

  constructor(
    public dialog: MatDialog,
    private arlasStartupService: ArlasStartupService,
    private configService: ArlasConfigService,
    private analyticsInitService: AnalyticsInitService,
    private translate: TranslateService
  ) {
  }

  public ngOnInit() {
    this.analyticsInitService.initTabContent(this.contentFg);
  }

  public addGroup() {
    this.groupsFa.push(this.analyticsInitService.initNewGroup());
  }

  public remove(gi) {
    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      width: '400px',
      data: { message: this.translate.instant('delete this group') }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let currentContributors = this.configService.getValue('arlas.web.contributors') as Array<ContributorConfig>;
        if (currentContributors !== undefined) {
          this.groupsFa.at(gi).value.content.forEach(c => {
            if (c.widgetData && c.widgetData.dataStep) {
              const contributorId = ConfigExportHelper.toSnakeCase(c.widgetData.dataStep.name);
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
      }
    });
  }

  get groupsFa() {
    return this.contentFg.get('groupsFa') as FormArray;
  }

  public drop(event: CdkDragDrop<string[]>) {
    moveItemInFormArray(event.previousIndex, event.currentIndex, this.groupsFa);
  }
}
