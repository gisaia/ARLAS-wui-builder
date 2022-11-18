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
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, Inject, Injector, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CollectionService } from '@services/collection-service/collection.service';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { MainFormManagerService } from '@services/main-form-manager/main-form-manager.service';
import { Config } from '@services/main-form-manager/models-config';
import { MapConfig } from '@services/main-form-manager/models-map-config';
import { MainFormService } from '@services/main-form/main-form.service';
import { MenuService } from '@services/menu/menu.service';
import { StartingConfigFormBuilderService } from '@services/starting-config-form-builder/starting-config-form-builder.service';
import { DialogData } from '@shared-components/input-modal/input-modal.component';
import { DataWithLinks } from 'arlas-persistence-api';
import {
  ArlasConfigService, ArlasConfigurationDescriptor, ArlasSettingsService, AuthentificationService, ConfigAction,
  ConfigActionEnum, ErrorService, PersistenceService, UserInfosComponent
} from 'arlas-wui-toolkit';
import { NGXLogger } from 'ngx-logger';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';
import { StartupService, ZONE_WUI_BUILDER } from '@services/startup/startup.service';

enum InitialChoice {
  none = 0,
  setup = 1,
  load = 2
}

export interface Configuration {
  name: string;
  last_update_date: any;
  actions: Array<ConfigAction>;
}

@Component({
  templateUrl: './landing-page-dialog.component.html',
  styleUrls: ['./landing-page-dialog.component.scss']
})
export class LandingPageDialogComponent implements OnInit, OnDestroy {
  @Output() public startEvent: Subject<boolean> = new Subject<boolean>();

  public configChoice = InitialChoice.none;
  public isServerReady = false;
  public availablesCollections: string[];
  public InitialChoice = InitialChoice;

  public configurations: Configuration[] = [];
  public displayedColumns: string[] = ['id', 'creation', 'detail'];
  public configurationsLength = 0;
  public configPageNumber = 0;
  public configPageSize = 5;

  public showLoginButton: boolean;
  public showLogOutButton: boolean;

  public isAuthenticated = false;
  private errorAlreadyThrown = false;
  public name: string;
  public avatar: string;

  private subscription: Subscription;
  private urlSubscription: Subscription;
  private urlCollectionsSubscription: Subscription;
  private collectionsSubscription: Subscription;

