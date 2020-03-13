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
import { Component, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CanComponentExit } from '@guards/confirm-exit/confirm-exit.guard';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { NGXLogger } from 'ngx-logger';
import { Subject } from 'rxjs';
import { EditLayerComponentForm } from './edit-layer.component.form';

@Component({
  selector: 'app-edit-layer',
  templateUrl: './edit-layer.component.html',
  styleUrls: ['./edit-layer.component.scss']
})
export class EditLayerComponent extends EditLayerComponentForm implements OnInit, CanComponentExit {

  private layersFa: FormArray;
  private layersValues: any[] = [];
  public forceCanExit: boolean;
  public submitSubject: Subject<void> = new Subject<void>();

  constructor(
    protected formBuilderDefault: FormBuilderWithDefaultService,
    private mainFormService: MainFormService,
    private route: ActivatedRoute,
    private router: Router,
    private logger: NGXLogger) {

    super(formBuilderDefault);
  }

  ngOnInit() {

    this.layersFa = this.mainFormService.mapConfig.getLayersFa();

    if (this.layersFa == null) {
      this.logger.error('Error initializing the page, layers form group is missing');
      this.navigateToParentPage();
    } else {

      this.layersValues = this.layersFa.value as any[];
      this.route.paramMap.subscribe(params => {
        const layerId = params.get('id');
        if (layerId != null) {
          const layerIndex = this.getLayerIndex(Number(layerId));
          if (layerIndex >= 0) {
            this.layerFg.patchValue(this.getLayerAt(layerIndex).value);
          } else {
            this.navigateToParentPage();
            this.logger.error('Unknown layer ID');
          }
        }
      });
    }
  }

  private navigateToParentPage() {
    this.router.navigate(['', 'map-config', 'layers']);
  }

  public submit() {

    // force validation check on mode subform
    this.submitSubject.next();
    if (!this.layerFg.valid) {
      this.logger.warn('validation failed', this.layerFg);
      return;
    }

    if (!this.isNewLayer()) {
      // delete current layer in order to recreate it with a new id
      const layerIndex = this.getLayerIndex(this.layerFg.get('id').value);
      if (layerIndex >= 0) {
        this.layersFa.removeAt(layerIndex);
      } else {
        this.logger.error('There was an error while saving the layer, unknown layer ID');
      }
    }

    const newId = this.layersValues.reduce((acc, val) => acc.id > val.id ? acc.id : val.id, 0) + 1;
    this.layerFg.patchValue({ id: newId });
    this.layersFa.insert(newId, this.layerFg);

    this.layerFg.markAsPristine();
    this.navigateToParentPage();
  }

  private getLayerIndex(id: number) {
    return this.layersValues.findIndex(el => el.id === id);
  }

  private getLayerAt(index: number) {
    return (this.layersFa.at(index) as FormGroup);
  }

  public isNewLayer(): boolean {
    return this.layerFg.get('id').value === '';
  }

  public canExit() {
    return this.forceCanExit || this.layerFg.pristine;
  }

}
