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
import { Injectable } from '@angular/core';
import { FormArray } from '@angular/forms';
import { CHIPSEARCH_TYPE, Config, SEARCH_TYPE } from '@services/main-form-manager/models-config';
import { importElements } from '@services/main-form-manager/tools';
import { MainFormService } from '@services/main-form/main-form.service';
import { SearchGlobalFormBuilderService, SearchGlobalFormGroup } from '../search-global-form-builder/search-global-form-builder.service';

@Injectable({
  providedIn: 'root'
})
export class SearchImportService {

  public constructor(
    private mainFormService: MainFormService,
    private searchGlobalFormBuilderService: SearchGlobalFormBuilderService
  ) { }

  public doImport(config: Config) {

    const searchContributors = config.arlas.web.contributors
      .filter(c => c.type === CHIPSEARCH_TYPE || c.type === SEARCH_TYPE);
    const chipsearchComponent = config['arlas-wui'].web.app.components.chipssearch;

    const globalSearchFg = this.mainFormService.searchConfig.getGlobalFg() as SearchGlobalFormGroup;


    const searchConfigurations = new FormArray([]);

    searchContributors.forEach(s => {
      const searchConfigGroup = this.searchGlobalFormBuilderService.buildSearchMainCollection();
      searchConfigGroup.customControls.collection.setValue(s.collection);
      searchConfigGroup.customControls.autocompleteField.setValue(s.autocomplete_field);
      searchConfigGroup.customControls.searchField.setValue(s.search_field);
      searchConfigurations.push(searchConfigGroup);
    });
    globalSearchFg.customControls.searchConfigurations = searchConfigurations;

    importElements([
      {
        value: chipsearchComponent.name,
        control: globalSearchFg.customControls.name
      },
      {
        value: searchContributors[0]?.autocomplete_size,
        control: globalSearchFg.customControls.autocompleteSize
      },
      {
        value: searchContributors[0]?.icon,
        control: globalSearchFg.customControls.unmanagedFields.icon
      }
    ]);
  }
}
