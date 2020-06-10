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
import { AbstractControl } from '@angular/forms';
import {
  GEOMETRY_TYPE, CLUSTER_GEOMETRY_TYPE, GRANULARITY, AGGREGATE_GEOMETRY_TYPE
} from './models';
import {
  PropertySelectorFormGroup, PropertySelectorFormBuilderService
} from '@shared/services/property-selector-form-builder/property-selector-form-builder.service';
import { PROPERTY_TYPE, PROPERTY_SELECTOR_SOURCE } from '@shared-services/property-selector-form-builder/models';
import { CollectionField } from '@services/collection-service/models';
import { CollectionService } from '@services/collection-service/collection.service';
import { toGeoOptionsObs, toKeywordOptionsObs, toGeoPointOptionsObs, toAllButGeoOptionsObs } from '@services/collection-service/tools';
import { MainFormService } from '@services/main-form/main-form.service';
import {
  SelectFormControl, HiddenFormControl, SlideToggleFormControl,
  SliderFormControl,
  ConfigFormGroup,
  InputFormControl,
  SelectOption,
  OrderedSelectFormControl
} from '@shared-models/config-form';
import { LAYER_MODE } from '@map-config/components/edit-layer/models';
import { Observable } from 'rxjs';
import { valuesToOptions } from '@utils/tools';
import { DefaultValuesService } from '@services/default-values/default-values.service';

export class MapLayerFormGroup extends ConfigFormGroup {

  constructor(
    featuresFg: MapLayerTypeFeaturesFormGroup,
    featureMetricFg: MapLayerTypeFeatureMetricFormGroup,
    clusterFg: MapLayerTypeClusterFormGroup,
  ) {
    super({
      name: new InputFormControl(
        '',
        'Name',
        'Name of the layer. Only used for visualization.',
        'text',
        {
          childs: () => [this.customControls.id]
        }),
      mode: new SelectFormControl(
        '',
        'Mode',
        'Mode of the layer.',
        false,
        [
          { label: LAYER_MODE.features, value: LAYER_MODE.features },
          { label: LAYER_MODE.featureMetric, value: LAYER_MODE.featureMetric },
          { label: LAYER_MODE.cluster, value: LAYER_MODE.cluster }
        ],
        {
          resetDependantsOnChange: true
        }
      ),
      id: new HiddenFormControl(
        '',
        null,
        {
          optional: true
        }),
      featuresFg: featuresFg
        .withDependsOn(() => [this.customControls.mode])
        .withOnDependencyChange(
          (control) => control.enableIf(this.customControls.mode.value === LAYER_MODE.features)),
      featureMetricFg: featureMetricFg
        .withDependsOn(() => [this.customControls.mode])
        .withOnDependencyChange(
          (control) => control.enableIf(this.customControls.mode.value === LAYER_MODE.featureMetric)),
      clusterFg: clusterFg
        .withDependsOn(() => [this.customControls.mode])
        .withOnDependencyChange(
          (control) => control.enableIf(this.customControls.mode.value === LAYER_MODE.cluster)),
    });
  }

  public customControls = {
    name: this.get('name') as InputFormControl,
    mode: this.get('mode') as SelectFormControl,
    id: this.get('id') as HiddenFormControl,
    featuresFg: this.get('featuresFg') as MapLayerTypeFeaturesFormGroup,
    featureMetricFg: this.get('featureMetricFg') as MapLayerTypeFeatureMetricFormGroup,
    clusterFg: this.get('clusterFg') as MapLayerTypeClusterFormGroup
  };
}

export class MapLayerAllTypesFormGroup extends ConfigFormGroup {

