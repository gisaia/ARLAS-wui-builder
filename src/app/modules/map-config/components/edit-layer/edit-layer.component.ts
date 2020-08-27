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
import { Component, OnInit, AfterContentChecked, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormArray, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CanComponentExit } from '@guards/confirm-exit/confirm-exit.guard';
import { MainFormService } from '@services/main-form/main-form.service';
import { NGXLogger } from 'ngx-logger';
import { LAYER_MODE } from './models';
import { MapLayerFormBuilderService, MapLayerFormGroup } from '@map-config/services/map-layer-form-builder/map-layer-form-builder.service';
import { ConfigFormGroupComponent } from '@shared-components/config-form-group/config-form-group.component';
import { KeywordColor } from '../dialog-color-table/models';
// tslint:disable-next-line: max-line-length
import { MapVisualisationFormBuilderService } from '@map-config/services/map-visualisation-form-builder/map-visualisation-form-builder.service';

@Component({
  selector: 'app-edit-layer',
  templateUrl: './edit-layer.component.html',
  styleUrls: ['./edit-layer.component.scss']
})
export class EditLayerComponent implements OnInit, CanComponentExit, AfterContentChecked {

  private layersFa: FormArray;
  private visualisationsFa: FormArray;
  private layersValues: any[] = [];
  public forceCanExit: boolean;
  public LAYER_MODE = LAYER_MODE;
  public layerFg: MapLayerFormGroup;

  @ViewChild(ConfigFormGroupComponent, { static: false }) private configFormGroupComponent: ConfigFormGroupComponent;

  constructor(
    protected mapLayerFormBuilder: MapLayerFormBuilderService,
    protected mapVisualisationFormBuilder: MapVisualisationFormBuilderService,
    private mainFormService: MainFormService,
    private route: ActivatedRoute,
    private cdref: ChangeDetectorRef,
    private router: Router,
    private logger: NGXLogger) {

    this.layerFg = mapLayerFormBuilder.buildLayer();
  }

  public ngOnInit() {

    this.layersFa = this.mainFormService.mapConfig.getLayersFa();
    this.visualisationsFa = this.mainFormService.mapConfig.getVisualisationsFa();

    if (this.layersFa == null) {
      this.logger.error('Error initializing the page, layers form group is missing');
      this.navigateToParentPage();
    } else {

      this.layersValues = this.layersFa.value as any[];
      this.route.paramMap.subscribe(params => {
        const layerId = params.get('id');
        if (layerId != null) {
          // there we are editing an existing layer
          const layerIndex = this.getLayerIndex(Number(layerId));
          if (layerIndex >= 0) {
            // cannot simply update the existing form instance because we want to allow cancellation
            // so we rather propagate the existing form properties
            const existingLayerFg = this.getLayerAt(layerIndex) as MapLayerFormGroup;
            this.layerFg.patchValue(existingLayerFg.value);
            this.populateManualValuesFormArray(existingLayerFg);


          } else {
            this.navigateToParentPage();
            this.logger.error('Unknown layer ID');
          }
        }
      });
    }
  }

  // you may ask yourself "hey, this b*** breaker Laurent always f**** me to avoid code duplication
  // and here is code duplication. This is Laurent last day, and he didn't find any way to avoid it
  // by keeping the whole typing. Figure it out.
  // PS: Sebastian, you're a jerk
  private populateManualValuesFormArray(existingLayerFg: MapLayerFormGroup) {
    (existingLayerFg.customControls.featuresFg.colorFg.customControls.propertyManualFg.propertyManualValuesCtrl.value
      || [] as Array<KeywordColor>).forEach(kc =>
        this.layerFg.customControls.featuresFg.colorFg.addToColorManualValuesCtrl(kc));

    (existingLayerFg.customControls.featureMetricFg.colorFg.customControls.propertyManualFg.propertyManualValuesCtrl.value
      || [] as Array<KeywordColor>).forEach(kc =>
        this.layerFg.customControls.featureMetricFg.colorFg.addToColorManualValuesCtrl(kc));

    (existingLayerFg.customControls.clusterFg.colorFg.customControls.propertyManualFg.propertyManualValuesCtrl.value
      || [] as Array<KeywordColor>).forEach(kc =>
        this.layerFg.customControls.clusterFg.colorFg.addToColorManualValuesCtrl(kc));

  }

  private navigateToParentPage() {
    this.router.navigate(['', 'map-config', 'layers'], { queryParamsHandling: 'preserve' });
  }

  public submit() {

    this.configFormGroupComponent.submit();
    this.layerFg.markAllAsTouched();

    // force validation check on mode subform
    if (!this.layerFg.valid) {
      this.logger.warn('validation failed', this.layerFg);
      return;
    }
    const savedVisualisations = this.layerFg.customControls.visualisation.syncOptions;
    const visualisationValue = this.visualisationsFa.value;
    const layerName = this.layerFg.customControls.name.value;
    if (savedVisualisations.length <= 1 && this.visualisationsFa.length === 0) {
      // if we create a layer and there is no visualisation set yet, then
      // we create a visualisation set called 'All layers' and assign the
      // layer to it
      const visualisationFg = this.mapVisualisationFormBuilder.buildVisualisation();
      visualisationFg.customControls.displayed.setValue(true);
      visualisationFg.customControls.name.setValue('All layers');
      visualisationFg.customControls.layers.setValue([layerName]);
      visualisationFg.customControls.id.setValue(0);
      this.visualisationsFa.insert(0, visualisationFg);
    } else {
      // we update the visualisations form array base on the checked visualisations of the
      // created/edited layer
      visualisationValue.forEach(v => {
        const visu = savedVisualisations.find(vs => vs.name === v.name);
        const set = new Set(v.layers);
        visu.include ? set.add(layerName) : set.delete(layerName) ;
        v.layers = Array.from(set);
      });
      this.visualisationsFa.setValue(visualisationValue);
    }
    if (!this.isNewLayer()) {
      const layerIndex = this.getLayerIndex(this.layerFg.customControls.id.value);
      if (layerIndex < 0) {
        this.logger.error('There was an error while saving the layer, unknown layer ID');
      }
      this.layersFa.setControl(layerIndex, this.layerFg);
    } else {
      const newId = this.layersValues.reduce((acc, val) => acc.id > val.id ? acc.id : val.id, 0) + 1;
      this.layerFg.customControls.id.setValue(newId);
      this.layersFa.insert(newId, this.layerFg);
    }

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

  public ngAfterContentChecked() {
    // fix ExpressionChangedAfterItHasBeenCheckedError
    this.cdref.detectChanges();
  }

}
