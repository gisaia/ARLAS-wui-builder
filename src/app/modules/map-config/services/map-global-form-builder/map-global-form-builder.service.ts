import { Injectable } from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';

export class MapGlobalFormGroup extends FormGroup {

  constructor() {
    super({
      requestGeometries: new FormArray([]),
      geographicalOperator: new FormControl(null, Validators.required),
      allowMapExtend: new FormControl(),
      margePanForLoad: new FormControl(null, Validators.min(0)),
      margePanForTest: new FormControl(null, Validators.min(0)),
      initZoom: new FormControl(null, [Validators.required, Validators.min(1), Validators.max(18)]),
      initCenterLat: new FormControl(null, Validators.required),
      initCenterLon: new FormControl(null, Validators.required),
      displayScale: new FormControl()
    });
  }

  public customControls = {
    requestGeometries: this.get('requestGeometries') as FormArray,
    geographicalOperator: this.get('geographicalOperator') as FormControl,
    allowMapExtend: this.get('allowMapExtend') as FormControl,
    margePanForLoad: this.get('margePanForLoad') as FormControl,
    margePanForTest: this.get('margePanForTest') as FormControl,
    initZoom: this.get('initZoom') as FormControl,
    initCenterLat: this.get('initCenterLat') as FormControl,
    initCenterLon: this.get('initCenterLon') as FormControl,
    displayScale: this.get('displayScale') as FormControl
  };
}

@Injectable({
  providedIn: 'root'
})
export class MapGlobalFormBuilderService {

  constructor(
    protected formBuilderDefault: FormBuilderWithDefaultService
  ) { }

  public build() {
    const mapGlobalFormGroup = new MapGlobalFormGroup();
    this.formBuilderDefault.setDefaultValueRecursively('map.global', mapGlobalFormGroup);
    return mapGlobalFormGroup;
  }

}