  constructor(
    collections: Array<string>,
    geometryTypes: Array<GEOMETRY_TYPE>,
    propertySelectorFormBuilder: PropertySelectorFormBuilderService,
    isAggregated: boolean,
    colorSources: Array<PROPERTY_SELECTOR_SOURCE>,
    geometryFormControls: { [key: string]: AbstractControl },
    visibilityFormControls: { [key: string]: AbstractControl },
    styleFormControls: { [key: string]: AbstractControl }
  ) {
    super({
      collectionStep: new ConfigFormGroup({
        collection: new SelectFormControl(
          collections.length === 1 ? collections[0] : '',
          'Collection',
          '',
          false,
          collections.map(c => ({ label: c, value: c }))
        )
      }).withStepName('Collection'),
      geometryStep: new ConfigFormGroup({
        ...geometryFormControls
      }).withStepName('Geometry'),
      visibilityStep: new ConfigFormGroup({
        visible: new SlideToggleFormControl(
          '',
          'Visible',
          'Description'
        ),
        zoomMin: new SliderFormControl(
          '',
          'Zoom min',
          'zoom min etc.',
          1,
          20,
          1,
          () => this.zoomMax
        ),
        zoomMax: new SliderFormControl(
          '',
          'Zoom min',
          'zoom min etc.',
          1,
          20,
          1,
          undefined,
          () => this.zoomMin
        ),
        ...visibilityFormControls
      }).withStepName('Visibility'),
      styleStep: new ConfigFormGroup({
        ...styleFormControls,
        geometryType: new SelectFormControl(
          '',
          'Geometry type',
          '',
          false,
          valuesToOptions(geometryTypes),
          {
            resetDependantsOnChange: true
          }
        ),
        opacity: new SliderFormControl(
          '',
          'Opacity',
          'opacity ...',
          0,
          1,
          0.1
        ),

        colorFg: propertySelectorFormBuilder.build(
          PROPERTY_TYPE.color,
          'color',
          colorSources,
          isAggregated,
          geometryTypes.indexOf(GEOMETRY_TYPE.heatmap) >= 0 ? () => this.geometryType : undefined),

        widthFg: propertySelectorFormBuilder.build(
          PROPERTY_TYPE.number,
          'width',
          [
            PROPERTY_SELECTOR_SOURCE.fix, PROPERTY_SELECTOR_SOURCE.interpolated
          ],
          isAggregated)
          .withDependsOn(() => [this.geometryType])
          .withOnDependencyChange((control) => control.enableIf(this.geometryType.value === GEOMETRY_TYPE.line)),

        radiusFg: propertySelectorFormBuilder.build(
          PROPERTY_TYPE.number,
          'radius',
          [
            PROPERTY_SELECTOR_SOURCE.fix, PROPERTY_SELECTOR_SOURCE.interpolated
          ],
          isAggregated)
          .withDependsOn(() => [this.geometryType])
          .withOnDependencyChange((control) => control.enableIf(this.geometryType.value === GEOMETRY_TYPE.circle
            || this.geometryType.value === GEOMETRY_TYPE.heatmap)),

        weightFg: propertySelectorFormBuilder.build(
          PROPERTY_TYPE.number,
          'weight',
          [
            PROPERTY_SELECTOR_SOURCE.fix, PROPERTY_SELECTOR_SOURCE.interpolated
          ],
          isAggregated)
          .withDependsOn(() => [this.geometryType])
          .withOnDependencyChange((control) => control.enableIf(this.geometryType.value === GEOMETRY_TYPE.heatmap)),

        intensityFg: propertySelectorFormBuilder.build(
          PROPERTY_TYPE.number,
          'intensity',
          [
            PROPERTY_SELECTOR_SOURCE.fix
          ],
          isAggregated)
          .withDependsOn(() => [this.geometryType])
          .withOnDependencyChange((control) => control.enableIf(this.geometryType.value === GEOMETRY_TYPE.heatmap))

      }).withStepName('Style')
    });

  }

  // TODO use customControls like other form builders
  public get collectionStep() { return this.get('collectionStep') as ConfigFormGroup; }
  public get geometryStep() { return this.get('geometryStep') as ConfigFormGroup; }
  public get visibilityStep() { return this.get('visibilityStep') as ConfigFormGroup; }
  public get styleStep() { return this.get('styleStep') as ConfigFormGroup; }
  public get collection() { return this.collectionStep.get('collection') as SelectFormControl; }
  public get visible() { return this.visibilityStep.get('visible') as SlideToggleFormControl; }
  public get zoomMin() { return this.visibilityStep.get('zoomMin') as SliderFormControl; }
  public get zoomMax() { return this.visibilityStep.get('zoomMax') as SliderFormControl; }
  public get geometryType() { return this.styleStep.get('geometryType') as SelectFormControl; }
  public get opacity() { return this.styleStep.get('opacity') as PropertySelectorFormGroup; }
  public get colorFg() { return this.styleStep.get('colorFg') as PropertySelectorFormGroup; }
  public get widthFg() { return this.styleStep.get('widthFg') as PropertySelectorFormGroup; }
  public get radiusFg() { return this.styleStep.get('radiusFg') as PropertySelectorFormGroup; }
  public get weightFg() { return this.styleStep.get('weightFg') as PropertySelectorFormGroup; }
  public get intensityFg() { return this.styleStep.get('intensityFg') as PropertySelectorFormGroup; }

}

