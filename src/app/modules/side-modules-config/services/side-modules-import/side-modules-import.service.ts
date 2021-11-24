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

    importElements([
      {
        value: !!shareComponent,
        control: sideModulesGlobal.useShare
      },
      {
        value: !!shareComponent ? shareComponent.geojson.max_for_feature : null,
        control: sideModulesGlobal.share.maxForFeature
      },
      {
        value: !!shareComponent ? shareComponent.geojson.max_for_topology : null,
        control: sideModulesGlobal.share.maxForTopology
      },
      {
        value: !!shareComponent ? shareComponent.geojson.sort_excluded_type : null,
        control: sideModulesGlobal.unmanagedFields.sortExcludedTypes
      },
      {
        value: config.arlas.server.max_age_cache,
        control: sideModulesGlobal.cache.maxAgeCache
      },
    ]);

    importElements([
      {
        value: !!downloadComponent,
        control: sideModulesGlobal.useDownload
      }
    ]);

    importElements([
      {
        value: !!tagger,
        control: sideModulesGlobal.useTagger
      },
      {
        value: !!tagger ? tagger.url : null,
        control: sideModulesGlobal.tagger.serverUrl
      },
      {
        value: !!tagger ? tagger.collection : null,
        control: sideModulesGlobal.tagger.collection
      },
    ]);
  }

}
