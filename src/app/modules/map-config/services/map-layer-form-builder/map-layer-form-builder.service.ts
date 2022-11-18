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
import { AbstractControl, FormArray, FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { LAYER_MODE } from '@map-config/components/edit-layer/models';
import tilebelt from '@mapbox/tilebelt';
import { CollectionService, METRIC_TYPES } from '@services/collection-service/collection.service';
import { CollectionField } from '@services/collection-service/models';
import {
  toAllButGeoOptionsObs, toGeoOptionsObs, toGeoPointOptionsObs, toKeywordOptionsObs, toNumericOrDateOptionsObs,
  toNumericOrDateOrKeywordObs, toNumericOrDateOrKeywordOrBooleanObs, toTextOrKeywordOptionsObs
} from '@services/collection-service/tools';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { MainFormService } from '@services/main-form/main-form.service';
import {
  ConfigFormGroup, HiddenFormControl,
  InputFormControl, MapFiltersControl, MultipleSelectFormControl, OrderedSelectFormControl, SelectFormControl,
  SelectOption, SliderFormControl, SlideToggleFormControl, TypedSelectFormControl,
  VisualisationCheckboxFormControl, VisualisationCheckboxOption
} from '@shared-models/config-form';
import { PROPERTY_SELECTOR_SOURCE, PROPERTY_TYPE } from '@shared-services/property-selector-form-builder/models';
import {
  PropertySelectorFormBuilderService, PropertySelectorFormGroup
} from '@shared/services/property-selector-form-builder/property-selector-form-builder.service';
import { valuesToOptions } from '@utils/tools';
import { CollectionReferenceDescriptionProperty } from 'arlas-api';
import { ClusterAggType, FeatureRenderMode, Granularity } from 'arlas-web-contributors/models/models';
import { Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';
import {
  AGGREGATE_GEOMETRY_TYPE, CLUSTER_GEOMETRY_TYPE, FILTER_OPERATION,
  GEOMETRY_TYPE, LINE_TYPE, LABEL_ALIGNMENT, LABEL_PLACEMENT
} from './models';
import { ButtonToggleFormControl } from '@shared-models/config-form';
import { toNumericOptionsObs } from '../../../../services/collection-service/tools';


export const PRECISION_TOLERATED_DIFFERENCE = 3;
export const MAX_ZOOM = 23;

export class MapLayerFormGroup extends ConfigFormGroup {
  private currentCollection;
  public clearFilters = new Subject<boolean>();
  public constructor(
    featuresFg: MapLayerTypeFeaturesFormGroup,
    featureMetricFg: MapLayerTypeFeatureMetricFormGroup,
    clusterFg: MapLayerTypeClusterFormGroup,
    vFa: FormArray,
    collection: string,
    edit: boolean,
    collectionService: CollectionService
  ) {
    super({
      arlasId: new HiddenFormControl(
        '',
        null,
        {
          optional: true
        }),
      name: new InputFormControl(
        '',
        marker('Name'),
        marker('Name of the layer. Only used for visualization.'),
        'text',
        {
          childs: () => [this.customControls.id]
        }),
      mode: new SelectFormControl(
        '',
        marker('Mode'),
        marker('Mode of the layer.'),
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
      collection: new SelectFormControl(
        collection,
        marker('Collection'),
        marker('Layer collection description'),
        false,
        collectionService.getCollectionsWithCentroid().map(c => ({ label: c, value: c })),
        {
          optional: false,
          resetDependantsOnChange: true
        }
      ),

      collectionDisplayName: new HiddenFormControl(
        '',
        null,
        {
          dependsOn: () => [this.customControls.collection],
          onDependencyChange: (control: HiddenFormControl) => {
            collectionService.getDescribe(this.customControls.collection.value).subscribe(desc => {
              if (!!desc.params.display_names && !!desc.params.display_names.collection) {
                control.setValue(desc.params.display_names.collection);
              } else {
                control.setValue(desc.collection_name);
              }
            });
          },
          optional: true
        }
      ),
      visualisation: new VisualisationCheckboxFormControl(
        '',
        marker('Visualisation sets'),
        marker('The layer can be put in one or several visualisation sets'),
        vFa.value,
        {
          dependsOn: () => [this.customControls.name],
          onDependencyChange: (control: VisualisationCheckboxFormControl) => {
            // updates the selected layers in each visualisation set
            const controlsValues = [];
            vFa.value.forEach(vf => {
              const visualisation = !!control.value ? control.value.find(v => v.name === vf.name) : undefined;
              controlsValues.push({
                name: vf.name,
                layers: vf.layers,
                include: !!control.value && !!visualisation ? visualisation.include : false
              });
            });
            // this block if necessary when creating a new layer and no visualisation set is created yet
            // if we edit a layer we don't force checking the 'all layers' visualisation set
            // if we create a new layer we pre-check the 'all layers' visualisation set'
            if (controlsValues.length === 0) {
              controlsValues.push({
                name: 'All layers',
                layers: [],
                include: !edit
              });
            }
            control.setValue(controlsValues);
            const visualisationControl = control.value as Array<VisualisationCheckboxOption>;
            const layerId = this.customControls.arlasId.value;
            // check if the edited layer is already asigned to some visualisation sets
            // in order to check the checkbox
            visualisationControl.forEach(v => {
              const hasLayer = ((new Set(v.layers)).has(layerId));
              const visuAlreadyChecked = !!control.value ? control.value.find(visu => visu.name === v.name).include : false;
              v.include = hasLayer || visuAlreadyChecked;
            });
            // check at least one visualisation set when we create a new layer
            // if we edit an existing layer, we don't check visualisation sets
            if (!edit && visualisationControl.length >= 1 && !visualisationControl.find(vs => vs.include === true)) {
              visualisationControl[0].include = true;
            }
            control.setSyncOptions(visualisationControl);
          },
          optional: true
        }
      ),
      id: new HiddenFormControl(
        '',
        null,
        {
          optional: true
        }),
      featuresFg: featuresFg
        .withDependsOn(() => [this.customControls.mode, this.customControls.collection])
        .withOnDependencyChange(
          (control) => {
            if (!control.enabled && this.customControls.mode.value === LAYER_MODE.features) {
              this.currentCollection = undefined;
            }
            control.enableIf(this.customControls.mode.value === LAYER_MODE.features);
            /** when the collection changes we need to update all the fields lists used the different mat-select */
            if (control.enabled && (!this.currentCollection || this.customControls.collection.value !== this.currentCollection)) {
              toGeoOptionsObs(collectionService
                .getCollectionFields(this.customControls.collection.value))
                .subscribe(collectionFs => {
                  featuresFg.geometry.setSyncOptions(collectionFs);
                });
              this.updateCollectionInForms(featuresFg, collectionService);
              if (this.currentCollection !== undefined) {
                featuresFg.filters.setValue(new FormArray([], []));
                this.clearFilters.next(true);
              }
              this.currentCollection = this.customControls.collection.value;
            }
          }),
      featureMetricFg: featureMetricFg
        .withDependsOn(() => [this.customControls.mode, this.customControls.collection])
        .withOnDependencyChange(
          (control) => {
            if (!control.enabled && this.customControls.mode.value === LAYER_MODE.featureMetric) {
              this.currentCollection = undefined;
              /** Calculate the network precision */
              if (!!this.customControls.collection.value) {
                this.calculatenetworkFetchingLevel(this.customControls.collection.value, collectionService,
                  featureMetricFg.networkFetchingLevel, featureMetricFg.zoomMin, featureMetricFg.zoomMax);
              }
            }
            control.enableIf(this.customControls.mode.value === LAYER_MODE.featureMetric);
            /** when the collection changes we need to update all the fields lists used the different mat-select */
            if (control.enabled && !!this.customControls.collection.value &&
              (!this.currentCollection || this.customControls.collection.value !== this.currentCollection)) {
              toGeoOptionsObs(collectionService
                .getCollectionFields(this.customControls.collection.value))
                .subscribe(collectionFs => {
                  featureMetricFg.geometry.setSyncOptions(collectionFs);
                });
              toAllButGeoOptionsObs(collectionService
                .getCollectionFields(this.customControls.collection.value))
                .subscribe(collectionFs => {
                  featureMetricFg.featureMetricSort.setSyncOptions(collectionFs);
                });
              toKeywordOptionsObs(collectionService
                .getCollectionFields(this.customControls.collection.value))
                .subscribe(collectionFs => {
                  featureMetricFg.geometryId.setSyncOptions(collectionFs);
                });
              this.updateCollectionInForms(featureMetricFg, collectionService);
              if (this.currentCollection !== undefined) {
                featureMetricFg.filters.setValue(new FormArray([], []));
                this.clearFilters.next(true);
              }
              // calculate bbox of the collection in order and deduce the best grid precision
              if (this.currentCollection !== undefined && this.customControls.collection.value !== this.currentCollection) {
                this.calculatenetworkFetchingLevel(this.customControls.collection.value, collectionService,
                  featureMetricFg.networkFetchingLevel, featureMetricFg.zoomMin, featureMetricFg.zoomMax);
              }
              this.currentCollection = this.customControls.collection.value;
            }
          }),
      clusterFg: clusterFg
        .withDependsOn(() => [this.customControls.mode, this.customControls.collection])
        .withOnDependencyChange(
          (control) => {
            if (!control.enabled && this.customControls.mode.value === LAYER_MODE.cluster) {
              this.currentCollection = undefined;
            }
            control.enableIf(this.customControls.mode.value === LAYER_MODE.cluster);
            /** when the collection changes we need to update all the fields lists used the different mat-select */
            if (control.enabled && (!this.currentCollection || this.customControls.collection.value !== this.currentCollection)) {
              toGeoOptionsObs(collectionService
                .getCollectionFields(this.customControls.collection.value))
                .subscribe(collectionFs => {
                  clusterFg.rawGeometry.setSyncOptions(collectionFs);
                });
              toGeoPointOptionsObs(collectionService
                .getCollectionFields(this.customControls.collection.value))
                .subscribe(collectionFs => {
                  clusterFg.aggGeometry.setSyncOptions(collectionFs);
                });
              toAllButGeoOptionsObs(collectionService
                .getCollectionFields(this.customControls.collection.value))
                .subscribe(collectionFs => {
                  clusterFg.clusterSort.setSyncOptions(collectionFs);
                });
              this.updateCollectionInForms(clusterFg, collectionService);
              this.currentCollection = this.customControls.collection.value;
            }
          }),
    });
  }

  public customControls = {
    name: this.get('name') as InputFormControl,
    mode: this.get('mode') as SelectFormControl,
    visualisation: this.get('visualisation') as VisualisationCheckboxFormControl,
    id: this.get('id') as HiddenFormControl,
    arlasId: this.get('arlasId') as HiddenFormControl,
    /** need to make the collection availbale at this level to ease the export */
    collection: this.get('collection') as HiddenFormControl,
    collectionDisplayName: this.get('collectionDisplayName') as HiddenFormControl,
    featuresFg: this.get('featuresFg') as MapLayerTypeFeaturesFormGroup,
    featureMetricFg: this.get('featureMetricFg') as MapLayerTypeFeatureMetricFormGroup,
    clusterFg: this.get('clusterFg') as MapLayerTypeClusterFormGroup
  };
  public static adjustZoomVisibilityTonetworkFetchingLevel(networkFetchingLevelControl: SliderFormControl,
    zoomMinControl: SliderFormControl, zoomMaxControl: SliderFormControl): void {
    zoomMinControl.min = Math.max(networkFetchingLevelControl.value - PRECISION_TOLERATED_DIFFERENCE, 0);
    zoomMaxControl.min = Math.min(MAX_ZOOM, Math.max(networkFetchingLevelControl.value - PRECISION_TOLERATED_DIFFERENCE) + 1);

    if (zoomMinControl.value < Math.max(networkFetchingLevelControl.value - PRECISION_TOLERATED_DIFFERENCE, 0)) {
      zoomMinControl.setValue(Math.max(networkFetchingLevelControl.value - PRECISION_TOLERATED_DIFFERENCE, 0));
      zoomMinControl.hasWarning = true;
      zoomMinControl.warningMessage = marker('Network Analytics Fetching Precision is') + ' ' + networkFetchingLevelControl.value +
        '. ' + marker('Therefore; minimum zoom level of the layer should be greater than or equal to') + ' ' + zoomMinControl.value + '.';
      if (zoomMaxControl.value <= zoomMinControl.value) {
        zoomMaxControl.setValue(Math.min(MAX_ZOOM, zoomMinControl.value + 1));
        zoomMaxControl.hasWarning = true;
        zoomMaxControl.warningMessage = marker('Maximum zoom level of the layer should be greater than') + ' ' + zoomMinControl.value + '.';
      } else {
        zoomMaxControl.hasWarning = false;
      }
    } else {
      zoomMaxControl.hasWarning = false;
      zoomMinControl.hasWarning = false;
    }
  }

  private setNumericOrDateFields(p: PropertySelectorFormGroup, collection: string, collectionFields: SelectOption[]): void {
    p.setCollection(collection);
    p.customControls.propertyInterpolatedFg.propertyInterpolatedFieldCtrl.setSyncOptions(collectionFields);
    p.customControls.propertyCountOrMetricFg.propertyFieldCtrl.setSyncOptions(collectionFields);
  }

  private setAllButGeoFields(p: PropertySelectorFormGroup, collection: string, collectionFields: SelectOption[]): void {
    p.setCollection(collection);
    p.customControls.propertyProvidedFieldAggFg.propertyProvidedFieldAggCtrl.setSyncOptions(collectionFields);
    p.customControls.propertyProvidedFieldAggFg.propertyProvidedFieldSortCtrl.setSyncOptions(collectionFields);
    p.customControls.propertyProvidedFieldFeatureFg.propertyProvidedFieldFeatureCtrl.setSyncOptions(collectionFields);
  }

  private setNumericFields(p: PropertySelectorFormGroup, collection: string, collectionFields: SelectOption[]): void {
    p.setCollection(collection);
    p.customControls.propertyProvidedFieldAggFg.propertyProvidedFieldAggCtrl.setSyncOptions(collectionFields);
    p.customControls.propertyProvidedFieldAggFg.propertyProvidedFieldSortCtrl.setSyncOptions(collectionFields);
    p.customControls.propertyProvidedFieldFeatureFg.propertyProvidedFieldFeatureCtrl.setSyncOptions(collectionFields);
  }

  private setKeywordFields(p: PropertySelectorFormGroup, collection: string, collectionFields: SelectOption[]): void {
    p.setCollection(collection);
    p.customControls.propertyInterpolatedFg.propertyInterpolatedNormalizeLocalFieldCtrl.setSyncOptions(collectionFields);
    p.customControls.propertyProvidedColorFieldCtrl.setSyncOptions(collectionFields);
    p.customControls.propertyGeneratedFieldCtrl.setSyncOptions(collectionFields);
    p.customControls.propertyManualFg.propertyManualFieldCtrl.setSyncOptions(collectionFields);
  }

  private setTextKeywordFields(p: PropertySelectorFormGroup, collection: string, collectionFields: SelectOption[]): void {
    p.setCollection(collection);
    p.customControls.propertyProvidedColorLabelCtrl.setSyncOptions(collectionFields);
  }

  private updateCollectionInForms(mapFg: MapLayerAllTypesFormGroup, collectionService: CollectionService): void {
    toKeywordOptionsObs(collectionService
      .getCollectionFields(this.customControls.collection.value))
      .subscribe(collectionFs => {
        this.setKeywordFields(mapFg.opacity, this.customControls.collection.value, collectionFs);
        this.setKeywordFields(mapFg.colorFg, this.customControls.collection.value, collectionFs);
        this.setKeywordFields(mapFg.widthFg, this.customControls.collection.value, collectionFs);
        this.setKeywordFields(mapFg.radiusFg, this.customControls.collection.value, collectionFs);
        this.setKeywordFields(mapFg.strokeColorFg, this.customControls.collection.value, collectionFs);
        this.setKeywordFields(mapFg.strokeOpacityFg, this.customControls.collection.value, collectionFs);
        this.setKeywordFields(mapFg.strokeWidthFg, this.customControls.collection.value, collectionFs);
        this.setKeywordFields(mapFg.weightFg, this.customControls.collection.value, collectionFs);
        this.setKeywordFields(mapFg.labelRotationFg, this.customControls.collection.value, collectionFs);
        this.setKeywordFields(mapFg.labelSizeFg, this.customControls.collection.value, collectionFs);
        this.setKeywordFields(mapFg.labelHaloBlurFg, this.customControls.collection.value, collectionFs);
        this.setKeywordFields(mapFg.labelHaloColorFg, this.customControls.collection.value, collectionFs);
        this.setKeywordFields(mapFg.labelHaloWidthFg, this.customControls.collection.value, collectionFs);
      });
    toTextOrKeywordOptionsObs(collectionService
      .getCollectionFields(this.customControls.collection.value))
      .subscribe(collectionFs => {
        this.setTextKeywordFields(mapFg.opacity, this.customControls.collection.value, collectionFs);
        this.setTextKeywordFields(mapFg.colorFg, this.customControls.collection.value, collectionFs);
        this.setTextKeywordFields(mapFg.widthFg, this.customControls.collection.value, collectionFs);
        this.setTextKeywordFields(mapFg.radiusFg, this.customControls.collection.value, collectionFs);
        this.setTextKeywordFields(mapFg.strokeColorFg, this.customControls.collection.value, collectionFs);
        this.setTextKeywordFields(mapFg.strokeOpacityFg, this.customControls.collection.value, collectionFs);
        this.setTextKeywordFields(mapFg.strokeWidthFg, this.customControls.collection.value, collectionFs);
        this.setTextKeywordFields(mapFg.weightFg, this.customControls.collection.value, collectionFs);
        this.setTextKeywordFields(mapFg.labelRotationFg, this.customControls.collection.value, collectionFs);
        this.setTextKeywordFields(mapFg.labelSizeFg, this.customControls.collection.value, collectionFs);
        this.setTextKeywordFields(mapFg.labelHaloBlurFg, this.customControls.collection.value, collectionFs);
        this.setTextKeywordFields(mapFg.labelHaloColorFg, this.customControls.collection.value, collectionFs);
        this.setTextKeywordFields(mapFg.labelHaloWidthFg, this.customControls.collection.value, collectionFs);
      });
    toNumericOrDateOptionsObs(collectionService
      .getCollectionFields(this.customControls.collection.value))
      .subscribe(collectionFs => {
        this.setNumericOrDateFields(mapFg.opacity, this.customControls.collection.value, collectionFs);
        this.setNumericOrDateFields(mapFg.colorFg, this.customControls.collection.value, collectionFs);
        this.setNumericOrDateFields(mapFg.widthFg, this.customControls.collection.value, collectionFs);
        this.setNumericOrDateFields(mapFg.radiusFg, this.customControls.collection.value, collectionFs);
        this.setNumericOrDateFields(mapFg.strokeColorFg, this.customControls.collection.value, collectionFs);
        this.setNumericOrDateFields(mapFg.strokeOpacityFg, this.customControls.collection.value, collectionFs);
        this.setNumericOrDateFields(mapFg.strokeWidthFg, this.customControls.collection.value, collectionFs);
        this.setNumericOrDateFields(mapFg.weightFg, this.customControls.collection.value, collectionFs);
        this.setNumericOrDateFields(mapFg.labelRotationFg, this.customControls.collection.value, collectionFs);
        this.setNumericOrDateFields(mapFg.labelSizeFg, this.customControls.collection.value, collectionFs);
        this.setNumericOrDateFields(mapFg.labelContentFg, this.customControls.collection.value, collectionFs);
        this.setNumericOrDateFields(mapFg.labelHaloBlurFg, this.customControls.collection.value, collectionFs);
        this.setNumericOrDateFields(mapFg.labelHaloColorFg, this.customControls.collection.value, collectionFs);
        this.setNumericOrDateFields(mapFg.labelHaloWidthFg, this.customControls.collection.value, collectionFs);
      });
    toAllButGeoOptionsObs(collectionService
      .getCollectionFields(this.customControls.collection.value))
      .subscribe(collectionFs => {
        this.setAllButGeoFields(mapFg.labelContentFg, this.customControls.collection.value, collectionFs);
      });
    toNumericOptionsObs(collectionService
      .getCollectionFields(this.customControls.collection.value))
      .subscribe(collectionFs => {
        this.setNumericFields(mapFg.labelRotationFg, this.customControls.collection.value, collectionFs);
      });
  }
  private calculatenetworkFetchingLevel(collection: string, collectionService: CollectionService,
    networkFetchingLevelControl: SliderFormControl,
    zoomMinControl: SliderFormControl, zoomMaxControl: SliderFormControl) {
    collectionService.computeBbox(collection).subscribe({
      next: (cr) => {
        const coordinates = (cr.geometry as any).coordinates[0];
        const latitudes = coordinates.map(cs => cs[1]);
        const north = Math.min(Math.max(...latitudes), 85);
        const south = Math.max(Math.min(...latitudes), -85);
        const longitudes = coordinates.map(cs => cs[0]);
        const east = Math.max(...longitudes);
        const west = Math.min(...longitudes);
        const width = Math.abs(west - east);
        const height = Math.abs(north - south);
        const bbox = [west, south, west + width / 10 * 0.8, south + height / 10 * 0.8];
        const tile = tilebelt.bboxToTile(bbox);
        networkFetchingLevelControl.markAsUntouched();
        networkFetchingLevelControl.markAsPristine();
        networkFetchingLevelControl.setValue(tile[2] + '');
        MapLayerFormGroup.adjustZoomVisibilityTonetworkFetchingLevel(networkFetchingLevelControl, zoomMinControl, zoomMaxControl);
      }
    });
  }
}


export class MapFilterFormGroup extends ConfigFormGroup {
  public editing = false;
  public editionInfo: { field: string; op: FILTER_OPERATION; };
  public constructor(
    collectionFields: Observable<Array<CollectionField>>,
    filterOperations: Array<FILTER_OPERATION>,
    collectionService: CollectionService,
    collection: string
  ) {
    super({
      filterField: new TypedSelectFormControl(
        '',
        marker('Filter Field'),
        marker('Filter field description'),
        true,
        toNumericOrDateOrKeywordOrBooleanObs(collectionFields),
        {
        }
      ),
      filterOperation: new SelectFormControl(
        '',
        marker('operation'),
        marker('filter operation description'),
        false,
        valuesToOptions(filterOperations),
        {
          resetDependantsOnChange: true,
          dependsOn: () => [this.customControls.filterField],
          onDependencyChange: (control: SelectFormControl) => {
            if (this.editionInfo) {
              // if we change the field/or operation, we are no longer in editing an existing filter but creating a new one
              // we quit edition mode
              if (this.customControls.filterField.value.value !== this.editionInfo.field ||
                this.customControls.filterOperation.value !== this.editionInfo.op
              ) {
                this.editing = false;
              }

            }
            if (!this.editing) {
              /** update list of available ops according to field type */
              if (this.customControls.filterField.value.type === 'KEYWORD') {
                control.setSyncOptions([
                  { value: FILTER_OPERATION.IN, label: FILTER_OPERATION.IN },
                  { value: FILTER_OPERATION.NOT_IN, label: FILTER_OPERATION.NOT_IN }
                ]);
              } else if (this.customControls.filterField.value.type === 'BOOLEAN') {
                control.setSyncOptions([
                  { value: FILTER_OPERATION.IS, label: FILTER_OPERATION.IS }
                ]);
              } else {
                control.setSyncOptions([
                  { value: FILTER_OPERATION.EQUAL, label: FILTER_OPERATION.EQUAL },
                  { value: FILTER_OPERATION.NOT_EQUAL, label: FILTER_OPERATION.NOT_EQUAL },
                  { value: FILTER_OPERATION.RANGE, label: FILTER_OPERATION.RANGE },
                  { value: FILTER_OPERATION.OUT_RANGE, label: FILTER_OPERATION.OUT_RANGE },
                ]);
              }
              control.setValue(control.syncOptions[0].value);
            } else {
              // if we are editing an existing filter, keep the selected operation.
              // otherwise there is no way to remember it
              if ((this.customControls.filterOperation.value === FILTER_OPERATION.IN ||
                this.customControls.filterOperation.value === FILTER_OPERATION.NOT_IN)) {
                control.setSyncOptions([
                  { value: FILTER_OPERATION.IN, label: FILTER_OPERATION.IN },
                  { value: FILTER_OPERATION.NOT_IN, label: FILTER_OPERATION.NOT_IN }
                ]);
              } else if (this.customControls.filterOperation.value === FILTER_OPERATION.IS) {
                control.setSyncOptions([
                  { value: FILTER_OPERATION.IS, label: FILTER_OPERATION.IS }
                ]);
              } else {
                control.setSyncOptions([
                  { value: FILTER_OPERATION.EQUAL, label: FILTER_OPERATION.EQUAL },
                  { value: FILTER_OPERATION.NOT_EQUAL, label: FILTER_OPERATION.NOT_EQUAL },
                  { value: FILTER_OPERATION.RANGE, label: FILTER_OPERATION.RANGE },
                  { value: FILTER_OPERATION.OUT_RANGE, label: FILTER_OPERATION.OUT_RANGE },
                ]);
              }
              control.setValue(this.customControls.filterOperation.value);
            }
          }
        }
      ),
      filterInValues: new MultipleSelectFormControl(
        '',
        marker('values'),
        marker('filter in-values description'),
        false,
        [],
        {
          resetDependantsOnChange: true,
          dependsOn: () => [this.customControls.filterField],
          onDependencyChange: (control: MultipleSelectFormControl) => {
            if (!!this.customControls.filterField.value && !!this.customControls.filterField.value.value &&
              this.customControls.filterField.value.value !== '') {
              if (this.customControls.filterOperation.value === FILTER_OPERATION.IN ||
                this.customControls.filterOperation.value === FILTER_OPERATION.NOT_IN) {
                control.setSyncOptions([]);
                collectionService.getTermAggregation(
                  collection,
                  this.customControls.filterField.value.value)
                  .then(keywords => {
                    control.setSyncOptions(keywords.map(k => ({ value: k, label: k })));
                  });
              } else {
                control.setSyncOptions([]);
              }
            } else {
              control.setSyncOptions([]);
            }
            control.markAsUntouched();
            if (this.editionInfo) {
              // if we change the field/or operation, we are no longer in editing an existing filter but creating a new one
              // we quit edition mode
              if (this.customControls.filterField.value.value !== this.editionInfo.field ||
                this.customControls.filterOperation.value !== this.editionInfo.op
              ) {
                this.editing = false;
              }
            }
            // if we are editing an existing filter, keep the selected items.
            // otherwise there is no way to remember them
            if (!this.editing) {
              control.savedItems = new Set();
              control.selectedMultipleItems = [];
            }
            control.enableIf(this.customControls.filterOperation.value === FILTER_OPERATION.IN ||
              this.customControls.filterOperation.value === FILTER_OPERATION.NOT_IN);
          }
        }
      ),
      filterEqualValues: new InputFormControl(
        '',
        marker('values'),
        marker('filter equal description'),
        'number',
        {
          resetDependantsOnChange: true,
          dependsOn: () => [this.customControls.filterOperation, this.customControls.filterField],
          onDependencyChange: (control: InputFormControl) => {
            control.enableIf(this.customControls.filterOperation.value === FILTER_OPERATION.EQUAL ||
              this.customControls.filterOperation.value === FILTER_OPERATION.NOT_EQUAL);
          }
        }
      ),
      filterMinRangeValues: new InputFormControl(
        '',
        marker('Minimum range filter'),
        marker('Minimum range filter description'),
        'number',
        {
          resetDependantsOnChange: true,
          dependsOn: () => [
            this.customControls.filterOperation, this.customControls.filterField
          ],
          onDependencyChange: (control, isLoading) => {
            const doRangeEnable = this.customControls.filterOperation.value === FILTER_OPERATION.RANGE ||
              this.customControls.filterOperation.value === FILTER_OPERATION.OUT_RANGE;
            control.enableIf(doRangeEnable);
            if (doRangeEnable && !isLoading) {
              collectionService.getComputationMetric(
                collection,
                this.customControls.filterField.value.value,
                METRIC_TYPES.MIN)
                .then(min =>
                  control.setValue(min));
            }
          }
        },
        () => this.customControls.filterMaxRangeValues,
        undefined
      ),
      filterMaxRangeValues: new InputFormControl(
        '',
        marker('Maximum range filter'),
        marker('Maximum range filter description'),
        'number',
        {
          resetDependantsOnChange: true,
          dependsOn: () => [
            this.customControls.filterOperation, this.customControls.filterField
          ],
          onDependencyChange: (control, isLoading) => {
            const doRangeEnable = this.customControls.filterOperation.value === FILTER_OPERATION.RANGE ||
              this.customControls.filterOperation.value === FILTER_OPERATION.OUT_RANGE;
            control.enableIf(doRangeEnable);
            if (doRangeEnable && !isLoading) {
              collectionService.getComputationMetric(
                collection,
                this.customControls.filterField.value.value,
                METRIC_TYPES.MAX)
                .then(max =>
                  control.setValue(max));
            }
          }
        },
        undefined,
        () => this.customControls.filterMinRangeValues
      ),
      filterBoolean: new ButtonToggleFormControl(
        true,
        [
          {
            label: marker('activated'), value: true
          },
          {
            label: marker('not activated'), value: false
          }
        ],
        undefined,
        {
          resetDependantsOnChange: true,
          dependsOn: () => [this.customControls.filterField],
          onDependencyChange: (control: ButtonToggleFormControl) => {
            control.enableIf(this.customControls.filterOperation.value === FILTER_OPERATION.IS);
          }
        }),
      id: new HiddenFormControl(
        '',
        null,
        {
          optional: true
        }
      ),
    });
  }

  public customControls = {
    filterField: this.get('filterField') as TypedSelectFormControl,
    filterOperation: this.get('filterOperation') as SelectFormControl,
    filterInValues: this.get('filterInValues') as MultipleSelectFormControl,
    filterEqualValues: this.get('filterEqualValues') as InputFormControl,
    filterMinRangeValues: this.get('filterMinRangeValues') as InputFormControl,
    filterMaxRangeValues: this.get('filterMaxRangeValues') as InputFormControl,
    filterBoolean: this.get('filterBoolean') as ButtonToggleFormControl,
    id: this.get('id') as HiddenFormControl
  };

}
export class MapLayerAllTypesFormGroup extends ConfigFormGroup {

  public constructor(
    collection: string,
    collectionFieldsObs: Observable<Array<CollectionField>>,
    type: string,
    geometryTypes: Array<GEOMETRY_TYPE>,
    propertySelectorFormBuilder: PropertySelectorFormBuilderService,
    isAggregated: boolean,
    colorSources: Array<PROPERTY_SELECTOR_SOURCE>,
    labelSources: Array<PROPERTY_SELECTOR_SOURCE>,
    labelRotationSources: Array<PROPERTY_SELECTOR_SOURCE>,
    geometryFormControls: { [key: string]: AbstractControl; },
    visibilityFormControls: { [key: string]: AbstractControl; },
    styleFormControls: { [key: string]: AbstractControl; }
  ) {
    super({
      geometryStep: new ConfigFormGroup({
        ...geometryFormControls
      }).withStepName(marker('Geometry')),
      styleStep: new ConfigFormGroup({
        ...styleFormControls,
        geometryType: new SelectFormControl(
          '',
          marker('geometry ' + type + ' shape'),
          marker('geometry ' + type + ' shape description'),
          false,
          valuesToOptions(geometryTypes),
          {
            resetDependantsOnChange: true,
            dependsOn: () => [this.geometryStep],
            onDependencyChange: (control) => {

              // Feature Mode and Feature Metric Mode
              if (
                !!this.geometryStep.get('geometry') && !!this.geometryStep.get('geometry').value
                && this.geometryStep.get('geometry').touched
              ) {
                const sub = (this.geometryStep.get('geometry') as SelectFormControl).sourceData.subscribe((fields: CollectionField[]) => {
                  fields.forEach(f => {
                    if (f.name === this.geometryStep.get('geometry').value) {
                      control.setValue(
                        f.type === CollectionReferenceDescriptionProperty.TypeEnum.GEOPOINT ? GEOMETRY_TYPE.circle : GEOMETRY_TYPE.line
                      );
                    }
                  });
                  sub.unsubscribe();
                });
              }

              // Cluster Mode
              if (
                !!this.geometryStep.get('aggregatedGeometry') && !!this.geometryStep.get('aggregatedGeometry').value
                && this.geometryStep.get('aggregatedGeometry').touched
              ) {
                control.setValue(
                  this.geometryStep.get('aggregatedGeometry').value === AGGREGATE_GEOMETRY_TYPE.cell_center ||
                    this.geometryStep.get('aggregatedGeometry').value === AGGREGATE_GEOMETRY_TYPE.centroid ?
                    GEOMETRY_TYPE.circle : GEOMETRY_TYPE.fill
                );
              }
              if (
                !!this.geometryStep.get('rawGeometry') && !!this.geometryStep.get('rawGeometry').value
                && this.geometryStep.get('rawGeometry').touched
              ) {
                const sub = (this.geometryStep.get('rawGeometry') as SelectFormControl).sourceData.subscribe(
                  (fields: CollectionField[]) => {
                    fields.forEach(f => {
                      if (f.name === this.geometryStep.get('rawGeometry').value) {
                        control.setValue(
                          f.type === CollectionReferenceDescriptionProperty.TypeEnum.GEOPOINT ? GEOMETRY_TYPE.circle : GEOMETRY_TYPE.fill);
                      }
                    });
                    sub.unsubscribe();
                  });
              }


            }
          }
        ),
        lineType: new SelectFormControl(
          '',
          marker('line type'),
          marker('line type description'),
          false,
          [
            { value: LINE_TYPE.solid, label: marker('Solid') + ' ( ━ ) ' },
            { value: LINE_TYPE.dashed, label: marker('Dashed') + ' ( - - - )' },
            { value: LINE_TYPE.dotted, label: marker('Dotted') + ' ( • • • )' },
            { value: LINE_TYPE.mixed, label: marker('Mixed') + ' ( - • - )' }
          ],
          {
            dependsOn: () => [this.geometryType],
            onDependencyChange: (control) => control.enableIf(this.geometryType.value === GEOMETRY_TYPE.line)
          }
        ),
        filter: new FormControl(),
        labelContentFg: propertySelectorFormBuilder.build(
          PROPERTY_TYPE.text,
          'labelContent',
          labelSources,
          isAggregated,
          collection,
          marker('label content description')
        ).withDependsOn(() => [this.geometryType])
          .withOnDependencyChange((control) => control.enableIf(this.isLabel())),
        labelOverlapFg: new SlideToggleFormControl(
          true,
          marker('overlap'),
          marker('overlap description'),
          {
            optional: true,
            dependsOn: () => [this.geometryType],
            onDependencyChange: (control) => control.enableIf(this.isLabel())
          }
        ),
        opacity: propertySelectorFormBuilder.build(
          PROPERTY_TYPE.number,
          'opacity',
          [
            PROPERTY_SELECTOR_SOURCE.fix_slider, PROPERTY_SELECTOR_SOURCE.interpolated
          ],
          isAggregated,
          collection,
          marker('opacity description')
        ),
        colorFg: propertySelectorFormBuilder.build(
          PROPERTY_TYPE.color,
          'color',
          colorSources,
          isAggregated,
          collection,
          marker('property color ' + (type === 'cluster' ? type : '') + ' description'),
          geometryTypes.indexOf(GEOMETRY_TYPE.heatmap) >= 0 ? () => this.geometryType : undefined
        ),

        widthFg: propertySelectorFormBuilder.build(
          PROPERTY_TYPE.number,
          'width',
          [
            PROPERTY_SELECTOR_SOURCE.fix_slider, PROPERTY_SELECTOR_SOURCE.interpolated
          ],
          isAggregated,
          collection,
          marker('property width description')
        )
          .withDependsOn(() => [this.geometryType])
          .withOnDependencyChange((control) => control.enableIf(this.geometryType.value === GEOMETRY_TYPE.line)),

        radiusFg: propertySelectorFormBuilder.build(
          PROPERTY_TYPE.number,
          'radius',
          [
            PROPERTY_SELECTOR_SOURCE.fix_slider, PROPERTY_SELECTOR_SOURCE.interpolated
          ],
          isAggregated,
          collection,
          marker('property radius ' + type + ' description')
        )
          .withDependsOn(() => [this.geometryType])
          .withOnDependencyChange((control) => control.enableIf(this.geometryType.value === GEOMETRY_TYPE.circle
            || this.geometryType.value === GEOMETRY_TYPE.heatmap)),

        strokeColorFg: propertySelectorFormBuilder.build(
          PROPERTY_TYPE.color,
          'strokeColor',
          colorSources,
          isAggregated,
          collection,
          marker('property stroke color description')
        ).withDependsOn(() => [this.geometryType])
          .withOnDependencyChange((control) => control.enableIf(this.isCircleOrFill() && this.enabled))
          .withTitle(marker('stroke')),

        strokeWidthFg: propertySelectorFormBuilder.build(
          PROPERTY_TYPE.number,
          'strokeWidth',
          [
            PROPERTY_SELECTOR_SOURCE.fix_slider, PROPERTY_SELECTOR_SOURCE.interpolated
          ],
          isAggregated,
          collection,
          marker('property stroke width description')
        ).withDependsOn(() => [this.geometryType])
          .withOnDependencyChange((control) => control.enableIf(this.isCircleOrFill() && this.enabled)),

        strokeOpacityFg: propertySelectorFormBuilder.build(
          PROPERTY_TYPE.number,
          'strokeOpacity',
          [
            PROPERTY_SELECTOR_SOURCE.fix_slider, PROPERTY_SELECTOR_SOURCE.interpolated
          ],
          isAggregated,
          collection,
          marker('property stroke opacity description')
        ).withDependsOn(() => [this.geometryType])
          .withOnDependencyChange((control) => control.enableIf(this.isCircleOrFill() && this.enabled)),

        weightFg: propertySelectorFormBuilder.build(
          PROPERTY_TYPE.number,
          'weight',
          [
            PROPERTY_SELECTOR_SOURCE.fix_slider, PROPERTY_SELECTOR_SOURCE.interpolated
          ],
          isAggregated,
          collection,
          marker('property weight description')
        )
          .withDependsOn(() => [this.geometryType])
          .withOnDependencyChange((control) => control.enableIf(this.geometryType.value === GEOMETRY_TYPE.heatmap)),

        intensityFg: propertySelectorFormBuilder.build(
          PROPERTY_TYPE.number,
          'intensity',
          [
            PROPERTY_SELECTOR_SOURCE.fix_slider
          ],
          isAggregated,
          collection,
          marker('property intensity description')
        )
          .withDependsOn(() => [this.geometryType])
          .withOnDependencyChange((control) => control.enableIf(this.geometryType.value === GEOMETRY_TYPE.heatmap)),
        labelSizeFg: propertySelectorFormBuilder.build(
          PROPERTY_TYPE.number,
          'labelSize',
          [
            PROPERTY_SELECTOR_SOURCE.fix_slider, PROPERTY_SELECTOR_SOURCE.interpolated
          ],
          isAggregated,
          collection,
          marker('property label size description')
        )
          .withDependsOn(() => [this.geometryType])
          .withOnDependencyChange((control) => control.enableIf(this.isLabel()))
          .withTitle(marker('size rotation offset')),
        labelRotationFg: propertySelectorFormBuilder.build(
          PROPERTY_TYPE.number,
          'labelRotation',
          labelRotationSources,
          isAggregated,
          collection,
          marker('property label rotation description')
        )
          .withDependsOn(() => [this.geometryType])
          .withOnDependencyChange((control) => control.enableIf(this.isLabel())),
        labelPlacementCtrl: new ButtonToggleFormControl(
          'point',
          [
            { label: marker('point'), value: LABEL_PLACEMENT.point },
            { label: marker('line'), value: LABEL_PLACEMENT.line },
            { label: marker('line-center'), value: LABEL_PLACEMENT.line_center },

          ]
          ,
          marker('label placement description'),
          {
            optional: true,
            title: marker('Label placement'),
            dependsOn: () => [this.geometryType, this.geometryStep],
            onDependencyChange: (control) => {
              control.enableIf(this.geometryType.value === GEOMETRY_TYPE.label);
              if (control.enabled) {
                // Feature Mode and Feature Metric Mode
                if (
                  !!this.geometryStep.get('geometry') && !!this.geometryStep.get('geometry').value
                  && this.geometryStep.get('geometry').touched
                ) {
                  const sub = (this.geometryStep.get('geometry') as SelectFormControl).sourceData.subscribe((fields: CollectionField[]) => {
                    fields.forEach(f => {
                      if (f.name === this.geometryStep.get('geometry').value) {
                        control.enableIf(f.type !== CollectionReferenceDescriptionProperty.TypeEnum.GEOPOINT);
                      }
                    });
                    sub.unsubscribe();
                  });
                }

                // Cluster Mode
                if (
                  !!this.geometryStep.get('aggregatedGeometry') && !!this.geometryStep.get('aggregatedGeometry').value
                  && this.geometryStep.get('aggregatedGeometry').touched
                ) {
                  control.enableIf(this.geometryStep.get('aggregatedGeometry').value === AGGREGATE_GEOMETRY_TYPE.bbox ||
                    this.geometryStep.get('aggregatedGeometry').value === AGGREGATE_GEOMETRY_TYPE.cell);
                }
                if (
                  !!this.geometryStep.get('rawGeometry') && !!this.geometryStep.get('rawGeometry').value
                  && this.geometryStep.get('rawGeometry').touched
                ) {
                  const sub = (this.geometryStep.get('rawGeometry') as SelectFormControl).sourceData.subscribe(
                    (fields: CollectionField[]) => {
                      fields.forEach(f => {
                        if (f.name === this.geometryStep.get('rawGeometry').value) {
                          control.enableIf(f.type !== CollectionReferenceDescriptionProperty.TypeEnum.GEOPOINT);
                        }
                      });
                      sub.unsubscribe();
                    });
                }
              }
            }
          }
        ),
        labelAlignmentCtrl: new ButtonToggleFormControl(
          'center',
          [
            { label: marker('right'), value: LABEL_ALIGNMENT.right },
            { label: marker('center'), value: LABEL_ALIGNMENT.center },
            { label: marker('left'), value: LABEL_ALIGNMENT.left },

          ]
          ,
          marker('label alignment description'),
          {
            optional: true,
            title: marker('Label alignment'),
            dependsOn: () => [this.geometryType],
            onDependencyChange: (control) => control.enableIf(this.geometryType.value === GEOMETRY_TYPE.label)
          }
        ),
        labelOffsetFg: new ConfigFormGroup({
          dx: new InputFormControl(
            0,
            marker('label offset dx'),
            marker('label offset dx description'),
            'number',
            {
              optional: false
            }
          ),
          dy: new InputFormControl(
            0,
            marker('label offset dy'),
            marker('label offset dy description'),
            'number',
            {
              optional: false
            }
          )
        })
          .withDependsOn(() => [this.geometryType])
          .withOnDependencyChange((control) => control.enableIf(this.isLabel())),
        labelHaloColorFg: propertySelectorFormBuilder.build(
          PROPERTY_TYPE.color,
          'labelHaloColor',
          colorSources,
          isAggregated,
          collection,
          marker('property label halo color description')
        )
          .withDependsOn(() => [this.geometryType])
          .withOnDependencyChange((control) => control.enableIf(this.isLabel()))
          .withTitle(marker('Halo title')),
        labelHaloWidthFg: propertySelectorFormBuilder.build(
          PROPERTY_TYPE.number,
          'labelHaloWidth',
          [
            PROPERTY_SELECTOR_SOURCE.fix_slider, PROPERTY_SELECTOR_SOURCE.interpolated
          ],
          isAggregated,
          collection,
          marker('property label halo width description')
        )
          .withDependsOn(() => [this.geometryType])
          .withOnDependencyChange((control) => control.enableIf(this.isLabel())),
        labelHaloBlurFg: propertySelectorFormBuilder.build(
          PROPERTY_TYPE.number,
          'labelHaloBlur',
          [
            PROPERTY_SELECTOR_SOURCE.fix_slider, PROPERTY_SELECTOR_SOURCE.interpolated
          ],
          isAggregated,
          collection,
          marker('property label halo blur description')
        )
          .withDependsOn(() => [this.geometryType])
          .withOnDependencyChange((control) => control.enableIf(this.isLabel()))

      }).withStepName(marker('Style')),
      visibilityStep: new ConfigFormGroup({
        visible: new SlideToggleFormControl(
          '',
          marker('Visible'),
          marker('Whether the layer is visible or not')
        ),
        networkFetchingLevel: new SliderFormControl(
          '',
          marker('Network Fetching Level'),
          marker('Network Fetching Level description'),
          0,
          MAX_ZOOM,
          1,
          undefined,
          undefined,
          {
            optional: false,
            dependsOn: () => [],
            onDependencyChange: (control) => {
              control.enableIf(type === 'feature-metric');
            }
          }
        ),
        zoomMin: new SliderFormControl(
          '',
          marker('Zoom min'),
          marker('zoom min description'),
          0,
          MAX_ZOOM,
          1,
          () => this.zoomMax,
          undefined,
          {
            optional: false,
            dependsOn: () => [this.networkFetchingLevel],
            onDependencyChange: () => {
              this.zoomMin.min = Math.max(this.networkFetchingLevel.value - PRECISION_TOLERATED_DIFFERENCE, 0);
              this.zoomMax.min = Math.min(MAX_ZOOM, Math.max(this.networkFetchingLevel.value - PRECISION_TOLERATED_DIFFERENCE) + 1);
              if (this.networkFetchingLevel.dirty) {
                MapLayerFormGroup.adjustZoomVisibilityTonetworkFetchingLevel(this.networkFetchingLevel, this.zoomMin, this.zoomMax);
              }
            }
          }
        ),
        zoomMax: new SliderFormControl(
          '',
          marker('Zoom max'),
          marker('zoom max description'),
          0,
          MAX_ZOOM,
          1,
          undefined,
          () => this.zoomMin,
          {
            optional: false,
            dependsOn: () => [this.networkFetchingLevel],
            onDependencyChange: () => {
            }
          }
        ),
        ...visibilityFormControls,
        filters: new MapFiltersControl(
          new FormArray([], []),
          marker('Add filter'),
          marker('Map filters description'),

          {
            title: marker('Filter elements to display'),
            optional: true,
            onDependencyChange: (control) => {
              control.enableIf(type !== 'cluster');
            }
          }
        )
      }).withStepName(marker('Visibility'))
    });

  }

  // TODO use customControls like other form builders
  public get geometryStep() {
    return this.get('geometryStep') as ConfigFormGroup;
  }
  public get visibilityStep() {
    return this.get('visibilityStep') as ConfigFormGroup;
  }
  public get networkFetchingLevel() {
    return this.get('visibilityStep').get('networkFetchingLevel') as SliderFormControl;
  }
  public get styleStep() {
    return this.get('styleStep') as ConfigFormGroup;
  }
  public get visible() {
    return this.visibilityStep.get('visible') as SlideToggleFormControl;
  }
  public get zoomMin() {
    return this.visibilityStep.get('zoomMin') as SliderFormControl;
  }
  public get zoomMax() {
    return this.visibilityStep.get('zoomMax') as SliderFormControl;
  }
  public get geometryType() {
    return this.styleStep.get('geometryType') as SelectFormControl;
  }
  public get opacity() {
    return this.styleStep.get('opacity') as PropertySelectorFormGroup;
  }
  public get labelContentFg() {
    return this.styleStep.get('labelContentFg') as PropertySelectorFormGroup;
  }
  public get labelOverlapFg() {
    return this.styleStep.get('labelOverlapFg') as SlideToggleFormControl;
  }
  public get colorFg() {
    return this.styleStep.get('colorFg') as PropertySelectorFormGroup;
  }
  public get widthFg() {
    return this.styleStep.get('widthFg') as PropertySelectorFormGroup;
  }
  public get radiusFg() {
    return this.styleStep.get('radiusFg') as PropertySelectorFormGroup;
  }
  public get strokeWidthFg() {
    return this.styleStep.get('strokeWidthFg') as PropertySelectorFormGroup;
  }
  public get strokeColorFg() {
    return this.styleStep.get('strokeColorFg') as PropertySelectorFormGroup;
  }
  public get strokeOpacityFg() {
    return this.styleStep.get('strokeOpacityFg') as PropertySelectorFormGroup;
  }
  public get weightFg() {
    return this.styleStep.get('weightFg') as PropertySelectorFormGroup;
  }
  public get intensityFg() {
    return this.styleStep.get('intensityFg') as PropertySelectorFormGroup;
  }
  public get filter() {
    return this.styleStep.get('filter') as FormGroup;
  }
  public get filters() {
    return this.visibilityStep.get('filters') as MapFiltersControl;
  }

  public get labelSizeFg() {
    return this.styleStep.get('labelSizeFg') as PropertySelectorFormGroup;
  }

  public get labelRotationFg() {
    return this.styleStep.get('labelRotationFg') as PropertySelectorFormGroup;
  }

  public get labelHaloColorFg() {
    return this.styleStep.get('labelHaloColorFg') as PropertySelectorFormGroup;
  }

  public get labelHaloBlurFg() {
    return this.styleStep.get('labelHaloBlurFg') as PropertySelectorFormGroup;
  }

  public get labelHaloWidthFg() {
    return this.styleStep.get('labelHaloWidthFg') as PropertySelectorFormGroup;
  }

  public get labelPlacementCtrl() {
    return this.styleStep.get('labelPlacementCtrl') as ButtonToggleFormControl;
  }

  public get labelAlignmentCtrl() {
    return this.styleStep.get('labelAlignmentCtrl') as ButtonToggleFormControl;
  }

  public get labelOffsetFg() {
    return this.styleStep.get('labelOffsetFg') as ConfigFormGroup;
  }
  public get labelOffsetDx() {
    return this.styleStep.get('labelOffsetFg').get('dx') as InputFormControl;
  }
  public get labelOffsetDy() {
    return this.styleStep.get('labelOffsetFg').get('dy') as InputFormControl;
  }

  private isCircleOrFill(): boolean {
    return this.isCircle() || this.isFill();
  }

  private isCircle(): boolean {
    return this.geometryType.value === GEOMETRY_TYPE.circle;
  }

  private isFill(): boolean {
    return this.geometryType.value === GEOMETRY_TYPE.fill;
  }

  private isLabel(): boolean {
    return this.geometryType.value === GEOMETRY_TYPE.label;
  }
}

export class MapLayerTypeFeaturesFormGroup extends MapLayerAllTypesFormGroup {

  public constructor(
    collection: string,
    type: string,
    collectionFields: Observable<Array<CollectionField>>,
    propertySelectorFormBuilder: PropertySelectorFormBuilderService,
    isAggregated: boolean = false,
    geometryFormControls: { [key: string]: AbstractControl; } = {},
    labelSources: Array<PROPERTY_SELECTOR_SOURCE>,
    labelRotationSources: Array<PROPERTY_SELECTOR_SOURCE>,
  ) {

    super(
      collection,
      collectionFields,
      type,
      [
        GEOMETRY_TYPE.fill,
        GEOMETRY_TYPE.line,
        GEOMETRY_TYPE.circle,
        GEOMETRY_TYPE.label
      ],
      propertySelectorFormBuilder,
      isAggregated,
      [
        PROPERTY_SELECTOR_SOURCE.fix_color, PROPERTY_SELECTOR_SOURCE.interpolated, PROPERTY_SELECTOR_SOURCE.generated,
        PROPERTY_SELECTOR_SOURCE.manual, PROPERTY_SELECTOR_SOURCE.provided_color
      ],
      labelSources,
      labelRotationSources,
      {
        geometry: new SelectFormControl(
          '',
          marker(type + ' geometry field'),
          marker(type + ' geometry field description'),
          true,
          toGeoOptionsObs(collectionFields),
          {
            optional: false,
            title: marker(type + ' rendered geometry'),
            sourceData: collectionFields.pipe(map(
              fields => fields
                .filter(f => f.type === CollectionReferenceDescriptionProperty.TypeEnum.GEOPOINT
                  || f.type === CollectionReferenceDescriptionProperty.TypeEnum.GEOSHAPE)))
          },
        ),
        ...geometryFormControls
      },
      {
        renderMode: new SelectFormControl(
          '',
          marker('Render mode'),
          marker('Render mode description'),
          false,
          [
            { label: marker('Wide'), value: FeatureRenderMode.wide },
            { label: marker('Window'), value: FeatureRenderMode.window }
          ],
          {
            optional: false,
            dependsOn: () => [],
            onDependencyChange: (control) => {
              control.enableIf(type === 'feature');
            }
          }
        ),
        featuresMax: new SliderFormControl(
          '',
          marker('Features max'),
          marker('Maximum number of features to display this layer'),
          0,
          10000,
          100,
          undefined,
          undefined,
          {
            dependsOn: () => [this.renderMode],
            onDependencyChange: (control) => {
              control.enableIf(!this.renderMode.enabled || this.renderMode.value === FeatureRenderMode.wide);
            }
          }
        )
      },
      {

      }
    );
  }

  public customControls = {
    geometry: this.geometryStep.get('geometry') as SelectFormControl,
  };
  public get geometry() {
    return this.geometryStep.get('geometry') as SelectFormControl;
  }
  public get featuresMax() {
    return this.visibilityStep.get('featuresMax') as SliderFormControl;
  }
  public get renderMode() {
    return this.visibilityStep.get('renderMode') as SelectFormControl;
  }
  public get geometryType() {
    return this.styleStep.get('geometryType') as SelectFormControl;
  }
}

export class MapLayerTypeFeatureMetricFormGroup extends MapLayerTypeFeaturesFormGroup {

  public constructor(
    collection: string,
    collectionFields: Observable<Array<CollectionField>>,
    propertySelectorFormBuilder: PropertySelectorFormBuilderService
  ) {
    super(
      collection,
      'feature-metric',
      collectionFields,
      propertySelectorFormBuilder,
      true,
      {
        featureMetricSort: new OrderedSelectFormControl(
          '',
          marker('Order field'),
          marker('Order field feature metric description'),
          false,
          toAllButGeoOptionsObs(collectionFields),
          {
            optional: true,
            onDependencyChange: (control) => {
              if (!!this.featureMetricSort.value) {
                this.featureMetricSort.sorts = new Set(this.featureMetricSort.value.split(','));
              }
            }
          }
        ),

        geometryId: new SelectFormControl(
          '',
          marker('Geometry ID'),
          marker('Geometry ID description'),
          true,
          toKeywordOptionsObs(collectionFields)
        )
      },
      [
        PROPERTY_SELECTOR_SOURCE.fix_input, PROPERTY_SELECTOR_SOURCE.provided_field_for_agg,
        PROPERTY_SELECTOR_SOURCE.displayable_metric_on_field
      ],
      [
        PROPERTY_SELECTOR_SOURCE.fix_slider, PROPERTY_SELECTOR_SOURCE.interpolated, PROPERTY_SELECTOR_SOURCE.metric_on_field
      ]);
  }
  public get featureMetricSort() {
    return this.geometryStep.get('featureMetricSort') as OrderedSelectFormControl;
  }
  public get geometryId() {
    return this.geometryStep.get('geometryId') as OrderedSelectFormControl;
  }
  public get networkFetchingLevel() {
    return this.visibilityStep.get('networkFetchingLevel') as SliderFormControl;
  }

}

export class MapLayerTypeClusterFormGroup extends MapLayerAllTypesFormGroup {

  public constructor(
    collection: string,
    collectionFields: Observable<Array<CollectionField>>,
    propertySelectorFormBuilder: PropertySelectorFormBuilderService
  ) {
    super(
      collection,
      collectionFields,
      'cluster',
      [
        GEOMETRY_TYPE.fill,
        GEOMETRY_TYPE.circle,
        GEOMETRY_TYPE.heatmap,
        GEOMETRY_TYPE.label
      ],
      propertySelectorFormBuilder,
      true,
      [
        /** Sources for cluster colors */
        PROPERTY_SELECTOR_SOURCE.fix_color, PROPERTY_SELECTOR_SOURCE.interpolated
      ],
      [
        /** Sources for cluster label */
        PROPERTY_SELECTOR_SOURCE.fix_input, PROPERTY_SELECTOR_SOURCE.provided_field_for_agg,
        PROPERTY_SELECTOR_SOURCE.displayable_metric_on_field
      ],
      [
        /** Sources for cluster label rotation */
        PROPERTY_SELECTOR_SOURCE.fix_slider, PROPERTY_SELECTOR_SOURCE.interpolated,
        PROPERTY_SELECTOR_SOURCE.metric_on_field
      ],
      {
        aggGeometry: new SelectFormControl(
          '',
          marker('geo aggregation field'),
          marker('Choose the geo aggregation field'),
          false,
          toGeoPointOptionsObs(collectionFields),
          {
            title: marker('Aggregate data to a geographic grid')
          }
        ),
        aggType: new SelectFormControl(
          '',
          marker('Geographic type grid'),
          marker('Geographic type grid description'),
          false,
          [
            { label: marker('Tile Grid'), value: ClusterAggType.tile },
            { label: marker('GeohashGrid'), value: ClusterAggType.geohash }
          ]),
        granularity: new SelectFormControl(
          '',
          marker('Granularity'),
          marker('Granularity description'),
          false,
          Object.keys(Granularity).map(key => ({ label: Granularity[key].toString(), value: Granularity[key] }))
        ),
        clusterGeometryType: new SelectFormControl(
          '',
          marker('cluster geometry type'),
          marker('cluster geometry type description'),
          false,
          [
            { label: marker('Aggregated geometry'), value: CLUSTER_GEOMETRY_TYPE.aggregated_geometry },
            { label: marker('Raw Geometry'), value: CLUSTER_GEOMETRY_TYPE.raw_geometry }
          ],
          {
            resetDependantsOnChange: true,
            title: marker('Displayed geometry')
          }
        ),
        aggregatedGeometry: new SelectFormControl(
          '',
          marker('Aggregated geometry type'),
          marker('Aggregated geometry type description'),
          false,
          [
            { label: marker('Cell center'), value: AGGREGATE_GEOMETRY_TYPE.cell_center },
            { label: marker('Cell'), value: AGGREGATE_GEOMETRY_TYPE.cell },
            { label: marker('Data cell bbox'), value: AGGREGATE_GEOMETRY_TYPE.bbox },
            { label: marker('Data cell centroid'), value: AGGREGATE_GEOMETRY_TYPE.centroid }
          ],
          {
            dependsOn: () => [this.clusterGeometryType],
            onDependencyChange: (control) => control.enableIf(this.clusterGeometryType.value === CLUSTER_GEOMETRY_TYPE.aggregated_geometry)
          }
        ),
        rawGeometry: new SelectFormControl(
          '',
          marker('geometry field'),
          marker('geometry field description'),
          false,
          toGeoOptionsObs(collectionFields),
          {
            resetDependantsOnChange: true,
            dependsOn: () => [this.clusterGeometryType],
            onDependencyChange: (control) => control.enableIf(this.clusterGeometryType.value === CLUSTER_GEOMETRY_TYPE.raw_geometry),
            sourceData: collectionFields.pipe(map(
              fields => fields
                .filter(f => f.type === CollectionReferenceDescriptionProperty.TypeEnum.GEOPOINT
                  || f.type === CollectionReferenceDescriptionProperty.TypeEnum.GEOSHAPE)))
          }
        ),
        clusterSort: new OrderedSelectFormControl(
          '',
          marker('Order field'),
          marker('Order field description'),
          false,
          toAllButGeoOptionsObs(collectionFields),
          {
            dependsOn: () => [this.clusterGeometryType, this.rawGeometry],
            onDependencyChange: (control) => {
              control.enableIf(this.clusterGeometryType.value === CLUSTER_GEOMETRY_TYPE.raw_geometry && !!this.rawGeometry.value);
              if (!!this.clusterSort.value) {
                this.clusterSort.sorts = new Set(this.clusterSort.value.split(','));
              }
            }
          }
        ),
      },
      {
        featuresMin: new SliderFormControl(
          '',
          marker('Minimum features'),
          marker('Minimum number of features to display this layer'),
          0,
          10000,
          100
        )
      },
      {
      }
    );
  }

  public get aggGeometry() {
    return this.geometryStep.get('aggGeometry') as SelectFormControl;
  }
  public get granularity() {
    return this.geometryStep.get('granularity') as SelectFormControl;
  }
  public get aggType() {
    return this.geometryStep.get('aggType') as SelectFormControl;
  }
  public get clusterGeometryType() {
    return this.geometryStep.get('clusterGeometryType') as SelectFormControl;
  }
  public get aggregatedGeometry() {
    return this.geometryStep.get('aggregatedGeometry') as SelectFormControl;
  }
  public get rawGeometry() {
    return this.geometryStep.get('rawGeometry') as SelectFormControl;
  }
  public get clusterSort() {
    return this.geometryStep.get('clusterSort') as OrderedSelectFormControl;
  }
  public get featuresMin() {
    return this.visibilityStep.get('featuresMin') as SliderFormControl;
  }
  public get geometryType() {
    return this.styleStep.get('geometryType') as SelectFormControl;
  }
}

@Injectable({
  providedIn: 'root'
})
export class MapLayerFormBuilderService {

  public constructor(
    private defaultValuesService: DefaultValuesService,
    private propertySelectorFormBuilder: PropertySelectorFormBuilderService,
    private mainFormService: MainFormService,
    private collectionService: CollectionService
  ) { }

  public buildLayer(collection: string, edit?: boolean) {
    /** check if collection has geom */
    const collectionsWithCentroid = this.collectionService.getCollectionsWithCentroid();
    const isGeoCollection = (new Set(collectionsWithCentroid)).has(collection);
    let collectionFields = of([]);
    if (isGeoCollection) {
      collectionFields = this.collectionService.getCollectionFields(
        collection
      );
    } else {
      if (collectionsWithCentroid.length > 0) {
        collection = collectionsWithCentroid[0];
        collectionFields = this.collectionService.getCollectionFields(
          collection
        );
      }
    }

    const mapLayerFormGroup = new MapLayerFormGroup(
      this.buildFeatures(collection, collectionFields),
      this.buildFeatureMetric(collection, collectionFields),
      this.buildCluster(collection, collectionFields),
      this.mainFormService.mapConfig.getVisualisationsFa(),
      collection,
      edit,
      this.collectionService
    );
    this.defaultValuesService.setDefaultValueRecursively('map.layer', mapLayerFormGroup);
    return mapLayerFormGroup;
  }

  public buildMapFilter(collection: string) {
    const collectionFields = this.collectionService.getCollectionFields(collection);
    const mapFilterFormGroup = new MapFilterFormGroup(collectionFields,
      [FILTER_OPERATION.IN, FILTER_OPERATION.RANGE, FILTER_OPERATION.EQUAL, FILTER_OPERATION.NOT_IN,
        FILTER_OPERATION.IS, FILTER_OPERATION.OUT_RANGE, FILTER_OPERATION.NOT_EQUAL],
      this.collectionService, collection);
    return mapFilterFormGroup;
  }

  public buildFeatures(collection: string, collectionFields: Observable<Array<CollectionField>>) {
    const featureFormGroup = new MapLayerTypeFeaturesFormGroup(
      collection,
      'feature',
      collectionFields,
      this.propertySelectorFormBuilder,
      false,
      {},
      [
        PROPERTY_SELECTOR_SOURCE.fix_input, PROPERTY_SELECTOR_SOURCE.provided_field_for_feature
      ],
      [
        PROPERTY_SELECTOR_SOURCE.fix_slider, PROPERTY_SELECTOR_SOURCE.interpolated,
        PROPERTY_SELECTOR_SOURCE.provided_numeric_field_for_feature
      ]);

    this.defaultValuesService.setDefaultValueRecursively('map.layer', featureFormGroup);
    return featureFormGroup;
  }

  private buildFeatureMetric(collection: string, collectionFields: Observable<Array<CollectionField>>) {
    const featureMetricFormGroup = new MapLayerTypeFeatureMetricFormGroup(
      collection,
      collectionFields,
      this.propertySelectorFormBuilder);

    this.defaultValuesService.setDefaultValueRecursively('map.layer', featureMetricFormGroup);
    return featureMetricFormGroup;
  }

  private buildCluster(collection: string, collectionFields: Observable<Array<CollectionField>>) {
    const clusterFormGroup = new MapLayerTypeClusterFormGroup(
      collection,
      collectionFields,
      this.propertySelectorFormBuilder);

    this.defaultValuesService.setDefaultValueRecursively('map.layer', clusterFormGroup);
    return clusterFormGroup;
  }
}

export function requireCheckboxesToBeCheckedValidator(minRequired = 1): ValidatorFn {
  return function validate(formGroup: FormGroup) {
    let checked = 0;
    if (formGroup.value) {
      formGroup.value.forEach((key) => {
        if (key.include) {
          checked++;
        }
      });
    }

    if (checked < minRequired) {
      return {
        requireCheckboxesToBeChecked: true,
      };
    }
    return null;
  };
}