export class MapLayerTypeFeaturesFormGroup extends MapLayerAllTypesFormGroup {

  constructor(
    collections: Array<string>,
    collectionFields: Observable<Array<CollectionField>>,
    propertySelectorFormBuilder: PropertySelectorFormBuilderService,
    isAggregated: boolean = false,
    geometryFormControls: { [key: string]: AbstractControl } = {}
  ) {

    super(
      collections,
      [
        GEOMETRY_TYPE.fill,
        GEOMETRY_TYPE.line,
        GEOMETRY_TYPE.circle
      ],
      propertySelectorFormBuilder,
      isAggregated,
      [
        PROPERTY_SELECTOR_SOURCE.fix, PROPERTY_SELECTOR_SOURCE.interpolated, PROPERTY_SELECTOR_SOURCE.generated,
        PROPERTY_SELECTOR_SOURCE.manual, PROPERTY_SELECTOR_SOURCE.provided
      ],
      {
        geometry: new SelectFormControl(
          '',
          'Rendered geometry',
          '',
          false,
          toGeoOptionsObs(collectionFields),
          {
            title: 'Rendered geometry'
          }
        ),
        ...geometryFormControls
      }, {
      featuresMax: new SliderFormControl(
        '',
        'Features max',
        'Features max etc...',
        0,
        10000,
        100
      )
    }, {
    });
  }

  public get geometry() { return this.geometryStep.get('geometry') as SelectFormControl; }
  public get featuresMax() { return this.visibilityStep.get('featuresMax') as SliderFormControl; }
  public get geometryType() { return this.styleStep.get('geometryType') as SelectFormControl; }
}

export class MapLayerTypeFeatureMetricFormGroup extends MapLayerTypeFeaturesFormGroup {

  constructor(
    collections: Array<string>,
    collectionFields: Observable<Array<CollectionField>>,
    propertySelectorFormBuilder: PropertySelectorFormBuilderService
  ) {
    super(
      collections,
      collectionFields,
      propertySelectorFormBuilder,
      true,
      {
        geometryId: new SelectFormControl(
          '',
          'Geometry ID',
          '',
          true,
          toKeywordOptionsObs(collectionFields)
        ),
        granularity: new SelectFormControl(
          '',
          'Granularity',
          '',
          false,
          [
            { label: 'Coarse', value: GRANULARITY.coarse },
            { label: 'Fine', value: GRANULARITY.fine },
            { label: 'Finest', value: GRANULARITY.finest },
          ],
          {
            title: 'Granularity'
          }
        )
      });
  }
}

export class MapLayerTypeClusterFormGroup extends MapLayerAllTypesFormGroup {

  constructor(
    collections: Array<string>,
    collectionFields: Observable<Array<CollectionField>>,
    propertySelectorFormBuilder: PropertySelectorFormBuilderService
  ) {
    super(
      collections,
      [
        GEOMETRY_TYPE.fill,
        GEOMETRY_TYPE.circle,
        GEOMETRY_TYPE.heatmap
      ],
      propertySelectorFormBuilder,
      true,
      [
        PROPERTY_SELECTOR_SOURCE.fix, PROPERTY_SELECTOR_SOURCE.interpolated
      ],
      {
        aggGeometry: new SelectFormControl(
          '',
          'Aggregation field',
          'Choose the aggregation field...',
          false,
          toGeoPointOptionsObs(collectionFields),
          {
            title: 'Requested geometry'
          }
        ),
        granularity: new SelectFormControl(
          '',
          'Granularity',
          '',
          false,
          [
            { label: 'Coarse', value: GRANULARITY.coarse },
            { label: 'Fine', value: GRANULARITY.fine },
            { label: 'Finest', value: GRANULARITY.finest },
          ]
        ),
        clusterGeometryType: new SelectFormControl(
          '',
          'Type',
          '',
          false,
          [
            { label: 'Aggregated geometry', value: CLUSTER_GEOMETRY_TYPE.aggregated_geometry },
            { label: 'Raw Geometry', value: CLUSTER_GEOMETRY_TYPE.raw_geometry }
          ],
          {
            resetDependantsOnChange: true,
            title: 'Displayed geometry'
          }
        ),
        aggregatedGeometry: new SelectFormControl(
          '',
          'Type',
          '',
          false,
          [
            { label: 'Cell center', value: AGGREGATE_GEOMETRY_TYPE.geohash_center },
            { label: 'Cell', value: AGGREGATE_GEOMETRY_TYPE.geohash },
            { label: 'Data cell bbox', value: AGGREGATE_GEOMETRY_TYPE.bbox },
            { label: 'Data cell centroid', value: AGGREGATE_GEOMETRY_TYPE.centroid }
          ],
          {
            dependsOn: () => [this.clusterGeometryType],
            onDependencyChange: (control) => control.enableIf(this.clusterGeometryType.value === CLUSTER_GEOMETRY_TYPE.aggregated_geometry)
          }
        ),
        rawGeometry: new SelectFormControl(
          '',
          'Field',
          '',
          false,
          toGeoOptionsObs(collectionFields),
          {
            resetDependantsOnChange: true,
            dependsOn: () => [this.clusterGeometryType],
            onDependencyChange: (control) => control.enableIf(this.clusterGeometryType.value === CLUSTER_GEOMETRY_TYPE.raw_geometry)

          }
        ),
        clusterSort: new OrderedSelectFormControl(
          '',
          'Order field',
          '',
          false,
          toAllButGeoOptionsObs(collectionFields),
          {
            dependsOn: () => [this.clusterGeometryType, this.rawGeometry],
            onDependencyChange: (control) =>
              control.enableIf(this.clusterGeometryType.value === CLUSTER_GEOMETRY_TYPE.raw_geometry && !!this.rawGeometry.value)
          }
        ),
      },
      {
        featuresMin: new SliderFormControl(
          '',
          'Minimum features',
          'Minimum number of features to display this layer',
          0,
          10000,
          100
        )
      },
      {
      }
    );

  }

