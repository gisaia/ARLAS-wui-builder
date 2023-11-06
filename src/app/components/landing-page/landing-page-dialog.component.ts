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
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CollectionService } from '@services/collection-service/collection.service';
import { InitialChoice, LandingPageService } from '@services/landing-page/landing-page.service';
import { MainFormManagerService } from '@services/main-form-manager/main-form-manager.service';
import { Config } from '@services/main-form-manager/models-config';
import { MapConfig } from '@services/main-form-manager/models-map-config';
import { MainFormService } from '@services/main-form/main-form.service';
import { MenuService } from '@services/menu/menu.service';
import { StartupService } from '@services/startup/startup.service';
import { DialogData } from '@shared-components/input-modal/input-modal.component';
import { ArlasConfigurationDescriptor, PersistenceService, UserInfosComponent } from 'arlas-wui-toolkit';
import { NGXLogger } from 'ngx-logger';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';


@Component({
  templateUrl: './landing-page-dialog.component.html',
  styleUrls: ['./landing-page-dialog.component.scss']
})
export class LandingPageDialogComponent implements OnInit, OnDestroy {

  public configChoice = InitialChoice.none;
  public isServerReady = false;
  public availablesCollections: string[];
  public InitialChoice = InitialChoice;

  public displayedColumns: string[] = ['id', 'creation', 'detail'];



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
    public startupService: StartupService,
    private configDescritor: ArlasConfigurationDescriptor,
    private translate: TranslateService,
    private mainFormManager: MainFormManagerService,
    private collectionService: CollectionService,
    public persistenceService: PersistenceService,
    private dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private router: Router,
    private menu: MenuService,
    private landingPageService: LandingPageService
  ) {

  }

  public ngOnInit(): void {
    if (!!this.data.configChoice) {
      if (this.data.configChoice === 2) {
        this.configChoice = InitialChoice.load;
      } else if (this.data.configChoice === 1) {
        this.configChoice = InitialChoice.setup;
      } else {
        this.configChoice = InitialChoice.none;
      }
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



  public cancel(): void {
    this.mainFormService.startingConfig.getFg().reset();
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
        this.landingPageService.getServerCollections(url).then(
          () => {
            this.urlCollectionsSubscription = this.configDescritor.getAllCollections().subscribe(
              collections => {
                this.availablesCollections = collections;
                this.collectionService.setCollections(collections);
                this.collectionService.getCollectionsReferenceDescription().subscribe(cdrs => this.collectionService.setCollectionsRef(cdrs));
              },
              error => {
                this.logger.error(this.translate.instant('Unable to access the server. Please, verify the url.'));
                this.spinner.hide('connectServer');
              },
              () => this.spinner.hide('connectServer')
            );
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
    this.dialogRef.close();
    setTimeout(() => this.landingPageService.startingEvent(null), 100);
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

      this.landingPageService.initWithConfig(configJson, configMapJson);
    }).catch(err => this.logger.error(this.translate.instant('Could not load config files ') + err));
  }

  public navigateToCollection(): void {
    this.dialogRef.close();
    this.menu.updatePagesStatus(false);
    this.router.navigate(['/collection']);
  }

  public openPersistenceManagement(event) {
    if (this.persistenceService.isAvailable) {
      this.configChoice = InitialChoice.load;
    } else {
      event.stopPropagation();
    }
  }


  public getUserInfos() {
    this.dialog.open(UserInfosComponent);
  }
}
