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

import { KeyValue } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CollectionService } from '@services/collection-service/collection.service';
import { CollectionItem, GroupCollectionItem } from '@services/collection-service/models';
import { InitialChoice, LandingPageService } from '@services/landing-page/landing-page.service';
import { MainFormManagerService } from '@services/main-form-manager/main-form-manager.service';
import { Config } from '@services/main-form-manager/models-config';
import { MapConfig } from '@services/main-form-manager/models-map-config';
import { MainFormService } from '@services/main-form/main-form.service';
import { MenuService } from '@services/menu/menu.service';
import { StartupService } from '@services/startup/startup.service';
import { DialogData } from '@shared-components/input-modal/input-modal.component';
import { PersistenceService, UserInfosComponent } from 'arlas-wui-toolkit';
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
  public availableCollections: GroupCollectionItem;
  public InitialChoice = InitialChoice;

  public displayedColumns: string[] = ['id', 'creation', 'detail'];
  public includePublicCollection = false;

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
    private translate: TranslateService,
    private mainFormManager: MainFormManagerService,
    private collectionService: CollectionService,
    public persistenceService: PersistenceService,
    private dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private router: Router,
    private menu: MenuService,
    private landingPageService: LandingPageService
  ) { }

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
    this.checkUrl();

    this.subscription = this.landingPageService.startEvent$.subscribe((b) => {
      this.dialogRef.close();
    });
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

  private resolveServerUrl(serverUrl, baseUrl) {
    try {
      return new URL(serverUrl, baseUrl).toString();
    } catch {
      // fallback in case of a malformed input
      return serverUrl;
    }
  }

  public checkUrl() {
    this.spinner.show('connectServer');
    const serverUrl = this.mainFormService.startingConfig.getFg().get('serverUrl').value;
    const resolvedServerUrl = this.resolveServerUrl(serverUrl, window.location.origin);
    this.urlSubscription = this.http.get(resolvedServerUrl + '/openapi.json').subscribe(
      {
        next: () => {
          this.landingPageService.getServerCollections(resolvedServerUrl).then(
            () => {
              this.urlCollectionsSubscription = this.collectionService.getCollectionsReferenceDescription().subscribe(
                cdrs => {
                  const collectionsItems: Array<CollectionItem> = cdrs
                    .filter(c => {
                      // If there is no authentication, then we want all the collections
                      if (this.includePublicCollection || !this.data?.isAuthentActivated) {
                        return true;
                      } else {
                        return (c.params.organisations as any)?.public === false;
                      }
                    })
                    .map(c => ({
                      name: c.collection_name,
                      isPublic: !this.data.isAuthentActivated ? true : (c.params.organisations as any)?.public === true,
                      sharedWith: c.params.organisations?.shared,
                      owner: c.params.organisations?.owner
                    }));
                  this.availableCollections = this.collectionService.buildGroupCollectionItems(collectionsItems, this.data.currentOrga);
                  this.collectionService.setGroupCollectionItems(this.availableCollections);
                  this.collectionService.setCollections(collectionsItems.map(c => c.name));
                  this.collectionService.setCollectionsRef(cdrs);
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
        error: () => {
          this.logger.error(this.translate.instant('Unable to access the server. Please, verify the url.'));
          this.isServerReady = false;
          this.spinner.hide('connectServer');
        }
      }
    );
  }

  public saveConfig() {
    const collection = this.dialogRef.componentInstance.mainFormService.startingConfig.getFg().customControls.collection.value;
    this.startupService.setDefaultCollection(collection);
    this.mainFormManager.initMainModulesForms(true);
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
      // Delete existing previewID to avoid right access problem on erase existing resource
      if (!!configJson.resources?.previewId) {
        delete configJson.resources.previewId;
      }
      const configMapJson = values[1] as MapConfig;
      this.dialogRef.close();
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

  public toggleDisplayPublic(event) {
    this.includePublicCollection = event.checked;
    this.checkUrl();
  }

  public getUserInfos() {
    this.dialog.open(UserInfosComponent);
  }

  public orderCollectionGroup = (
    a: KeyValue<'collections' | 'owner' | 'shared' | 'public', CollectionItem[]>,
    b: KeyValue<'collections' | 'owner' | 'shared' | 'public', CollectionItem[]>
  ) => {
    const mapKeyToOrder = new Map<string, number>();
    mapKeyToOrder.set('owner', 0);
    mapKeyToOrder.set('shared', 1);
    mapKeyToOrder.set('public', 2);
    mapKeyToOrder.set('collections', 3);
    return mapKeyToOrder.get(a.key) - mapKeyToOrder.get(b.key) > 0 ? 1 : -1;
  };
}