  public constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public dialogRef: MatDialogRef<LandingPageDialogComponent>,
    public mainFormService: MainFormService,
    private http: HttpClient,
    private logger: NGXLogger,
    private configService: ArlasConfigService,
    private startupService: StartupService,
    private configDescritor: ArlasConfigurationDescriptor,
    private startingConfigFormBuilder: StartingConfigFormBuilderService,
    private defaultValuesService: DefaultValuesService,
    private translate: TranslateService,
    private mainFormManager: MainFormManagerService,
    private collectionService: CollectionService,
    public persistenceService: PersistenceService,
    private dialog: MatDialog,
    private authService: AuthentificationService,
    private errorService: ErrorService,
    private arlasSettingsService: ArlasSettingsService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private menu: MenuService,
    private injector: Injector,
  ) {
    this.showLoginButton = !!this.authService.authConfigValue && !!this.authService.authConfigValue.use_authent;
    this.showLogOutButton = !!this.authService.authConfigValue && !!this.authService.authConfigValue.use_authent;
  }

  public ngOnInit(): void {
    if (this.data.message !== '-1') {
      this.loadConfig(this.data.message);
    }
    if (!!this.data.configChoice) {
      if (this.data.configChoice === '2') {
        this.configChoice = InitialChoice.load;
      } else {
        this.configChoice = InitialChoice.none;
      }
    }

    // Reset and clean the content of all forms
    this.mainFormService.resetMainForm();

    // Reset current config id
    this.mainFormService.configurationId = undefined;
    if (this.mainFormService.configChange) {
      this.mainFormService.configChange.next({ id: undefined, name: undefined });
    }

    this.mainFormService.startingConfig.init(
      this.startingConfigFormBuilder.build()
    );
    const claims = this.authService.identityClaims as any;
    this.subscription = this.authService.canActivateProtectedRoutes.subscribe(isAuthenticated => {
      // show login button when authentication is enabled in settings.yaml file && the app is not authenticated
      this.showLoginButton = !!this.authService.authConfigValue && !!this.authService.authConfigValue.use_authent && !isAuthenticated;
      this.showLogOutButton = !!this.authService.authConfigValue && !!this.authService.authConfigValue.use_authent && isAuthenticated;
      this.isAuthenticated = isAuthenticated;
      if (this.persistenceService.isAvailable) {
        this.getConfigList();
      }
      if (isAuthenticated) {
        this.name = claims.nickname;
        this.avatar = claims.picture;
      } else {
        this.name = '';
        this.avatar = '';
      }
    });
    // if persistence is configured and anonymous mode is enabled, we fetch the configuration accessible as anonymous
    // if ARLAS-persistence doesn't allow anonymous access, a suitable error is displayed in a modal
    if (this.persistenceService.isAvailable && (!this.authService.authConfigValue || !this.authService.authConfigValue.use_authent)) {
      this.getConfigList();
    }
  }

  public ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.urlSubscription) {
      this.urlSubscription.unsubscribe();
    }
    if (this.urlCollectionsSubscription) {
      this.urlCollectionsSubscription.unsubscribe();
    }
    if (this.collectionsSubscription) {
      this.collectionsSubscription.unsubscribe();
    }
  }

  public logout() {
    this.authService.logout();
  }

  public cancel(): void {
    this.dialogRef.close();
  }
  public onKeyUp(event: KeyboardEvent) {
    // On press enter
    if (event.key === 'Enter') {
      this.checkUrl();
    }
  }

  public checkUrl() {
    this.spinner.show('connectServer');
    const url = this.mainFormService.startingConfig.getFg().get('serverUrl').value;
    this.urlSubscription = this.http.get(url + '/swagger.json').subscribe(
      () => {
        this.getServerCollections(url).then(() => {
          this.urlCollectionsSubscription = this.configDescritor.getAllCollections().subscribe(collections => {
            this.availablesCollections = collections;
            this.collectionService.setCollections(collections);
            this.collectionService.getCollectionsReferenceDescription().subscribe(cdrs => this.collectionService.setCollectionsRef(cdrs));
          }, error => this.logger.error(this.translate.instant('Unable to access the server. Please, verify the url.'))
          , () => this.spinner.hide('connectServer'));
          this.isServerReady = true;
        });
      },
      () => {
        this.logger.error(this.translate.instant('Unable to access the server. Please, verify the url.'));
        this.isServerReady = false;
        this.spinner.hide('connectServer');
      }
    );
  }

  public saveConfig() {
    const collection = this.dialogRef.componentInstance.mainFormService.startingConfig.getFg().customControls.collection.value;
    this.startupService.setDefaultCollection(collection);
    this.mainFormManager.initMainModulesForms(true);
    setTimeout(() => this.startEvent.next(null), 100);
  }

  public initWithConfig(configJson: Config, configMapJson: MapConfig, configId?: string, configName?: string, isRetry?: boolean) {
    this.spinner.show('importconfig');
    this.getServerCollections(configJson.arlas.server.url).then(() => {
      this.collectionsSubscription = this.configDescritor.getAllCollections().subscribe({
        next: collections => {
          this.initCollections(collections, configJson, configMapJson, configId, configName);
        },
        error: () => {
          this.spinner.hide('importconfig');
          if (!isRetry) {
            configJson.arlas.server.url = this.defaultValuesService.getValue('global.serverUrl');
            this.initWithConfig(configJson, configMapJson, configId, configName, true);
          } else {
            this.logger.error(
              this.translate.instant('Server "')
              + configJson.arlas.server.url
              + this.translate.instant('" unreachable'));
          }
        }
      });
    });
  }

  public initCollections(collections: string[], configJson: Config, configMapJson: MapConfig, configId?: string, configName?: string) {
    this.collectionService.setCollections(collections);
    this.collectionService.getCollectionsReferenceDescription().subscribe(cdrs => {
      this.collectionService.setCollectionsRef(cdrs);
      const collection = (collections.find(c => c === configJson.arlas.server.collection.name));
      if (!collection) {
        this.spinner.hide('importconfig');
        this.logger.error(
          this.translate.instant('Collection ')
          + configJson.arlas.server.collection.name
          + this.translate.instant(' unknown. Available collections: ')
          + collections.join(', '));

      } else {
        // tslint:disable-next-line:no-string-literal
        if (this.arlasSettingsService.settings['use_time_filter']) {
          this.startupService.getTimeFilter(collection, configJson.arlas.server.url, this.collectionService, this.arlasSettingsService)
            .subscribe(timeFilter => {
              this.startupService.applyArlasInterceptor(collection, timeFilter);
              setTimeout(() => {
                this.mainFormManager.doImport(configJson, configMapJson);
                this.startEvent.next(null);
                this.spinner.hide('importconfig');
              }, 100);
            });
          /** hack in order to trigger the spinner 'importconfig'
           * otherwise, we will think the application is not loading
           */
        } else {
          setTimeout(() => {
            this.mainFormManager.doImport(configJson, configMapJson);
            this.startEvent.next(null);
            this.spinner.hide('importconfig');
          }, 100);
        }

      }
      if (!!configId && !!configName) {
        this.mainFormService.configChange.next({ id: configId, name: configName });
      }
    });
  }

  public upload(configFile: File, mapConfigFile: File) {

    const readAndParsePromise = (file: File) => new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        try {
          resolve(JSON.parse(fileReader.result.toString()));
        } catch (excp) {
          reject(excp);
        }
      };
      fileReader.onerror = (err) => reject(err);
      fileReader.readAsText(file);
    });

    Promise.all([
      readAndParsePromise(configFile), readAndParsePromise(mapConfigFile)
    ]).then(values => {
      const configJson = values[0] as Config;
      const configMapJson = values[1] as MapConfig;

      this.initWithConfig(configJson, configMapJson);

    }).catch(err => this.logger.error(this.translate.instant('Could not load config files ') + err));
  }

  public navigateToCollection(): void {
    this.dialogRef.close();
    this.menu.updatePagesStatus(false);
    this.router.navigate(['/collection']);
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
      zone: data.doc_zone
    };
    actions.push({
      config,
      configIdParam: 'config_id',
      type: ConfigActionEnum.VIEW
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
      name: data.doc_key
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
      .pipe(map(data => {
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
              .map(a => a.url = this.arlasSettingsService.getArlasWuiUrl());
          });
        },
        error: (msg) => {
          if (!this.errorAlreadyThrown) {
            let message = '';
            if (msg.url) {
              message =
                '- An ARLAS-persistence error occured: ' + (msg.status === 404 ? 'unreachable server \n' : 'unauthorized access \n') +
                '   - url: ' + msg.url + '\n' + '   - status : ' + msg.status;
            } else {
              message = msg.toString();
            }
            const error = {
              origin: 'ARLAS-persistence',
              message,
              reason: (msg.status === 404 || msg.toString().includes('Failed to fetch') ?
                'Please check if ARLAS-persistence server is up & running,' +
                ' and that you have access to the asked endpoint' :
                'Please check if you\'re authenticated to have access to ARLAS-persistence server')
            };
            if (msg.status !== 403 && msg.status !== 401) {
              this.errorService.errorEmitter.next(error);
            }
          }
          this.errorAlreadyThrown = true;
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

  private getServerCollections(serverUrl: string) {
    // Update config with new server url
    // Usefull to use toolkit method
    const currentConf = this.configService.getConfig();
    const newConf = Object.assign(currentConf, { arlas: { server: { url: serverUrl } } });
    this.configService.setConfig(newConf);
    // Update collaborative search Service with the new url
    return this.startupService.setCollaborativeService(newConf);
  }

  public login() {
    this.authService.login();
  }

  public loadConfig(id: string) {
    this.persistenceService.get(id).subscribe(data => {
      const configJson = JSON.parse(data.doc_value) as Config;
      if (configJson.arlas !== undefined) {
        const configMapJson = configJson.arlas.web.components.mapgl.input.mapLayers as MapConfig;
        this.initWithConfig(configJson, configMapJson, id, data.doc_key);
      } else {
        this.configChoice = InitialChoice.setup;
      }
      this.mainFormService.configurationName = data.doc_key;
      this.mainFormService.configurationId = id;
    });
  }
  public getUserInfos() {
    this.dialog.open(UserInfosComponent);
  }
}

@Component({
  selector: 'arlas-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit, AfterViewInit, OnDestroy {

  @Output() public startEvent: Subject<boolean> = new Subject<boolean>();
  public dialogRef: MatDialogRef<LandingPageDialogComponent>;

  private confId = '-1';
  private configChoice;

  public constructor(
    private dialog: MatDialog,
    private logger: NGXLogger,
    private router: Router,
    private translate: TranslateService,
    private activatedRoute: ActivatedRoute,
    private menu: MenuService) {
  }

  public ngOnInit(): void {
    if (this.activatedRoute.snapshot.paramMap.has('id')) {
      this.confId = this.activatedRoute.snapshot.paramMap.get('id');
    } else if (!!this.activatedRoute.snapshot.routeConfig && this.activatedRoute.snapshot.routeConfig.path === 'import') {
      this.configChoice = '2';
    }
  }

  public openChoice() {
    this.dialogRef = this.dialog.open(LandingPageDialogComponent, {
      disableClose: true, data:
        { message: this.confId, configChoice: this.configChoice }
    });
    this.dialogRef.componentInstance.startEvent.subscribe(mode => this.startEvent.next(mode));
  }

  public ngAfterViewInit() {
    // the set timeout is a hack to display dialog after 'callback' redirection. Otherwise the dialog is not opened in that case.
    // https://stackoverflow.com/questions/779379/why-is-settimeoutfn-0-sometimes-useful
    setTimeout(() => this.openChoice(), 0);
    this.startEvent.subscribe(state => {
      this.dialogRef.close();
      this.menu.updatePagesStatus(true);
      this.router.navigate(['map-config'], { queryParamsHandling: 'preserve' });
      this.logger.info(this.translate.instant('Ready to access server'));
    });
  }

  public ngOnDestroy() {
    this.startEvent.unsubscribe();
  }
}


