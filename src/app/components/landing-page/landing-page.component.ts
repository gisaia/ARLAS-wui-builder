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
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Config } from '@services/main-form-manager/models-config';
import { MapConfig } from '@services/main-form-manager/models-map-config';
import { MainFormService } from '@services/main-form/main-form.service';
import { MenuService } from '@services/menu/menu.service';
import { StartingConfigFormBuilderService } from '@services/starting-config-form-builder/starting-config-form-builder.service';
import { StartupService, ZONE_WUI_BUILDER } from '@services/startup/startup.service';
import { UserOrgData } from 'arlas-iam-api';
import { DataWithLinks } from 'arlas-persistence-api';
import {
  ArlasAuthentificationService, ArlasCollectionService, ArlasIamService, ArlasSettingsService, AuthentificationService, ConfigAction,
  ConfigActionEnum, ErrorService, PermissionService, PersistenceService, UserInfosComponent
} from 'arlas-wui-toolkit';
import { Resource } from 'arlas-permissions-api';
import { NGXLogger } from 'ngx-logger';
import { Subscription, zip } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';
import { LandingPageDialogComponent } from './landing-page-dialog.component';
import { InitialChoice, LandingPageService } from '@services/landing-page/landing-page.service';
import { ResourcesConfigFormBuilderService } from '@services/resources-form-builder/resources-config-form-builder.service';
import { CollectionService } from '@services/collection-service/collection.service';

export interface Configuration {
  name: string;
  last_update_date: any;
  actions: Array<ConfigAction>;
}

