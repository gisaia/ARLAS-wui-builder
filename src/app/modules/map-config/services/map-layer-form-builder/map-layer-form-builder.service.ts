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
import { Injectable } from '@angular/core';
import { FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';
import { CustomValidators } from '@utils/custom-validators';
import { GEOMETRY_TYPE, CLUSTER_GEOMETRY_TYPE } from '@map-config/components/edit-layer-mode-form/models';

export class MapLayerFormGroup extends FormGroup {

  constructor() {
    super({
      name: new FormControl('', Validators.required),
      mode: new FormControl('', Validators.required),
      id: new FormControl(''),
      featuresFg: new FormControl({ value: null, disabled: true }, Validators.required),
      featureMetricFg: new FormControl({ value: null, disabled: true }, Validators.required),
      clusterFg: new FormControl({ value: null, disabled: true }, Validators.required)
    });
  }

  public customControls = {
    name: this.get('name') as FormControl,
    mode: this.get('mode') as FormControl,
    id: this.get('id') as FormControl,
    featuresFg: this.get('featuresFg') as FormControl,
    featureMetricFg: this.get('featureMetricFg') as FormControl,
    clusterFg: this.get('clusterFg') as FormControl
  };
}

export class MapLayerAllTypesFormGroup extends FormGroup {

  constructor(
    geometryFormControls: { [key: string]: AbstractControl },
    visibilityFormControls: { [key: string]: AbstractControl },
    styleFormControls: { [key: string]: AbstractControl }
  ) {
    super({
      collectionStep: new FormGroup({
        collection: new FormControl(
          null,
          Validators.required
        )
      }),
      geometryStep: new FormGroup({
        ...geometryFormControls
      }),
      visibilityStep: new FormGroup({
        visible: new FormControl(),
        zoomMin: new FormControl(null, [Validators.required, Validators.min(1), Validators.max(20)]),
        zoomMax: new FormControl(null, [Validators.required, Validators.min(1), Validators.max(20)]),
        ...visibilityFormControls
      },
        CustomValidators.getLTEValidator('zoomMin', 'zoomMax')
      ),
      styleStep: new FormGroup({
        opacity: new FormControl(),
        colorFg: new FormControl(null, Validators.required),
        widthFg: new FormControl(),
        radiusFg: new FormControl(),
        weightFg: new FormControl(),
        intensityFg: new FormControl(),
        ...styleFormControls
      })
    });

    // geometryType is created by implementations, no getter yet
    // TODO validators should probably rather be added from implementations
    const geometryTypeCtrl = this.get('styleStep').get('geometryType');
    this.widthFg.setValidators(
      CustomValidators.getConditionalValidator(
        () => !!geometryTypeCtrl && geometryTypeCtrl.value === GEOMETRY_TYPE.line,
        Validators.required
      ));

    this.radiusFg.setValidators(
      CustomValidators.getConditionalValidator(
        () => !!geometryTypeCtrl && [GEOMETRY_TYPE.circle, GEOMETRY_TYPE.heatmap].indexOf(geometryTypeCtrl.value) >= 0,
        Validators.required
      ));

    this.weightFg.setValidators(
      CustomValidators.getConditionalValidator(
        () => !!geometryTypeCtrl && geometryTypeCtrl.value === GEOMETRY_TYPE.heatmap,
        Validators.required
      ));

    this.intensityFg.setValidators(
      CustomValidators.getConditionalValidator(
        () => !!geometryTypeCtrl && geometryTypeCtrl.value === GEOMETRY_TYPE.heatmap,
        Validators.required
      ));
  }

  public get collectionStep() { return this.get('collectionStep'); }
  public get geometryStep() { return this.get('geometryStep'); }
  public get visibilityStep() { return this.get('visibilityStep'); }
  public get styleStep() { return this.get('styleStep'); }
  public get collection() { return this.collectionStep.get('collection'); }
  public get visible() { return this.visibilityStep.get('visible'); }
  public get zoomMin() { return this.visibilityStep.get('zoomMin'); }
  public get zoomMax() { return this.visibilityStep.get('zoomMax'); }
  public get opacity() { return this.styleStep.get('opacity'); }
  public get colorFg() { return this.styleStep.get('colorFg'); }
  public get widthFg() { return this.styleStep.get('widthFg'); }
  public get radiusFg() { return this.styleStep.get('radiusFg'); }
  public get weightFg() { return this.styleStep.get('weightFg'); }
  public get intensityFg() { return this.styleStep.get('intensityFg'); }

}

export class MapLayerTypeFeaturesFormGroup extends MapLayerAllTypesFormGroup {

  constructor(
    geometryFormControls: { [key: string]: AbstractControl } = {},
  ) {

    super({
      geometry: new FormControl(null, Validators.required),
      ...geometryFormControls
    }, {
      featuresMax: new FormControl(
        null,
        [
          Validators.required,
          Validators.max(10000),
          Validators.min(0)
        ]
      )
    }, {
      geometryType: new FormControl(null, Validators.required)
    });
  }

  public get geometry() { return this.geometryStep.get('geometry'); }
  public get featuresMax() { return this.visibilityStep.get('featuresMax'); }
  public get geometryType() { return this.styleStep.get('geometryType'); }
}

export class MapLayerTypeFeatureMetricFormGroup extends MapLayerTypeFeaturesFormGroup {

  constructor() {
    super({
      geometryId: new FormControl(null, Validators.required),
      granularity: new FormControl(null, Validators.required)
    });
  }
}

export class MapLayerTypeClusterFormGroup extends MapLayerAllTypesFormGroup {

  constructor() {
    super({
      aggGeometry: new FormControl(null, Validators.required),
      granularity: new FormControl(null, Validators.required),
      clusterGeometryType: new FormControl(null, Validators.required),
      aggregatedGeometry: new FormControl(null, Validators.required),
      rawGeometry: new FormControl(null, Validators.required),
      clusterSort: new FormControl(null),
    },
      {
        featuresMin: new FormControl(null, Validators.required)
      }, {
      geometryType: new FormControl(null, Validators.required)
    });

    this.aggregatedGeometry.setValidators(
      CustomValidators.getConditionalValidator(
        () => this.clusterGeometryType.value === CLUSTER_GEOMETRY_TYPE.aggregated_geometry,
        Validators.required
      ));

    this.rawGeometry.setValidators(
      CustomValidators.getConditionalValidator(
        () => this.clusterGeometryType.value === CLUSTER_GEOMETRY_TYPE.raw_geometry,
        Validators.required
      ));
  }

  public get aggGeometry() { return this.geometryStep.get('aggGeometry'); }
  public get granularity() { return this.geometryStep.get('granularity'); }
  public get clusterGeometryType() { return this.geometryStep.get('clusterGeometryType'); }
  public get aggregatedGeometry() { return this.geometryStep.get('aggregatedGeometry'); }
  public get rawGeometry() { return this.geometryStep.get('rawGeometry'); }
  public get clusterSort() { return this.geometryStep.get('clusterSort'); }
  public get featuresMin() { return this.visibilityStep.get('featuresMin'); }
  public get geometryType() { return this.styleStep.get('geometryType'); }
}

@Injectable({
  providedIn: 'root'
})
export class MapLayerFormBuilderService {

  constructor(
    private formBuilderDefault: FormBuilderWithDefaultService
  ) { }

  public buildLayer() {
    const mapLayerFormGroup = new MapLayerFormGroup();
    this.formBuilderDefault.setDefaultValueRecursively('map.layer', mapLayerFormGroup);
    return mapLayerFormGroup;
  }

  public buildFeatures() {
    const featureFormGroup = new MapLayerTypeFeaturesFormGroup();
    this.formBuilderDefault.setDefaultValueRecursively('map.layer', featureFormGroup);
    return featureFormGroup;
  }

  public buildFeatureMetric() {
    const featureMetricFormGroup = new MapLayerTypeFeatureMetricFormGroup();
    this.formBuilderDefault.setDefaultValueRecursively('map.layer', featureMetricFormGroup);
    return featureMetricFormGroup;
  }

  public buildCluster() {
    const clusterFormGroup = new MapLayerTypeClusterFormGroup();
    this.formBuilderDefault.setDefaultValueRecursively('map.layer', clusterFormGroup);
    return clusterFormGroup;
  }


}
