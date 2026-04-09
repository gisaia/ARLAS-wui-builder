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
