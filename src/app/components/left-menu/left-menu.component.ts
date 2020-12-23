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
import { Component, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MainFormService } from '@services/main-form/main-form.service';
import { getNbErrorsInControl, isFullyTouched, Page } from '@utils/tools';
import { MainFormManagerService } from '@services/main-form-manager/main-form-manager.service';
import { EXPORT_TYPE } from '@services/main-form-manager/config-export-helper';
import { AuthentificationService } from 'arlas-wui-toolkit/services/authentification/authentification.service';
import { Router } from '@angular/router';
import { PersistenceService } from 'arlas-wui-toolkit/services/persistence/persistence.service';
import { MatDialog } from '@angular/material/dialog';
import { UserInfosComponent } from 'arlas-wui-toolkit/components/user-infos/user-infos.component';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { LinkSettings } from 'arlas-wui-toolkit/services/startup/startup.service';
import { ArlasSettingsService } from 'arlas-wui-toolkit/services/settings/arlas.settings.service';
import { MenuService } from '../../services/menu/menu.service';

@Component({
  selector: 'app-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.scss']
})
export class LeftMenuComponent implements OnInit {

  public isLabelDisplayed = false;
  public nbErrorsByPage: Map<string, number> = new Map();
  public showLogOutButton: boolean;
  public name: string;
  public avatar: string;

  public pages: Page[] = [];
  public links: LinkSettings[] = [];

  constructor(
    private mainFormService: MainFormService,
    private mainFormManager: MainFormManagerService,
    private translate: TranslateService,
    public persistenceService: PersistenceService,
    private authService: AuthentificationService,
    private router: Router,
    private dialog: MatDialog,
    private settings: ArlasSettingsService,
    private menu: MenuService
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

  public ngOnInit() {
    this.links = this.settings.getLinksSettings();
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
