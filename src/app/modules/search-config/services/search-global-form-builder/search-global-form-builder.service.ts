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
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { SearchCollectionComponent } from '@search-config/components/search-collection/search-collection.component';
import { CollectionService } from '@services/collection-service/collection.service';
import { CollectionField } from '@services/collection-service/models';
import { toKeywordOptionsObs, toTextOptionsObs } from '@services/collection-service/tools';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { CollectionConfigFormGroup } from '@shared-models/collection-config-form';
import {
  ComponentFormControl, ConfigFormGroup, InputFormControl,
  SelectFormControl, SelectOption, SliderFormControl
} from '@shared-models/config-form';
import { Observable } from 'rxjs';

export class SearchCollectionFormGroup extends CollectionConfigFormGroup {
  public constructor(
    collection: string,
    collectionService: CollectionService,
    textFieldsObs: Observable<Array<SelectOption>>,
    keywordFieldsObs: Observable<Array<SelectOption>>
  ) {
    super(collection,
      {
        collection: new SelectFormControl(
          collection,
          marker('Collection'),
          undefined,
          false,
          collectionService.getCollections().map(c => ({ label: c, value: c })),
          {
            optional: false,
            resetDependantsOnChange: true,
            isCollectionSelect: true
          },
        ),
        searchField: new SelectFormControl(
          null,
          marker('Search field'),
          undefined,
          true,
          textFieldsObs
        ),
        autocompleteField: new SelectFormControl(
          null,
          marker('Autocomplete field'),
          undefined,
          true,
          keywordFieldsObs
        ),
      }
    );
  }
  public customControls = {
    collection: this.get('collection') as SelectFormControl,
    searchField: this.get('searchField') as SelectFormControl,
    autocompleteField: this.get('autocompleteField') as SelectFormControl,
  };
}
export class SearchGlobalFormGroup extends ConfigFormGroup {

  public constructor(
  ) {
    super(
      {
        name: new InputFormControl(
          null,
          marker('Placeholder'),
          marker('Placeholder descritpion'),
          null,
          { title: marker('Search') }),
        autocompleteSize: new SliderFormControl(
          null,
          marker('Autocomplete size'),
          marker('Autocomplete size description'),
          1,
          10,
          1
        ),
        searchConfigurations: new FormArray<SearchCollectionFormGroup>([], {
          validators: Validators.required,
        }),
        customComponent: new ComponentFormControl(
          SearchCollectionComponent,
          {
            searchConfigurations: () => this.customControls.searchConfigurations
          },
          {

          }
        ),
        unmanagedFields: new FormGroup({
          icon: new FormControl()
        })
      }
    );
  }

  public customControls = {
    searchConfigurations: this.get('searchConfigurations') as FormArray<SearchCollectionFormGroup>,
    name: this.get('name') as InputFormControl,
    autocompleteSize: this.get('autocompleteSize') as SliderFormControl,
    unmanagedFields: {
      icon: this.get('unmanagedFields.icon')
    }
  };
}

@Injectable({
  providedIn: 'root'
})
export class SearchGlobalFormBuilderService {

  public constructor(
    private defaultValuesService: DefaultValuesService,
    private collectionService: CollectionService,
    private mainFormService: MainFormService,
  ) { }

  public buildSearchMainCollection() {
    const collectionFields = this.collectionService
      .getCollectionFields(this.mainFormService.getMainCollection());
    const initSearchMainCollection = new SearchCollectionFormGroup(
      this.mainFormService.getMainCollection(),
      this.collectionService, toTextOptionsObs(collectionFields),
      toKeywordOptionsObs(collectionFields));
    this.defaultValuesService.setDefaultValueRecursively('search.global', initSearchMainCollection);
    return initSearchMainCollection;
  }

  public build() {
    const initSearchMainCollection = this.buildSearchMainCollection();
    const globalFg = new SearchGlobalFormGroup();
    (globalFg.get('searchConfigurations') as FormArray).push(initSearchMainCollection);
    globalFg.customControls.searchConfigurations = new FormArray([initSearchMainCollection]);
    this.defaultValuesService.setDefaultValueRecursively('search.global', globalFg);
    return globalFg;
  }
}
