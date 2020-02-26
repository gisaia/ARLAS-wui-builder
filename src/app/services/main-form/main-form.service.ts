import { Injectable } from '@angular/core';
import { FormGroup, AbstractControl, FormArray } from '@angular/forms';

enum MAIN_FORM_KEYS {
  MAP_CONFIG_LAYERS = 'MapConfigLayers',
  MAP_CONFIG_GLOBAL = 'MapConfigGlobal',
  STARTING_CONFIG = 'StartingConfig'
}

@Injectable({
  providedIn: 'root'
})
export class MainFormService {

  constructor() { }

  public mainForm = new FormGroup({});

  public getMapConfigLayersForm(): FormArray {
    return this.mainForm.get(MAIN_FORM_KEYS.MAP_CONFIG_LAYERS) as FormArray;
  }

  public addMapConfigLayersFormIfInexisting(control: FormArray) {
    if (this.getMapConfigLayersForm() == null) {
      return this.mainForm.addControl(MAIN_FORM_KEYS.MAP_CONFIG_LAYERS, control);
    }
  }

  public getMapConfigGlobalForm(): FormGroup {
    return this.mainForm.get(MAIN_FORM_KEYS.MAP_CONFIG_GLOBAL) as FormGroup;
  }

  public addMapConfigGlobalFormIfInexisting(control: FormGroup) {
    if (this.getMapConfigGlobalForm() == null) {
      return this.mainForm.addControl(MAIN_FORM_KEYS.MAP_CONFIG_GLOBAL, control);
    }
  }

  public getStartingGlobalForm(): FormGroup {
    return this.mainForm.get(MAIN_FORM_KEYS.STARTING_CONFIG) as FormGroup;
  }

  public getCollections(): string[] {
    return this.getStartingGlobalForm().get('collections').value;
  }

}
