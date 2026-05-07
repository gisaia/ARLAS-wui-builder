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
import { Component, OnInit } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { EXPORT_TYPE } from '@services/main-form-manager/config-export-helper';
import { MainFormManagerService } from '@services/main-form-manager/main-form-manager.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { MenuService } from '@services/menu/menu.service';
import { getNbErrorsInControl, isFullyTouched, Page } from '@utils/tools';
import { PersistenceService } from 'arlas-wui-toolkit';

@Component({
  selector: 'arlas-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.scss'],
  imports: [
    MatListModule,
    MatTooltipModule,
    RouterLinkActive,
    TranslatePipe,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    RouterLink
  ]
})
export class LeftMenuComponent implements OnInit {

  public isLabelDisplayed = false;
  public nbErrorsByPage: Map<string, number> = new Map();

  public pages: Page[] = [];

  public constructor(
    private readonly mainFormService: MainFormService,
    private readonly mainFormManager: MainFormManagerService,
    public readonly persistenceService: PersistenceService,
    private readonly menu: MenuService
  ) {
    // recompute nberrors of each page anytime the mainform validity changes
    this.mainFormService.mainForm.statusChanges.subscribe(st => this.updateNbErrors());
  }

  public ngOnInit() {
    this.pages = this.menu.pages;
  }

  public navigateTo(url: string) {
    window.open(url);
  }

  private updateNbErrors() {
    this.nbErrorsByPage.clear();
    this.pages
      .filter(p => !!p.control && p.control.invalid && isFullyTouched(p.control))
      .forEach(p =>
        this.nbErrorsByPage.set(p.name, getNbErrorsInControl(p.control))
      );
  }

  public save(event) {
    if (this.persistenceService.isAvailable) {
      this.mainFormManager.attemptExport(EXPORT_TYPE.persistence);
      this.updateNbErrors();
    } else {
      event.stopPropagation();
    }
  }

  public export() {
    this.mainFormManager.attemptExport(EXPORT_TYPE.json);
    this.updateNbErrors();
  }

  public expand() {
    this.isLabelDisplayed = !this.isLabelDisplayed;
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }
}
