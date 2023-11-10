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
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { EXPORT_TYPE } from '@services/main-form-manager/config-export-helper';
import { MainFormManagerService } from '@services/main-form-manager/main-form-manager.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { getNbErrorsInControl, isFullyTouched, Page } from '@utils/tools';
import {
  ArlasIamService, ArlasSettingsService, AuthentificationService,
  LinkSettings, PersistenceService, UserInfosComponent
} from 'arlas-wui-toolkit';
import { MenuService } from '@services/menu/menu.service';

@Component({
  selector: 'arlas-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.scss']
})
export class LeftMenuComponent implements OnInit {

  public isLabelDisplayed = false;
  public nbErrorsByPage: Map<string, number> = new Map();
  public showLogOutButton = false;
  public name: string;
  public avatar: string;
  public authentMode = 'false';

  public pages: Page[] = [];
  public links: LinkSettings[] = [];

  public constructor(
    private mainFormService: MainFormService,
    private mainFormManager: MainFormManagerService,
    private translate: TranslateService,
    public persistenceService: PersistenceService,
    private authService: AuthentificationService,
    private router: Router,
    private dialog: MatDialog,
    private settings: ArlasSettingsService,
    private menu: MenuService,
    private arlasIamService: ArlasIamService
  ) {
    // recompute nberrors of each page anytime the mainform validity changes
    this.mainFormService.mainForm.statusChanges.subscribe(st => this.updateNbErrors());

    const authSettings = this.settings.getAuthentSettings();
    const isAuthentActivated = !!authSettings && authSettings.use_authent;
    const isOpenID = isAuthentActivated && authSettings.auth_mode !== 'iam';
    const isIam = isAuthentActivated && authSettings.auth_mode === 'iam';
    if (isOpenID) {
      this.authentMode = 'openid';
    }
    if (isIam) {
      this.authentMode = 'iam';
    }

  }

  public ngOnInit() {
    this.links = this.settings.getLinksSettings();
    this.pages = this.menu.pages;
    if (this.authentMode === 'openid') {
      const claims = this.authService.identityClaims as any;
      this.authService.canActivateProtectedRoutes.subscribe(isAuthenticated => {
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
    if (this.authentMode === 'iam') {
      this.arlasIamService.tokenRefreshed$.subscribe({
        next: (loginData) => {
          if (!!loginData) {
            this.showLogOutButton = true;
            this.name = loginData?.user.email;
            this.avatar = this.getInitials(this.name);
          } else {
            this.name = '';
            this.avatar = '';
          }
        },
        error: () => {
          this.showLogOutButton = false;
        }
      });
    }
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

  public getInitials(name) {

    const canvas = document.createElement('canvas');
    canvas.style.display = 'none';
    canvas.width = 32;
    canvas.height = 32;
    document.body.appendChild(canvas);


    const context = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 16;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = '#999';
    context.fill();
    context.font = '16px Roboto';
    context.fillStyle = '#eee';

    if (name && name !== '') {
      const first = name[0];
      context.fillText(first.toUpperCase(), 10, 23);
      const data = canvas.toDataURL();
      document.body.removeChild(canvas);
      return data;
    } else {
      return '';
    }
  }
}
