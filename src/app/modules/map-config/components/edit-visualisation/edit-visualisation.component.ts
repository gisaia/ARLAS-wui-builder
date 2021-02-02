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
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CanComponentExit } from '@guards/confirm-exit/confirm-exit.guard';
import { MainFormService } from '@services/main-form/main-form.service';
import { NGXLogger } from 'ngx-logger';
import {
  MapVisualisationFormGroup,
  MapVisualisationFormBuilderService
} from '@map-config/services/map-visualisation-form-builder/map-visualisation-form-builder.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-visualisation',
  templateUrl: './edit-visualisation.component.html',
  styleUrls: ['./edit-visualisation.component.scss']
})
export class EditVisualisationComponent implements OnInit, CanComponentExit, OnDestroy {

  private visualisationsFa: FormArray;
  private visualisationsValues: any[] = [];
  public forceCanExit: boolean;
  public visualisationFg: MapVisualisationFormGroup;
  public layers = new Array<string>();

  public routerSub: Subscription;

  constructor(
    protected mapVisualisationFormBuilder: MapVisualisationFormBuilderService,
    private mainFormService: MainFormService,
    private route: ActivatedRoute,
    private router: Router,
    private logger: NGXLogger) {
    this.visualisationFg = mapVisualisationFormBuilder.buildVisualisation();
  }

  public ngOnInit() {
    this.visualisationsFa = this.mainFormService.mapConfig.getVisualisationsFa();

    if (this.visualisationsFa == null) {
      this.logger.error('Error initializing the page, \'Visualisations\' form group is missing');
      this.navigateToParentPage();
    } else {

      this.visualisationsValues = this.visualisationsFa.value as any[];
      this.routerSub = this.route.paramMap.subscribe(params => {
        const visualisationId = params.get('id');
        if (visualisationId != null) {
          // there we are editing an existing visualisation
          const visualisationIndex = this.getVisualisationIndex(Number(visualisationId));
          if (visualisationIndex >= 0) {
            // cannot simply update the existing form instance because we want to allow cancellation
            // so we rather propagate the existing form properties
            const existingVisualisationFg = this.getVisualisationAt(visualisationIndex) as MapVisualisationFormGroup;
            this.visualisationFg.patchValue(existingVisualisationFg.value);
          } else {
            this.navigateToParentPage();
            this.logger.error('Unknown visualisation ID');
          }
          this.layers = this.visualisationFg.value.layers;
        }
      });
    }
  }

  public ngOnDestroy() {
    if (this.routerSub) { this.routerSub.unsubscribe(); }
  }

  private navigateToParentPage() {
    this.router.navigate(['', 'map-config', 'visualisations'], { queryParamsHandling: 'preserve' });
  }

  /** puts the visualisation set list in the new order after dropping */
  public drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.layers, event.previousIndex, event.currentIndex);
    this.visualisationFg.value.layers = this.layers;
    this.visualisationFg.setValue(this.visualisationFg.value);
  }

  public submit() {

    this.visualisationFg.markAllAsTouched();

    // force validation check on mode subform
    if (!this.visualisationFg.valid) {
      this.logger.warn('validation failed', this.visualisationFg);
      return;
    }
    const displayed = this.visualisationFg.value.displayed;
    const layers = this.visualisationFg.value.layers;
    if (displayed === '') {
      this.visualisationFg.value.displayed = false;
    }
    if (!layers || !Array.isArray(layers)) {
      this.visualisationFg.value.layers = [];
    }
    this.visualisationFg.setValue(this.visualisationFg.value);
    if (!this.isNewVisualisation()) {
      const visualisationIndex = this.getVisualisationIndex(this.visualisationFg.customControls.id.value);
      if (visualisationIndex < 0) {
        this.logger.error('There was an error while saving the visualisation, unknown visualisation ID');
      }
      this.visualisationsFa.setControl(visualisationIndex, this.visualisationFg);
    } else {
      const newId = this.visualisationsValues.reduce((acc, val) => acc.id > val.id ? acc.id : val.id, 0) + 1;
      this.visualisationFg.customControls.id.setValue(newId);
      this.visualisationsFa.insert(newId, this.visualisationFg);
    }

    this.visualisationFg.markAsPristine();
    this.navigateToParentPage();
  }

  private getVisualisationIndex(id: number) {
    return this.visualisationsValues.findIndex(el => el.id === id);
  }

  private getVisualisationAt(index: number) {
    return (this.visualisationsFa.at(index) as FormGroup);
  }

  public isNewVisualisation(): boolean {
    return this.visualisationFg.get('id').value === '';
  }

  public canExit() {
    return this.forceCanExit || this.visualisationFg.pristine;
  }

}
