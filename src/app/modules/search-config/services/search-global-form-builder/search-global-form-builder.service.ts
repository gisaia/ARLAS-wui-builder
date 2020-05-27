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
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';
import {
  ConfigFormGroup, InputFormControl, SelectFormControl, SliderFormControl, SelectOption, IconFormControl
} from '@shared-models/config-form';
import { CollectionService } from '@services/collection-service/collection.service';
import { Observable } from 'rxjs';
import { MainFormService } from '@services/main-form/main-form.service';
import { toKeywordOptionsObs, toTextOptionsObs } from '@services/collection-service/tools';
import { TranslateService } from '@ngx-translate/core';

export class SearchGlobalFormGroup extends ConfigFormGroup {

  constructor(
    textFieldsObs: Observable<Array<SelectOption>>,
    keywordFieldsObs: Observable<Array<SelectOption>>,
    iconHtmlDescription: string) {
    super(
      {
        name: new InputFormControl(
          null,
          'Name',
          'It is used to...',
          null,
          { title: 'Search'}),
        searchField: new SelectFormControl(
          null,
          'Search field',
          'It is used to...',
          true,
          textFieldsObs
        ),
        autocompleteField: new SelectFormControl(
          null,
          'Autocomplete field',
          'It is used to...',
          true,
          keywordFieldsObs
        ),
        autocompleteSize: new SliderFormControl(
          null,
          'Autocomplete size',
          'It is used to...',
          1,
          10,
          1
        ),
        icon: new IconFormControl(
          null,
          'Icon',
          iconHtmlDescription,
          {
            isDescriptionHtml: true
          }
        )
      }
    );
  }

  public customControls = {
    name: this.get('name') as InputFormControl,
    searchField: this.get('searchField') as SelectFormControl,
    autocompleteField: this.get('autocompleteField') as SelectFormControl,
    autocompleteSize: this.get('autocompleteSize') as SliderFormControl,
    icon: this.get('icon') as InputFormControl
  };
}

@Injectable({
  providedIn: 'root'
})
export class SearchGlobalFormBuilderService {

  constructor(
    private formBuilderDefault: FormBuilderWithDefaultService,
    private collectionService: CollectionService,
    private mainFormService: MainFormService,
    private translate: TranslateService
  ) { }

  public build() {
    const collectionFields = this.collectionService
      .getCollectionFields(this.mainFormService.getCollections()[0]);

    const globalFg = new SearchGlobalFormGroup(
      toTextOptionsObs(collectionFields),
      toKeywordOptionsObs(collectionFields),
      this.translate.instant('Please look for an icon')
      + ' <a href="https://material.io/resources/icons/?style=baseline" target="_blank">'
      + this.translate.instant('here')
      + '</a> '
      + this.translate.instant('and copy-paste its reference'));

    this.formBuilderDefault.setDefaultValueRecursively('search.global', globalFg);
    return globalFg;
  }
}
