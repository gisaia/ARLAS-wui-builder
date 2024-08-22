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
import { FormControl, FormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { CollectionService } from '@services/collection-service/collection.service';
import { toKeywordOptionsObs, toTextOptionsObs } from '@services/collection-service/tools';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { ConfigFormGroup, InputFormControl, SelectFormControl, SelectOption, SliderFormControl } from '@shared-models/config-form';
import { Observable } from 'rxjs';

export class SearchGlobalFormGroup extends ConfigFormGroup {

  public constructor(
    textFieldsObs: Observable<Array<SelectOption>>,
    keywordFieldsObs: Observable<Array<SelectOption>>
  ) {
    super(
      {
        name: new InputFormControl(
          null,
          marker('Placeholder'),
          marker('Placeholder descritpion'),
          null,
          { title: 'Search' }),
        searchField: new SelectFormControl(
          null,
          marker('Search field'),
          marker('Search field description'),
          true,
          textFieldsObs
        ),
        autocompleteField: new SelectFormControl(
          null,
          marker('Autocomplete field'),
          marker('Autocomplete field description'),
          true,
          keywordFieldsObs
        ),
        autocompleteSize: new SliderFormControl(
          null,
          marker('Autocomplete size'),
          marker('Autocomplete size description'),
          1,
          10,
          1
        ),
        unmanagedFields: new FormGroup({
          icon: new FormControl()
        })
      }
    );
  }

  public customControls = {
    name: this.get('name') as InputFormControl,
    searchField: this.get('searchField') as SelectFormControl,
    autocompleteField: this.get('autocompleteField') as SelectFormControl,
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

  public build() {
    const collectionFields = this.collectionService
      .getCollectionFields(this.mainFormService.getMainCollection());

    const globalFg = new SearchGlobalFormGroup(
      toTextOptionsObs(collectionFields),
      toKeywordOptionsObs(collectionFields)
    );

    this.defaultValuesService.setDefaultValueRecursively('search.global', globalFg);
    return globalFg;
  }
}
