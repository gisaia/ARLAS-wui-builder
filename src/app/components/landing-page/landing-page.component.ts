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
import { AfterViewInit, Component, OnInit, Output, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MainFormService } from '@services/main-form/main-form.service';
import { ArlasConfigService, ConfigAction, ConfigActionEnum } from 'arlas-wui-toolkit';
import { ArlasConfigurationDescriptor } from 'arlas-wui-toolkit/services/configuration-descriptor/configurationDescriptor.service';
import { NGXLogger } from 'ngx-logger';
import { Subject } from 'rxjs';
import { StartupService, ZONE_WUI_BUILDER } from '../../services/startup/startup.service';
import { MainFormManagerService } from '@services/main-form-manager/main-form-manager.service';
import { MapConfig } from '@services/main-form-manager/models-map-config';
import { DataWithLinks } from 'arlas-persistence-api';
import { PageEvent } from '@angular/material/paginator';
import { DialogData } from '@shared-components/input-modal/input-modal.component';
import { StartingConfigFormBuilderService } from '@services/starting-config-form-builder/starting-config-form-builder.service';
import { AuthentificationService } from 'arlas-wui-toolkit/services/authentification/authentification.service';
import { ErrorService } from 'arlas-wui-toolkit/services/error/error.service';
import { PersistenceService } from 'arlas-wui-toolkit/services/persistence/persistence.service';
import { Config } from '@services/main-form-manager/models-config';
import { map } from 'rxjs/internal/operators/map';
import { ArlasSettingsService } from 'arlas-wui-toolkit/services/settings/arlas.settings.service';
import { UserInfosComponent } from 'arlas-wui-toolkit//components/user-infos/user-infos.component';
import { NgxSpinnerService } from 'ngx-spinner';

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
export class LandingPageDialogComponent implements OnInit {
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

  constructor(
    public dialogRef: MatDialogRef<LandingPageDialogComponent>,
    public mainFormService: MainFormService,
    private http: HttpClient,
    private logger: NGXLogger,
    private configService: ArlasConfigService,
    private startupService: StartupService,
    private configDescritor: ArlasConfigurationDescriptor,
    private startingConfigFormBuilder: StartingConfigFormBuilderService,
    private translate: TranslateService,
    private mainFormManager: MainFormManagerService,
    public persistenceService: PersistenceService,
    private dialog: MatDialog,
    private authService: AuthentificationService,
    private errorService: ErrorService,
    private arlasSettingsService: ArlasSettingsService,
    private spinner: NgxSpinnerService,

    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.showLoginButton = !!this.authService.authConfigValue && !!this.authService.authConfigValue.use_authent;
    this.showLogOutButton = !!this.authService.authConfigValue && !!this.authService.authConfigValue.use_authent;
  }

  public ngOnInit(): void {
    if (this.data.message !== '-1') {
      this.loadConfig(this.data.message);
    }
    // Reset and clean the content of all forms
    this.mainFormService.resetMainForm();

    // Reset current config id
    this.mainFormService.configurationId = undefined;
    this.mainFormService.configChange.next({ id: undefined, name: undefined });

    this.mainFormService.startingConfig.init(
      this.startingConfigFormBuilder.build()
    );
    const claims = this.authService.identityClaims as any;
    this.authService.canActivateProtectedRoutes.subscribe(isAuthenticated => {
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

    // if persistence is configured and anonymous mode is enable, we fetch the configuration accessible as anonymous
    // if ARLAS-persistence doesn't allow anonymous access, a suitable error is displayed in a modal
    if (this.persistenceService.isAvailable && !this.authService.authConfigValue && !this.authService.authConfigValue.use_authent) {
      this.getConfigList();
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
    const url = this.mainFormService.startingConfig.getFg().get('serverUrl').value;
    this.http.get(url + '/swagger.json').subscribe(
      () => {
        this.getServerCollections(url).then(() => {
          this.configDescritor.getAllCollections().subscribe(collections => this.availablesCollections = collections);
          this.isServerReady = true;
        });
      },
      () => {
        this.logger.error(this.translate.instant('Unable to access the server. Please, verify the url.'));
        this.isServerReady = false;
      }
    );
  }

  public saveConfig() {
    const collection = this.dialogRef.componentInstance.mainFormService.startingConfig.getFg().get('collections').value;
    this.startupService.setCollection(collection);
    this.mainFormManager.initMainModulesForms(true);
    this.startEvent.next();
  }

  public initWithConfig(configJson: Config, configMapJson: MapConfig, configId?: string, configName?: string) {
    this.getServerCollections(configJson.arlas.server.url).then(() => {
      this.configDescritor.getAllCollections().subscribe(collections => {
        const collection = (collections.find(c => c === configJson.arlas.server.collection.name));

        if (!collection) {
          this.logger.error(
            this.translate.instant('Collection ')
            + configJson.arlas.server.collection.name
            + this.translate.instant(' unknown. Available collections: ')
            + collections.join(', '));

        } else {
          this.spinner.show('importconfig');
          /** hack in order to trigger the spinner 'importconfig'
           * otherwise, we will think the application is not loading
           */
          setTimeout(() => {
            this.mainFormManager.doImport(configJson, configMapJson);
            this.startEvent.next();
            this.spinner.hide('importconfig');
            }, 100);
          }
      });
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
      // I think we need to think about two options for this part
      // A config file store in a database with arlas-persistence
      // A config file store on the file system of the user computer
      // TODO In all cases we need to validate the folder with this code
      // const newUrl = this.dialogRef.componentInstance.mainFormService.startingConfig.getFg().get('serverUrl').value;
      // this.startupService.validLoadedConfig(newUrl)

      this.initWithConfig(configJson, configMapJson);

    }).catch(err => this.logger.error(this.translate.instant('Could not load config files ') + err));
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
      this.mainFormService.configurationId = id;
    });
  }
  public getUserInfos() {
    this.dialog.open(UserInfosComponent);
  }
}

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit, AfterViewInit {

  @Output() public startEvent: Subject<boolean> = new Subject<boolean>();
  public dialogRef: MatDialogRef<LandingPageDialogComponent>;

  private confId = '-1';

  constructor(
    private dialog: MatDialog,
    private logger: NGXLogger,
    private router: Router,
    private translate: TranslateService,
    private activatedRoute: ActivatedRoute) {
  }

  public ngOnInit(): void {
    if (this.activatedRoute.snapshot.paramMap.has('id')) {
      this.confId = this.activatedRoute.snapshot.paramMap.get('id');
    }
  }

  public openChoice() {
    this.dialogRef = this.dialog.open(LandingPageDialogComponent, { disableClose: true, data: { message: this.confId } });
    this.dialogRef.componentInstance.startEvent.subscribe(mode => this.startEvent.next(mode));
  }

  public ngAfterViewInit() {
    // the set timeout is a hack to display dialog after 'callback' redirection. Otherwise the dialog is not opened in that case.
    // https://stackoverflow.com/questions/779379/why-is-settimeoutfn-0-sometimes-useful
    setTimeout(() => this.openChoice(), 0);
    this.startEvent.subscribe(state => {
      this.dialogRef.close();
      this.router.navigate(['map-config'], { queryParamsHandling: 'preserve' });
      this.logger.info(this.translate.instant('Ready to access server'));
    });
  }
}