  public get aggGeometry() { return this.geometryStep.get('aggGeometry') as SelectFormControl; }
  public get granularity() { return this.geometryStep.get('granularity') as SelectFormControl; }
  public get clusterGeometryType() { return this.geometryStep.get('clusterGeometryType') as SelectFormControl; }
  public get aggregatedGeometry() { return this.geometryStep.get('aggregatedGeometry') as SelectFormControl; }
  public get rawGeometry() { return this.geometryStep.get('rawGeometry') as SelectFormControl; }
  public get clusterSort() { return this.geometryStep.get('clusterSort') as SelectFormControl; }
  public get featuresMin() { return this.visibilityStep.get('featuresMin') as SliderFormControl; }
  public get geometryType() { return this.styleStep.get('geometryType') as SelectFormControl; }
}

@Injectable({
  providedIn: 'root'
})
export class MapLayerFormBuilderService {

  constructor(
    private defaultValuesService: DefaultValuesService,
    private propertySelectorFormBuilder: PropertySelectorFormBuilderService,
    private mainFormService: MainFormService,
    private collectionService: CollectionService
  ) { }

  public buildLayer() {
    const collectionFields = this.collectionService.getCollectionFields(
      this.mainFormService.getCollections()[0]
    );

    const mapLayerFormGroup = new MapLayerFormGroup(
      this.buildFeatures(collectionFields),
      this.buildFeatureMetric(collectionFields),
      this.buildCluster(collectionFields)
    );
    this.defaultValuesService.setDefaultValueRecursively('map.layer', mapLayerFormGroup);
    return mapLayerFormGroup;
  }

  private buildFeatures(collectionFields: Observable<Array<CollectionField>>) {
    const featureFormGroup = new MapLayerTypeFeaturesFormGroup(
      this.mainFormService.getCollections(),
      collectionFields,
      this.propertySelectorFormBuilder);

    this.defaultValuesService.setDefaultValueRecursively('map.layer', featureFormGroup);
    return featureFormGroup;
  }

  private buildFeatureMetric(collectionFields: Observable<Array<CollectionField>>) {
    const featureMetricFormGroup = new MapLayerTypeFeatureMetricFormGroup(
      this.mainFormService.getCollections(),
      collectionFields,
      this.propertySelectorFormBuilder);

    this.defaultValuesService.setDefaultValueRecursively('map.layer', featureMetricFormGroup);
    return featureMetricFormGroup;
  }

  private buildCluster(collectionFields: Observable<Array<CollectionField>>) {
    const clusterFormGroup = new MapLayerTypeClusterFormGroup(
      this.mainFormService.getCollections(),
      collectionFields,
      this.propertySelectorFormBuilder);

    this.defaultValuesService.setDefaultValueRecursively('map.layer', clusterFormGroup);
    return clusterFormGroup;
  }


}
