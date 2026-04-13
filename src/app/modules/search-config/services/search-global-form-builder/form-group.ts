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

import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { marker } from '@colsen1991/ngx-translate-extract-marker';
import { SearchCollectionComponent } from '@search-config/components/search-collection/search-collection.component';
import { ComponentFormControl, ConfigFormGroup, InputFormControl, SliderFormControl } from '@shared-models/config-form';
import { SearchCollectionFormGroup } from './search-global-form-builder.service';

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
