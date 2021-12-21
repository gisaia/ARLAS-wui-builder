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
import { AfterContentChecked, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CanComponentExit } from '@guards/confirm-exit/confirm-exit.guard';
import { MapLayerFormBuilderService, MapLayerFormGroup } from '@map-config/services/map-layer-form-builder/map-layer-form-builder.service';
import {
  MapVisualisationFormBuilderService
} from '@map-config/services/map-visualisation-form-builder/map-visualisation-form-builder.service';
import { ARLAS_ID, MainFormService } from '@services/main-form/main-form.service';
import { ConfigFormGroupComponent } from '@shared-components/config-form-group/config-form-group.component';
import { NGXLogger } from 'ngx-logger';
import { Subscription } from 'rxjs';
import { KeywordColor } from '../dialog-color-table/models';
import { LAYER_MODE } from './models';

@Component({
  selector: 'arlas-edit-layer',
  templateUrl: './edit-layer.component.html',
  styleUrls: ['./edit-layer.component.scss']
})
export class EditLayerComponent implements OnInit, CanComponentExit, AfterContentChecked, OnDestroy {

  private layersFa: FormArray;
  private visualisationsFa: FormArray;
  private layersValues: any[] = [];
  public forceCanExit: boolean;
  public LAYER_MODE = LAYER_MODE;
  public layerFg: MapLayerFormGroup;

  private routerSub: Subscription;

  @ViewChild(ConfigFormGroupComponent, { static: false }) private configFormGroupComponent: ConfigFormGroupComponent;

  public constructor(
    protected mapLayerFormBuilder: MapLayerFormBuilderService,
    protected mapVisualisationFormBuilder: MapVisualisationFormBuilderService,
    private mainFormService: MainFormService,
    private route: ActivatedRoute,
    private cdref: ChangeDetectorRef,
    private router: Router,
    private logger: NGXLogger) {
  }

  public ngOnInit() {

    this.layersFa = this.mainFormService.mapConfig.getLayersFa();
    this.visualisationsFa = this.mainFormService.mapConfig.getVisualisationsFa();

    if (this.layersFa == null) {
      this.logger.error('Error initializing the page, layers form group is missing');
      this.navigateToParentPage();
    } else {
      this.layersValues = this.layersFa.value as any[];
      this.routerSub = this.route.paramMap.subscribe(params => {
        const layerId = params.get('id');
        if (!layerId) {
          this.layerFg = this.mapLayerFormBuilder.buildLayer(this.mainFormService.getMainCollection(), false);
        } else {
          // there we are editing an existing layer
          const layerIndex = this.getLayerIndex(Number(layerId));
          if (layerIndex >= 0) {
            // cannot simply update the existing form instance because we want to allow cancellation
            // so we rather propagate the existing form properties
            const existingLayerFg = this.getLayerAt(layerIndex) as MapLayerFormGroup;
            this.layerFg = this.mapLayerFormBuilder.buildLayer(existingLayerFg.customControls.collection.value, true);
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
      || [] as Array<KeywordColor>)
      .forEach(kc =>
        this.layerFg.customControls.featuresFg.colorFg.addToColorManualValuesCtrl(kc));

    (existingLayerFg.customControls.featureMetricFg.colorFg.customControls.propertyManualFg.propertyManualValuesCtrl.value
      || [] as Array<KeywordColor>)
      .forEach(kc =>
        this.layerFg.customControls.featureMetricFg.colorFg.addToColorManualValuesCtrl(kc));

    (existingLayerFg.customControls.clusterFg.colorFg.customControls.propertyManualFg.propertyManualValuesCtrl.value
      || [] as Array<KeywordColor>)
      .forEach(kc =>
        this.layerFg.customControls.clusterFg.colorFg.addToColorManualValuesCtrl(kc));

  }

  private navigateToParentPage() {
    this.router.navigate(['', 'map-config', 'layers'], { queryParamsHandling: 'preserve' });
  }

  public submit() {
    const oldLayerId = this.layerFg.customControls.arlasId.value;
    this.configFormGroupComponent.submit();
    this.layerFg.markAllAsTouched();

    // force validation check on mode subform
    if (!this.layerFg.valid) {
      this.logger.warn('validation failed', this.layerFg);
      return;
    }
    // sets the layer id : 'arlas_id:NAME:creationDate
    this.layerFg.customControls.arlasId.setValue(ARLAS_ID + this.layerFg.customControls.name.value + ':' + Date.now());
    /** add the layer to list of layers */
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

    // if we create a layer and there is no visualisation set yet, then
    // we propose a visualisation set called 'All layers'
    // if the user check it, the visualisation set 'All layers' is created, if the user doesn't check it, 'All layers' is not created

    const savedVisualisations = this.layerFg.customControls.visualisation.syncOptions;
    const visualisationValue = this.visualisationsFa.value;
    const newLayerId = this.layerFg.customControls.arlasId.value;

    if (savedVisualisations.length <= 1 && this.visualisationsFa.length === 0) {
      const allLayers = [];
      if (this.layerFg.customControls.visualisation.value && this.layerFg.customControls.visualisation.value.length > 0) {
        if (this.layerFg.customControls.visualisation.value[0].include) {
          allLayers.push(newLayerId);
          const visualisationFg = this.mapVisualisationFormBuilder.buildVisualisation();
          visualisationFg.customControls.displayed.setValue(true);
          visualisationFg.customControls.name.setValue('All layers');
          visualisationFg.customControls.layers.setValue(allLayers);
          visualisationFg.customControls.id.setValue(0);
          this.visualisationsFa.insert(0, visualisationFg);
        }
      }
    } else {
      // we update the visualisations form array based on the checked visualisations of the
      // created/edited layer
      const savedLayers = new Set<string>(this.layersFa.value.map(l => l.arlasId));
      visualisationValue.forEach(v => {
        const visu = savedVisualisations.find(vs => vs.name === v.name);
        // in case of renaming a layer, we should remove the old name from the visualisation sets
        const layersSet = new Set<string>();
        const oldLayers = new Set<string>(v.layers);
        v.layers.forEach(l => {
          if (savedLayers.has(l)) {
            layersSet.add(l);
          }
        });
        if (visu.include) {
          layersSet.add(newLayerId);
        } else {
          layersSet.delete(newLayerId);
        }
        /** to preserve layers order */
        const layers = [];
        /** take all the already existing layers and add them in the correct order */
        v.layers.forEach(l => {
          /** if the oldlayer is edited and still affected to visualisation set
           * we should replace it with new layer id in the correct position
           */
          if (l === oldLayerId && layersSet.has(newLayerId)) {
            layers.push(newLayerId);
            oldLayers.delete(oldLayerId);
            oldLayers.add(newLayerId);
          } else if (layersSet.has(l)) {
            layers.push(l);
          }
        });

        /** if the new (edited) layer was not in the visualisation set already, we should add it */
        if (!oldLayers.has(newLayerId) && layersSet.has(newLayerId)) {
          layers.push(newLayerId);
        }

        v.layers = layers;
        v.displayed = (v.displayed === undefined) ? true : v.displayed;
      });

      this.visualisationsFa.setValue(visualisationValue);
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

  public ngOnDestroy() {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
    this.configFormGroupComponent = null;
    this.layersFa = null;
    this.visualisationsFa = null;
    this.layersValues = null;
    this.forceCanExit = null;
    this.LAYER_MODE = null;
    this.layerFg = null;
  }

}
