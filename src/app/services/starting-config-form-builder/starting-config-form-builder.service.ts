import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';

export class StartingConfigFormGroup extends FormGroup {
  constructor() {
    super({
      serverUrl: new FormControl(null,
        [
          Validators.required,
          Validators.pattern(
            '(https?://)?(([0-9.]{1,4}){4}(:[0-9]{2,5})|([a-z0-9-.]+)(\\.[a-z-.]+)(:[0-9]{2,5})?|localhost(:[0-9]{2,5}))+([/?].*)?'
          )
        ]),

      collections: new FormControl(null, [Validators.required, Validators.maxLength(1)]),
      unmanagedFields: new FormGroup({
        maxAgeCache: new FormControl()
      })
    });
  }

  public customControls = {
    serverUrl: this.get('serverUrl'),
    collections: this.get('collections'),
    unmanagedFields: {
      maxAgeCache: this.get('unmanagedFields.maxAgeCache')
    },
  };

}

@Injectable({
  providedIn: 'root'
})
export class StartingConfigFormBuilderService {

  constructor(
    private formBuilderDefault: FormBuilderWithDefaultService
  ) { }

  public build() {
    const formGroup = new StartingConfigFormGroup();
    this.formBuilderDefault.setDefaultValueRecursively('global', formGroup);
    return formGroup;
  }
}
