import { Injectable } from '@angular/core';
import { MainFormService } from '@services/main-form/main-form.service';
import { MapGlobalFormBuilderService } from '../map-global-form-builder/map-global-form-builder.service';
import { FormArray, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class MapInitService {

  constructor(
    private mainFormService: MainFormService,
    private mapGlobalFormBuilder: MapGlobalFormBuilderService
  ) { }

  public initModule() {
    this.mainFormService.mapConfig.initGlobalFg(
      this.mapGlobalFormBuilder.build()
    );

    this.mainFormService.mapConfig.initLayersFa(
      new FormArray([], [Validators.required])
    );
  }

}
