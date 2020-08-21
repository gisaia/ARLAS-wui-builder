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
import { Component } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MainFormService } from '@services/main-form/main-form.service';
import { getNbErrorsInControl, isFullyTouched } from '@utils/tools';
import { MainFormManagerService } from '@services/main-form-manager/main-form-manager.service';
import { EXPORT_TYPE } from '@services/main-form-manager/config-export-helper';
import { AuthentificationService } from 'arlas-wui-toolkit/services/authentification/authentification.service';
import { Router } from '@angular/router';
import { PersistenceService } from 'arlas-wui-toolkit/services/persistence/persistence.service';
import { MatDialog } from '@angular/material/dialog';
import { UserInfosComponent } from 'arlas-wui-toolkit/components/user-infos/user-infos.component';

interface Page {
  link: string;
  name: string;
  icon: string;
  tooltip: string;
  enabled: boolean;
  control?: AbstractControl;
}

@Component({
  selector: 'app-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.scss']
})
export class LeftMenuComponent {

  public isLabelDisplayed = true;
  public nbErrorsByPage: Map<string, number> = new Map();
  public showLogOutButton: boolean;
  public name: string;
  public avatar: string;

  constructor(
    private mainFormService: MainFormService,
    private mainFormManager: MainFormManagerService,
    private translate: TranslateService,
    public persistenceService: PersistenceService,
    private authService: AuthentificationService,
    private router: Router,
    private dialog: MatDialog
  ) {
    // recompute nberrors of each page anytime the mainform validity changes
    this.mainFormService.mainForm.statusChanges.subscribe(st => this.updateNbErrors());
    this.showLogOutButton = !!this.authService.authConfigValue && !!this.authService.authConfigValue.use_authent;
    const claims = this.authService.identityClaims as any;
    this.authService.canActivateProtectedRoutes.subscribe(isAuthenticated => {
      // show login button when authentication is enabled in settings.yaml file && the app is not authenticated
      this.showLogOutButton = !!this.authService.authConfigValue && !!this.authService.authConfigValue.use_authent && isAuthenticated;
      if (isAuthenticated) {
        this.name = claims.nickname;
        this.avatar = claims.picture;
      } else {
        this.name = '';
        this.avatar = '';
      }

    });
  }

  public pages: Page[] = [
    {
      name: 'Map',
      link: '/map-config',
      icon: 'map',
      tooltip: this.translate.instant('Map configuration'),
      enabled: true,
      control: this.mainFormService.mapConfig.control
    },
    {
      name: 'Timeline',
      link: '/timeline-config',
      icon: 'timeline',
      tooltip: this.translate.instant('Timeline configuration'),
      enabled: true,
      control: this.mainFormService.timelineConfig.control
    },
    {
      name: 'Search',
      link: '/search-config',
      icon: 'search',
      tooltip: this.translate.instant('Search configuration'),
      enabled: true,
      control: this.mainFormService.searchConfig.control
    },
    {
      name: 'Analytics',
      link: '/analytics-config',
      icon: 'bar_chart',
      tooltip: this.translate.instant('Analytics configuration'),
      enabled: true,
      control: this.mainFormService.analyticsConfig.control
    },
    {
      name: 'Side Modules',
      link: '/side-modules',
      icon: 'view_column',
      tooltip: this.translate.instant('Side modules configuration'),
      enabled: true,
      control: this.mainFormService.sideModulesConfig.control
    },
    {
      name: 'Look \'n feel',
      link: '/look-and-feel',
      icon: 'opacity',
      tooltip: this.translate.instant('Look \'n fell configuration'),
      enabled: true,
      control: this.mainFormService.lookAndFeelConfig.control
    },
  ];

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

  public logout() {
    this.authService.logout();
    this.router.navigate([''], { queryParamsHandling: 'preserve' });

  }

  public expand() {
    this.isLabelDisplayed = !this.isLabelDisplayed;
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }

  public getUserInfos() {
    this.dialog.open(UserInfosComponent);
  }
}
