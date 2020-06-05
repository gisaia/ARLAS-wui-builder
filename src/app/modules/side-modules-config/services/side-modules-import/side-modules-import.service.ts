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
import { MainFormService } from '@services/main-form/main-form.service';
import { Config } from '@services/main-form-manager/models-config';
import { importElements } from '@services/main-form-manager/tools';

@Injectable({
  providedIn: 'root'
})
export class SideModulesImportService {

  constructor(
    private mainFormService: MainFormService
  ) { }

  public doImport(config: Config) {
    const shareComponent = config.arlas.web.components.share;
    const downloadComponent = config.arlas.web.components.download;
    const tagger = config.arlas.tagger;

    const sideModulesGlobal = this.mainFormService.sideModulesConfig.getGlobalFg().customControls;

    if (!!shareComponent) {
      importElements([
        {
          value: true,
          control: sideModulesGlobal.useShare
        },
        {
          value: shareComponent.geojson.max_for_feature,
          control: sideModulesGlobal.share.maxForFeature
        },
        {
          value: shareComponent.geojson.max_for_topology,
          control: sideModulesGlobal.share.maxForTopology
        },
        {
          value: shareComponent.geojson.sort_excluded_type,
          control: sideModulesGlobal.unmanagedFields.sortExcludedTypes
        }
      ]);
    }

    if (!!downloadComponent) {
      importElements([
        {
          value: true,
          control: sideModulesGlobal.useDownload
        },
        {
          value: !!downloadComponent.auth_type,
          control: sideModulesGlobal.download.basicAuthent
        },
      ]);
    }

    if (!!tagger) {
      importElements([
        {
          value: true,
          control: sideModulesGlobal.useTagger
        },
        {
          value: tagger.url,
          control: sideModulesGlobal.tagger.serverUrl
        },
        {
          value: tagger.collection,
          control: sideModulesGlobal.tagger.collection
        },
      ]);
    }
  }

}
