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

import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CollectionService } from '@services/collection-service/collection.service';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { MainFormManagerService } from '@services/main-form-manager/main-form-manager.service';
import { Config } from '@services/main-form-manager/models-config';
import { MapConfig } from '@services/main-form-manager/models-map-config';
import { MainFormService } from '@services/main-form/main-form.service';
import { StartupService } from '@services/startup/startup.service';
import { ArlasConfigService, ArlasConfigurationDescriptor, ArlasSettingsService } from 'arlas-wui-toolkit';
import { NGXLogger } from 'ngx-logger';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable, Subject, Subscription } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class LandingPageService {

  private subscription: Subscription;
  private urlSubscription: Subscription;
  private urlCollectionsSubscription: Subscription;
  private collectionsSubscription: Subscription;
  private refreshSubscription: Subscription;
  public startEventSource: Subject<boolean> = new Subject<boolean>();
  public startEvent$: Observable<boolean> = this.startEventSource.asObservable();
  public constructor(
    public startupService: StartupService,
    private spinner: NgxSpinnerService,
    private logger: NGXLogger,
    private translate: TranslateService,
    private configService: ArlasConfigService,
    private configDescritor: ArlasConfigurationDescriptor,
    private defaultValuesService: DefaultValuesService,
    private collectionService: CollectionService,
    private arlasSettingsService: ArlasSettingsService,
    private mainFormManager: MainFormManagerService,
    public mainFormService: MainFormService) {
  }


  public startingEvent(boolean: boolean) {
    this.startEventSource.next(boolean);
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
                this.startEventSource.next(null);
                this.spinner.hide('importconfig');
              }, 100);
            });
          /** hack in order to trigger the spinner 'importconfig'
           * otherwise, we will think the application is not loading
           */
        } else {
          setTimeout(() => {
            this.mainFormManager.doImport(configJson, configMapJson);
            this.startEventSource.next(null);
            this.spinner.hide('importconfig');
          }, 100);
        }

      }
      if (!!configId && !!configName) {
        this.mainFormService.configChange.next({ id: configId, name: configName });
      }
    });
  }

  public getServerCollections(serverUrl: string) {
    // Update config with new server url
    // Usefull to use toolkit method
    const currentConf = this.configService.getConfig();
    const newConf = Object.assign(currentConf, { arlas: { server: { url: serverUrl } } });
    this.configService.setConfig(newConf);
    // Update collaborative search Service with the new url
    return this.startupService.setCollaborativeService(newConf);
  }
}