@Component({
  selector: 'arlas-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit, AfterViewInit, OnDestroy {

  public dialogRef: MatDialogRef<LandingPageDialogComponent>;
  public displayedColumns: string[] = ['id', 'creation', 'detail'];

  private confId = '-1';

  public configurations: Configuration[] = [];
  public configurationsLength = 0;
  public configPageNumber = 0;
  public configPageSize = 5;
  public configChoice;
  public availablesCollections: string[];
  public InitialChoice = InitialChoice;

  public authentMode = 'false';

  public isAuthenticated = false;
  public isAuthentActivated = false;
  public orgs: UserOrgData[] = [];
  public currentOrga = '';

  public canCreateForCurrentOrg = false; // Whether the buttons to CREATE / IMPORT a dashboard are displayed

  private subscription: Subscription;
  private refreshSubscription: Subscription;
  public constructor(
    public startupService: StartupService,
    public persistenceService: PersistenceService,
    private permissionService: PermissionService,
    public mainFormService: MainFormService,
    private startingConfigFormBuilder: StartingConfigFormBuilderService,
    private resourcesConfigFormBuilder: ResourcesConfigFormBuilderService,
    private arlasAuthentService: ArlasAuthentificationService,
    private dialog: MatDialog,
    private authService: AuthentificationService,
    private errorService: ErrorService,
    private settingsService: ArlasSettingsService,
    private arlasIamService: ArlasIamService,
    private logger: NGXLogger,
    private router: Router,
    private translate: TranslateService,
    private activatedRoute: ActivatedRoute,
    private menu: MenuService,
    private collectionService: CollectionService,
    private arlasCollectionService: ArlasCollectionService,

    private landingPageService: LandingPageService) {

    this.authentMode = !!this.settingsService.getAuthentSettings() ? this.settingsService.getAuthentSettings().auth_mode : undefined;
    this.isAuthentActivated = !!this.settingsService.getAuthentSettings() && !!this.settingsService.getAuthentSettings().use_authent;
    if (this.isAuthentActivated && !this.authentMode) {
      this.authentMode = 'openid';
    }
  }

  public ngOnInit(): void {
    // Reset and clean the content of all forms
    this.mainFormService.resetMainForm();

    // Reset current config id
    this.mainFormService.configurationId = undefined;
    if (this.mainFormService.configChange) {
      this.mainFormService.configChange.next({ id: undefined, name: undefined });
    }

    this.mainFormService.startingConfig?.init(
      this.startingConfigFormBuilder.build()
    );
    this.mainFormService.resourcesConfig?.init(
      this.resourcesConfigFormBuilder.build()
    );
    if (this.activatedRoute.snapshot.paramMap.has('id')) {
      this.confId = this.activatedRoute.snapshot.paramMap.get('id');
      this.loadConfig(this.confId);
    } else if (!!this.activatedRoute.snapshot.routeConfig && this.activatedRoute.snapshot.routeConfig.path === 'import') {
      this.configChoice = InitialChoice.load;
      this.openChoice(this.configChoice);
    } else {
      if (
        this.persistenceService.isAvailable
        && (!this.arlasAuthentService.authConfigValue || !this.arlasAuthentService.authConfigValue.use_authent)
      ) {
        this.getConfigList();
      }
    }
    if (this.authentMode === 'openid') {
      const claims = this.authService.identityClaims as any;
      this.subscription = this.authService.canActivateProtectedRoutes.subscribe(isAuthenticated => {
        this.isAuthenticated = isAuthenticated;
        if (this.persistenceService.isAvailable) {
          this.permissionService.get('persist/resource/').subscribe({
            next: (resources: Resource[]) => {
              this.canCreateForCurrentOrg = resources.filter(r => r.verb === 'POST').length > 0;
              this.getConfigList();
            }
          });
        }
      });
    } else if (this.authentMode === 'iam') {
      this.refreshSubscription = this.arlasIamService.tokenRefreshed$.subscribe({
        next: (loginData) => {
          if (!!loginData) {

            this.isAuthenticated = true;
            this.orgs = loginData.user.organisations.map(org => {
              org.displayName = org.name === loginData.user.id ? loginData.user.email.split('@')[0] : org.name;
              return org;
            });
            this.currentOrga = this.arlasIamService.getOrganisation();
          } else {
            this.isAuthenticated = false;
          }
          if (this.persistenceService.isAvailable) {
            this.checkUserRightsForOrg(this.currentOrga);
          }
        },
        error: () => {
          this.isAuthenticated = false;
        }
      });
    }
    // if persistence is configured and anonymous mode is enabled, we fetch the configuration accessible as anonymous
    // if ARLAS-persistence doesn't allow anonymous access, a suitable error is displayed in a modal

    this.subscription = this.landingPageService.startEvent$.subscribe((b) => {
      this.menu.updatePagesStatus(true);
      this.router.navigate(['map-config'], { queryParamsHandling: 'preserve' });
      this.logger.info(this.translate.instant('Ready to access server'));
    });
  }

  public openChoice(configChoice?) {
    this.configChoice = configChoice;
    if (configChoice) {
      this.dialogRef = this.dialog.open(LandingPageDialogComponent, {
        disableClose: true, data:
          { message: this.confId, configChoice, authentMode: this.authentMode,
            currentOrga: this.currentOrga, isAuthentActivated: this.isAuthentActivated }
      });
    }
  }

  public ngAfterViewInit() {
    // the set timeout is a hack to display dialog after 'callback' redirection. Otherwise the dialog is not opened in that case.
    // https://stackoverflow.com/questions/779379/why-is-settimeoutfn-0-sometimes-useful
    setTimeout(() => this.openChoice(), 0);
  }

  public afterAction(event: ConfigAction) {
    if (event.type === ConfigActionEnum.EDIT) {
      this.loadConfig(event.config.id);
    } else {
      this.getConfigList();
    }
  }

  public computeData(data: DataWithLinks): Configuration {
    const actions: Array<ConfigAction> = new Array();
    const config = {
      id: data.id,
      name: data.doc_key,
      value: data.doc_value,
      readers: data.doc_readers,
      writers: data.doc_writers,
      lastUpdate: +data.last_update_date,
      zone: data.doc_zone,
      org: this.arlasIamService.getOrganisation(),
      displayPublic: false
    };
    actions.push({
      config,
      configIdParam: 'config_id',
      type: ConfigActionEnum.VIEW,
      enabled: data.updatable
    });
    actions.push({
      config,
      type: ConfigActionEnum.EDIT,
      enabled: data.updatable
    });
    actions.push({
      config,
      type: ConfigActionEnum.RENAME,
      name: data.doc_key,
      enabled: data.updatable
    });
    actions.push({
      config,
      type: ConfigActionEnum.DUPLICATE,
      name: data.doc_key,
      enabled: data.updatable

    });
    actions.push({
      config,
      type: ConfigActionEnum.SHARE,
      enabled: data.updatable

    });
    actions.push({
      config,
      type: ConfigActionEnum.DELETE,
      enabled: data.updatable
    });


    return {
      name: data.doc_key,
      last_update_date: data.last_update_date,
      actions
    };

  }

  public getConfigList() {
    this.persistenceService.list(ZONE_WUI_BUILDER, this.configPageSize, this.configPageNumber + 1, 'desc')
      .pipe(
        map(data => {
          if (data.data !== undefined) {
            return [data.total, data.data.map(d => this.computeData(d))];
          } else {
            return [data.total, []];
          }
        }))
      .subscribe({
        next: (result) => {
          this.configurationsLength = result[0] as number;
          this.configurations = result[1] as Configuration[];
          this.configurations.forEach(c => {
            c.actions.filter(a => a.type === ConfigActionEnum.VIEW)
              .map(a => a.url = this.settingsService.getArlasWuiUrl());
            // for IAM only, if the user doesn't have the right to create (POST)
            // disabled the EDIT action
            if (this.authentMode === 'iam') {
              c.actions.filter(a => a.type === ConfigActionEnum.EDIT).map(a =>
                a.enabled = a.enabled && this.canCreateForCurrentOrg
              );
            }
          });
        },
        error: (msg) => {
          this.configurations = [];
          if (msg instanceof Response) {
            this.errorService.emitBackendError(msg.status, 'An error occured', 'ARLAS-persistence');
          } else {
            this.errorService.emitUnavailableService('ARLAS-persistence');
          }
        }
      });
  }


  public pageChange(pageEvent: PageEvent) {
    this.configPageNumber = pageEvent.pageIndex;
    this.configPageSize = pageEvent.pageSize;
    this.getConfigList();
  }

  public openPersistenceManagement(event) {
    if (this.persistenceService.isAvailable) {
      this.configChoice = InitialChoice.load;
    } else {
      event.stopPropagation();
    }
  }

  public loadConfig(id: string) {
    this.persistenceService.get(id).subscribe((data: DataWithLinks) => {
      this.mainFormService.configurationName = data.doc_key;
      this.mainFormService.configurationId = id;
      const configJson = JSON.parse(data.doc_value) as Config;
      if (configJson.arlas !== undefined) {
        const configMapJson = configJson.arlas.web.components.mapgl.input.mapLayers as MapConfig;
        this.landingPageService.initWithConfig(configJson, configMapJson, id, data.doc_key);
      } else {
        this.configChoice = InitialChoice.setup;
        this.openChoice(this.configChoice);
      }
    });
  }
  public getUserInfos() {
    this.dialog.open(UserInfosComponent);
  }

  public changeOrg(event: MatSelectChange) {
    this.currentOrga = event.value;
    this.arlasIamService.storeOrganisation(event.value);
    this.startupService.changeOrgHeader(event.value, this.arlasIamService.getAccessToken());
    this.checkUserRightsForOrg(event.value);
  }

  public ngOnDestroy() {
    if (!!this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  public checkUserRightsForOrg(org: string) {
    const iamHeader = {
      Authorization: 'Bearer ' + this.arlasIamService.getAccessToken(),
      'arlas-org-filter': org
    };
    const fetchOptions = { headers: iamHeader };
    this.permissionService.setOptions(fetchOptions);
    // Check user rights on current organisation
    this.permissionService.get('persist/resource/').subscribe({
      next: (resources: Resource[]) => {
        this.canCreateForCurrentOrg = resources.filter(r => r.verb === 'POST').length > 0;
        this.getConfigList();
      }
    });
  }
}


