/*
 * Licensed to Gisaïa under one or more contributor
 * license agreements. See the NOTICE.txt file distributed with
 * this work for additional information regarding copyright
 * ownership. Gisaïa licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { WIDGET_TYPE } from '@analytics-config/components/edit-group/models';
import {
  BY_BUCKET_OR_INTERVAL
} from '@analytics-config/services/buckets-interval-form-builder/buckets-interval-form-builder.service';
import {
  DEFAULT_METRIC_VALUE
} from '@analytics-config/services/metric-collect-form-builder/metric-collect-form-builder.service';
import {
  isNumberOperator,
  ResultListVisualisationDataGroupFormWidget,
  ResultListVisualisationFormWidget
} from '@analytics-config/services/resultlist-form-builder/models';
import { ShortcutsService } from '@analytics-config/services/shortcuts/shortcuts.service';
import { FormArray, FormGroup } from '@angular/forms';
import {
  CollectionUnitFormGroup,
  LookAndFeelGlobalFormGroup
} from '@look-and-feel-config/services/look-and-feel-global-form-builder/look-and-feel-global-form-builder.service';
import { LAYER_MODE } from '@map-config/components/edit-layer/models';
import {
  BasemapFormGroup,
  MapBasemapFormGroup
} from '@map-config/services/map-basemap-form-builder/map-basemap-form-builder.service';
import { MapGlobalFormGroup } from '@map-config/services/map-global-form-builder/map-global-form-builder.service';
import { MapLayerFormGroup } from '@map-config/services/map-layer-form-builder/map-layer-form-builder.service';
import { CLUSTER_GEOMETRY_TYPE, FILTER_OPERATION } from '@map-config/services/map-layer-form-builder/models';
import {
  SearchGlobalFormGroup
} from '@search-config/services/search-global-form-builder/search-global-form-builder.service';
import { CollectionService } from '@services/collection-service/collection.service';
import { NUMERIC_TYPES, titleCase } from '@services/collection-service/tools';
import { ARLAS_ID, MainFormService } from '@services/main-form/main-form.service';
import { ResourcesConfigFormGroup } from '@services/resources-form-builder/resources-config-form-builder.service';
import { StartingConfigFormGroup } from '@services/starting-config-form-builder/starting-config-form-builder.service';
import { PROPERTY_SELECTOR_SOURCE } from '@shared-services/property-selector-form-builder/models';
import {
  SideModulesGlobalFormGroup
} from '@side-modules-config/services/side-modules-global-form-builder/side-modules-global-form-builder.service';
import {
  TimelineGlobalFormGroup
} from '@timeline-config/services/timeline-global-form-builder/timeline-global-form-builder.service';
import { CollectionReferenceDescription, Expression } from 'arlas-api';
import { CollectionReferenceDescriptionProperty } from 'arlas-api/api';
import { BasemapStyle, SCROLLABLE_ARLAS_ID, VisualisationSetConfig } from 'arlas-map';
import { ArlasColorService, DescribedUrl } from 'arlas-web-components';
import { ColorConfig, ExtentFilterGeometry, FieldsConfiguration, getSourceName, LayerSourceConfig } from 'arlas-web-contributors';
import { FeatureRenderMode } from 'arlas-web-contributors/models/models';
import { ZoomToDataStrategy } from 'arlas-wui-toolkit';
import {
  AggregationModelConfig,
  AnalyticComponentConfig,
  AnalyticComponentHistogramInputConfig,
  AnalyticComponentInputConfig,
  AnalyticComponentResultListInputConfig,
  AnalyticComponentSwimlaneInputConfig,
  AnalyticComponentSwimlaneInputOptionsConfig,
  AnalyticConfig, ArlasExpression,
  ChipSearchConfig,
  Config,
  ContributorConfig,
  DataGroupInputCondition,
  DataGroupInputConfig,
  JSONPATH_COUNT,
  JSONPATH_METRIC,
  MapComponentInputConfig,
  MapComponentInputMapLayersConfig,
  MapglComponentConfig,
  SEARCH_TYPE,
  SwimlaneConfig,
  VisualisationListInputConfig,
  WebConfigOptions
} from './models-config';
import { hashCode, stringifyArlasFilter } from './tools';

export enum EXPORT_TYPE {
  json = 'json',
  persistence = 'persistence'
}

// TODO use customControls in the class instead of untyped values
export class ConfigExportHelper {

  public static getConfiguredCollections(
    startingConfig: StartingConfigFormGroup,
    mapConfigGlobal: MapGlobalFormGroup,
    mapConfigLayers: FormArray,
    searchConfigGlobal: SearchGlobalFormGroup,
    timelineConfigGlobal: TimelineGlobalFormGroup,
    analyticsConfigList: FormArray,
    resultLists: FormArray,
    collectionService: CollectionService
  ): string[] {
    let mainCollection: string;
    const collectionFormControl = startingConfig.customControls.collection;
    if (!!startingConfig && !!collectionFormControl) {
      mainCollection = collectionFormControl.value;
    }
    let contributors = this.getMapContributors(mapConfigGlobal, mapConfigLayers, mainCollection, collectionService);
    contributors.push(...this.getSearchContributor(searchConfigGlobal,
      startingConfig.customControls.collection.value));
    contributors.push(this.getTimelineContributor(timelineConfigGlobal,
      false, collectionService.collectionParamsMap));
    const contributorsMap = new Map<string, any>();
    const resultListContributors = this.getResultListContributors(resultLists);
    resultListContributors.map(c => contributorsMap.set(c.identifier, c));
    contributors = contributors.concat(resultListContributors);

    if (timelineConfigGlobal.value.useDetailedTimeline) {
      contributors.push(this.getTimelineContributor(timelineConfigGlobal,
        true, collectionService.collectionParamsMap));
    }

    if (!!analyticsConfigList) {
      (analyticsConfigList.value as Array<any>).forEach(tab => {
        tab.contentFg.groupsFa.forEach(group => {
          group.content.forEach(widget => {
            const contributorId = this.getContributorId(widget.widgetData, widget.widgetType);
            let contributor = contributorsMap.get(contributorId);
            // check if the contributor already exists to avoid duplication in the final config json object
            if (!contributor) {
              contributor = this.getAnalyticsContributor(widget.widgetType, widget.widgetData, group.icon);
              contributorsMap.set(contributorId, contributor);
              contributors.push(contributor);
            }
          });
        });
      });
    }
    const collections = new Set<string>();
    collections.add(mainCollection);
    contributors.forEach(c => {
      if (c.collection) {
        collections.add(c.collection);
      }
      if (c.additionalCollections) {
        c.additionalCollections.forEach(ac => {
          collections.add(ac.collectionName);
        });
      }
    });
    return Array.from(collections);
  }

  public static process(
    startingConfig: StartingConfigFormGroup,
    resourcesConfig: ResourcesConfigFormGroup,
    mapConfigGlobal: MapGlobalFormGroup,
    mapConfigLayers: FormArray,
    mapConfigVisualisations: FormArray,
    mapConfigBasemaps: MapBasemapFormGroup,
    searchConfigGlobal: SearchGlobalFormGroup,
    timelineConfigGlobal: TimelineGlobalFormGroup,
    sideModulesGlobal: SideModulesGlobalFormGroup,
    lookAndFeelConfigGlobal: LookAndFeelGlobalFormGroup,
    analyticsConfigList: FormArray,
    resultLists: FormArray,
    externalNode: FormGroup,
    colorService: ArlasColorService,
    collectionService: CollectionService,
    shortcutsService: ShortcutsService,
    mainFormService: MainFormService
  ): Config {
    const chipssearch: ChipSearchConfig = {
      name: searchConfigGlobal.customControls.name.value,
      icon: searchConfigGlobal.customControls.unmanagedFields.icon.value
    };
    lookAndFeelConfigGlobal.buildAtExport();
    const config: Config = {
      arlas: {
        web: {
          contributors: [],
          components: {
            timeline: this.getTimelineComponent(timelineConfigGlobal, false),
            mapgl: this.getMapComponent(mapConfigGlobal, mapConfigLayers, mapConfigVisualisations, mapConfigBasemaps),
            resultlists: this.getResultListComponent(resultLists)
          },
          analytics: [],
          filters_shortcuts: shortcutsService.shortcuts,
          colorGenerator: {
            keysToColors: colorService.colorGenerator.keysToColors
          },
          options: this.getOptions(lookAndFeelConfigGlobal),
          externalNode: externalNode.controls.externalNode.value
        },
        server: {
          url: startingConfig.customControls.serverUrl.value,
          max_age_cache: +sideModulesGlobal.customControls.server.maxAgeCache.value,
          collection: {
            name: sideModulesGlobal.customControls.server.mainCollection.value,
          }
        }
      },
      'arlas-wui': {
        web: {
          app: {
            components: {
              chipssearch
            },
            name: mainFormService.configurationName,
            units: (lookAndFeelConfigGlobal.customControls.units.value as FormArray)
              .controls.map((c: CollectionUnitFormGroup) => ({
                collection: c.customControls.collection.value,
                unit: c.customControls.unit.value,
                ignored: c.customControls.ignored.value
              })),
          }
        }
      },
      extraConfigs: [
        {
          configPath: 'config.map.json',
          replacedAttribute: 'arlas.web.components.mapgl.input.mapLayers.layers',
          replacer: 'layers'
        },
        {
          configPath: 'config.map.json',
          replacedAttribute: 'arlas.web.components.mapgl.input.mapLayers.externalEventLayers',
          replacer: 'external-event-layers'
        }
      ],
      resources: {}
    };
    let mainCollection;
    const collectionFormControl = startingConfig.customControls.collection;
    if (!!startingConfig && !!collectionFormControl) {
      mainCollection = collectionFormControl.value;
    }
    config.arlas.web.contributors = config.arlas.web.contributors.concat(this.getMapContributors(mapConfigGlobal, mapConfigLayers,
      mainCollection, collectionService));
    config.arlas.web.contributors.push(...this.getSearchContributor(searchConfigGlobal,
      startingConfig.customControls.collection.value));
    config.arlas.web.contributors.push(this.getTimelineContributor(timelineConfigGlobal,
      false, collectionService.collectionParamsMap));

    const contributorsMap = new Map<string, any>();
    const resultListContributors = this.getResultListContributors(resultLists);
    resultListContributors.map(c => contributorsMap.set(c.identifier, c));
    config.arlas.web.contributors = config.arlas.web.contributors.concat(resultListContributors);

    if (timelineConfigGlobal.value.useDetailedTimeline) {
      config.arlas.web.components.detailedTimeline = this.getTimelineComponent(timelineConfigGlobal, true);
      config.arlas.web.contributors.push(this.getTimelineContributor(timelineConfigGlobal,
        true, collectionService.collectionParamsMap));
    }

    if (!!analyticsConfigList) {
      (analyticsConfigList.value as Array<any>).forEach(tab => {
        config.arlas.web.options.tabs.push(
          {
            name: tab.tabName,
            icon: tab.tabIcon,
            showIcon: tab.showIcon,
            showName: tab.showName
          }
        );
        tab.contentFg.groupsFa.forEach(group => {
          group.content.forEach(widget => {
            const contributorId = this.getContributorId(widget.widgetData, widget.widgetType);
            let contributor = contributorsMap.get(contributorId);
            // check if the contributor already exists to avoid duplication in the final config json object
            if (!contributor) {
              contributor = this.getAnalyticsContributor(widget.widgetType, widget.widgetData, group.icon);
              const uuid = widget.widgetData.uuid;
              if (widget.widgetType === 'histogram' && shortcutsService.isShortcut(uuid)) {
                const shortcutContributor = Object.assign({}, contributor);
                shortcutContributor.identifier = uuid;
                shortcutContributor.linked_contributor_id = contributorId;
                // todo : configurate this nb of buckets
                shortcutContributor.numberOfBuckets = 20;
                contributor.linked_contributor_id = shortcutContributor.identifier;
                contributorsMap.set(shortcutContributor.identifier, shortcutContributor);
                config.arlas.web.contributors.push(shortcutContributor);
              }
              contributorsMap.set(contributorId, contributor);
              config.arlas.web.contributors.push(contributor);
            }
          });
        });
      });

      (analyticsConfigList.value as Array<any>).forEach(tab => {
        tab.contentFg.groupsFa.forEach((group: any, groupIndex: number) => {
          config.arlas.web.analytics.push(this.getAnalyticsGroup(tab.tabName, group, groupIndex, lookAndFeelConfigGlobal));
        });
      });
    }

    this.exportSideModulesConfig(config, sideModulesGlobal);
    this.exportPreview(config, resourcesConfig);
    return config;
  }


  private static exportPreview(config: Config, resourcesForm: ResourcesConfigFormGroup) {
    if (resourcesForm.hasPreviewId()) {
      config.resources.previewId = resourcesForm.customControls.resources.previewId.value;
    }
  }

  public static getLayerSourceConfig(layerFg: FormGroup): LayerSourceConfig {
    const layerValues = layerFg.value;
    const modeValues = layerFg.value.mode === LAYER_MODE.features ? layerFg.value.featuresFg :
      (layerFg.value.mode === LAYER_MODE.featureMetric ? layerFg.value.featureMetricFg : layerFg.value.clusterFg);
    const filters = !!modeValues.visibilityStep.filters ? modeValues.visibilityStep.filters.value : undefined;

    const layerSource: LayerSourceConfig = {
      id: layerValues.arlasId,
      name: layerValues.name,
      source: '',
      minzoom: modeValues.visibilityStep.zoomMin,
      maxzoom: modeValues.visibilityStep.zoomMax,
      include_fields: [],
      short_form_fields: [],
      colors_from_fields: [],
      provided_fields: [],
      normalization_fields: [],
      metrics: []
    };

    if (!!filters) {
      filters.forEach((f) => {
        if (!layerSource.filters) {
          layerSource.filters = [];
        }
        if (f.filterOperation === FILTER_OPERATION.IN || f.filterOperation === FILTER_OPERATION.NOT_IN) {
          layerSource.filters.push({
            field: f.filterField.value,
            op: f.filterOperation,
            value: f.filterInValues.map(v => v.value)
          });
        } else if (f.filterOperation === FILTER_OPERATION.EQUAL || f.filterOperation === FILTER_OPERATION.NOT_EQUAL) {
          layerSource.filters.push({
            field: f.filterField.value,
            op: f.filterOperation,
            value: f.filterEqualValues
          });
        } else if (f.filterOperation === FILTER_OPERATION.RANGE || f.filterOperation === FILTER_OPERATION.OUT_RANGE) {
          layerSource.filters.push({
            field: f.filterField.value, op: f.filterOperation,
            value: f.filterMinRangeValues + ';' + f.filterMaxRangeValues
          });
        } else if (f.filterOperation === FILTER_OPERATION.IS) {
          layerSource.filters.push({
            field: f.filterField.value, op: f.filterOperation,
            value: f.filterBoolean
          });
        }
        if (!layerSource.include_fields) {
          layerSource.include_fields = [];
        }
        const includeFieldsSet = new Set(layerSource.include_fields);
        includeFieldsSet.add(f.filterField.value);
        layerSource.include_fields = Array.from(includeFieldsSet);
      });

    }

    switch (layerValues.mode) {
      case LAYER_MODE.features: {
        layerSource.maxfeatures = modeValues.visibilityStep.featuresMax;
        layerSource.returned_geometry = modeValues.geometryStep.geometry;
        layerSource.render_mode = modeValues.visibilityStep.renderMode;
        break;
      }
      case LAYER_MODE.featureMetric: {
        layerSource.maxfeatures = modeValues.visibilityStep.featuresMax;
        layerSource.raw_geometry = {
          geometry: modeValues.geometryStep.geometry,
          sort: !!modeValues.geometryStep.featureMetricSort ? modeValues.geometryStep.featureMetricSort : ''
        };
        layerSource.geometry_id = modeValues.geometryStep.geometryId;
        layerSource.network_fetching_level = +modeValues.visibilityStep.networkFetchingLevel;
        break;
      }
      case LAYER_MODE.cluster: {
        layerSource.agg_geo_field = modeValues.geometryStep.aggGeometry;
        layerSource.aggType = modeValues.geometryStep.aggType;
        layerSource.granularity = modeValues.geometryStep.granularity;
        layerSource.minfeatures = modeValues.visibilityStep.featuresMin;
        if (modeValues.geometryStep.clusterGeometryType === CLUSTER_GEOMETRY_TYPE.aggregated_geometry) {
          layerSource.aggregated_geometry = modeValues.geometryStep.aggregatedGeometry;
        } else {
          layerSource.raw_geometry = {
            geometry: modeValues.geometryStep.rawGeometry,
            sort: !!modeValues.geometryStep.clusterSort ? modeValues.geometryStep.clusterSort : ''
          };
        }
      }
    }

    this.declareFieldsToLayerSource(layerSource, modeValues.styleStep.colorFg, layerValues.mode);

    if (!!modeValues.styleStep.opacity) {
      this.declareFieldsToLayerSource(layerSource, modeValues.styleStep.opacity, layerValues.mode);
    }

    if (!!modeValues.styleStep.widthFg) {
      this.declareFieldsToLayerSource(layerSource, modeValues.styleStep.widthFg, layerValues.mode);
    }

    if (!!modeValues.styleStep.radiusFg) {
      this.declareFieldsToLayerSource(layerSource, modeValues.styleStep.radiusFg, layerValues.mode);
    }

    if (!!modeValues.styleStep.strokeColorFg) {
      this.declareFieldsToLayerSource(layerSource, modeValues.styleStep.strokeColorFg, layerValues.mode);
    }

    if (!!modeValues.styleStep.strokeWidthFg) {
      this.declareFieldsToLayerSource(layerSource, modeValues.styleStep.strokeWidthFg, layerValues.mode);
    }

    if (!!modeValues.styleStep.strokeOpacityFg) {
      this.declareFieldsToLayerSource(layerSource, modeValues.styleStep.strokeOpacityFg, layerValues.mode);
    }

    if (!!modeValues.styleStep.weightFg) {
      this.declareFieldsToLayerSource(layerSource, modeValues.styleStep.weightFg, layerValues.mode);
    }
    if (!!modeValues.styleStep.labelSizeFg) {
      this.declareFieldsToLayerSource(layerSource, modeValues.styleStep.labelSizeFg, layerValues.mode);
    }
    if (!!modeValues.styleStep.labelHaloColorFg) {
      this.declareFieldsToLayerSource(layerSource, modeValues.styleStep.labelHaloColorFg, layerValues.mode);
    }
    if (!!modeValues.styleStep.labelHaloBlurFg) {
      this.declareFieldsToLayerSource(layerSource, modeValues.styleStep.labelHaloBlurFg, layerValues.mode);
    }
    if (!!modeValues.styleStep.labelHaloWidthFg) {
      this.declareFieldsToLayerSource(layerSource, modeValues.styleStep.labelHaloWidthFg, layerValues.mode);
    }
    if (!!modeValues.styleStep.labelRotationFg) {
      this.declareFieldsToLayerSource(layerSource, modeValues.styleStep.labelRotationFg, layerValues.mode);
    }
    if (!!modeValues.styleStep.labelContentFg) {
      this.declareFieldsToLayerSource(layerSource, modeValues.styleStep.labelContentFg, layerValues.mode);
    }
    layerSource.source = getSourceName(layerSource) + '-' + layerFg.value.collection;
    return layerSource;
  }
  public static getMapContributors(
    mapConfigGlobal: MapGlobalFormGroup,
    mapConfigLayers: FormArray,
    mainCollection: string,
    collectionService: CollectionService): ContributorConfig[] {

    const contributorsCollectionsMap = new Map<string, ContributorConfig>();
    mapConfigLayers.controls.forEach((layerFg: MapLayerFormGroup) => {
      const collection = layerFg.customControls.collection.value;
      let mapContributor = contributorsCollectionsMap.get(collection);
      if (!mapContributor) {
        const requestGeometry = mapConfigGlobal.getRawValue().requestGeometries.find(rg => rg.collection === collection);
        let geoQueryField = collectionService.collectionParamsMap.get(collection).params.centroid_path;
        let geoQueryOp = 'Intersects';
        let windowExtentGeometry = ExtentFilterGeometry.geometry_path;

        if (requestGeometry) {
          geoQueryField = requestGeometry.requestGeom;
          geoQueryOp = requestGeometry.geographicalOperator;
          windowExtentGeometry = requestGeometry.windowExtentGeometry;
        }
        mapContributor = {
          type: 'map',
          identifier: collection,
          name: 'Map ' + collection,
          collection,
          geo_query_op: titleCase(geoQueryOp),
          geo_query_field: geoQueryField,
          window_extent_geometry: windowExtentGeometry,
          icon: mapConfigGlobal.customControls.unmanagedFields.icon.value,
          layers_sources: []
        };
      }
      mapContributor.layers_sources.push(this.getLayerSourceConfig(layerFg));
      contributorsCollectionsMap.set(collection, mapContributor);
    });
    /** if no layer has been defined, create the default mapcontributor wihtout any layers */
    if (mapConfigLayers.controls.length === 0) {
      let geoQueryField = collectionService.collectionParamsMap.get(mainCollection).params.centroid_path;
      let geoQueryOp = 'Intersects';
      const geoFilterFg = mapConfigGlobal.getGeoFilter(mainCollection);
      if (geoFilterFg) {
        geoQueryField = geoFilterFg.customControls.requestGeom.value;
        geoQueryOp = geoFilterFg.customControls.geographicalOperator.value;
      }
      const mapContributor: ContributorConfig = {
        type: 'map',
        identifier: mainCollection,
        name: 'Map ' + mainCollection,
        collection: mainCollection,
        geo_query_op: titleCase(geoQueryOp),
        geo_query_field: geoQueryField,
        icon: mapConfigGlobal.customControls.unmanagedFields.icon.value,
        layers_sources: []
      };
      contributorsCollectionsMap.set(mainCollection, mapContributor);
    }
    return Array.from(contributorsCollectionsMap.values());
  }

  public static getMapComponent(
    mapConfigGlobal: MapGlobalFormGroup,
    mapConfigLayers: FormArray,
    mapConfigVisualisations: FormArray,
    mapConfigBasemaps: MapBasemapFormGroup,
    arlasId?,
    enableByDefault?: boolean): MapglComponentConfig {

    const customControls = mapConfigGlobal.customControls;

    const layers: Array<string> = new Array<string>();
    const layersHoverIds: Array<string> = new Array<string>();
    mapConfigLayers.controls.forEach((layerFg: MapLayerFormGroup) => {
      layers.push(layerFg.value.name);
      if (this.getLayerSourceConfig(layerFg).render_mode === FeatureRenderMode.window) {
        layersHoverIds.push(layerFg.value.arlasId);
        layersHoverIds.push(layerFg.value.arlasId.replace(ARLAS_ID, SCROLLABLE_ARLAS_ID));
      }
    });

    const visualisationsSets: Array<VisualisationSetConfig> = [
    ];
    if (!arlasId) {
      mapConfigVisualisations.controls.forEach(visu => visualisationsSets.push({
        name: visu.value.name,
        layers: visu.value.layers,
        enabled: enableByDefault ? true : visu.value.displayed
      }));
    } else {
      // to preview one layer
      mapConfigVisualisations.controls.forEach(visu => {
        const hasLayer = (new Set(visu.value.layers).has(arlasId));
        if (hasLayer) {
          visualisationsSets.push({
            name: visu.value.name,
            layers: [arlasId],
            // this will activate the visualisation set and display its layers for preview purposes
            enabled: enableByDefault ? true : visu.value.displayed
          });
        }
      });
    }
    const basemaps: BasemapStyle[] = [];
    let defaultBasemap: BasemapStyle;
    mapConfigBasemaps.customControls.basemaps.controls.forEach((basemap: BasemapFormGroup) => {
      basemaps.push({
        name: basemap.customControls.name.value,
        styleFile: basemap.customControls.url.value,
        image: basemap.customControls.image.value,
        type: basemap.customControls.type.value
      });
      if (mapConfigBasemaps.customControls.default.value === basemap.value.name) {
        defaultBasemap = {
          name: basemap.customControls.name.value,
          styleFile: basemap.customControls.url.value,
          image: basemap.customControls.image.value,
          type: basemap.customControls.type.value
        };
      }
    });
    if (!defaultBasemap) {
      defaultBasemap = basemaps[0];
    }
    const mapComponent: MapglComponentConfig = {
      allowMapExtend: customControls.allowMapExtend.value,
      nbVerticesLimit: customControls.unmanagedFields.nbVerticesLimit.value,
      input: {
        defaultBasemapStyle: defaultBasemap,
        basemapStyles: basemaps,
        margePanForLoad: +customControls.margePanForLoad.value,
        margePanForTest: +customControls.margePanForTest.value,
        initZoom: customControls.initZoom.value,
        initCenter: [
          +customControls.initCenterLon.value,
          +customControls.initCenterLat.value
        ],
        displayScale: customControls.displayScale.value,
        displayCurrentCoordinates: customControls.displayCurrentCoordinates.value,
        enableGlobe: customControls.enableGlobe.value,
        idFeatureField: 'deprecated, to be removed',
        mapLayers: {
          layers: [],
          events: {
            zoomOnClick: customControls.unmanagedFields.mapLayers.events.zoomOnClick.value,
            emitOnClick: layersHoverIds,
            onHover: layersHoverIds,
          },
          externalEventLayers: new Array<{ id: string; on: string; }>()
        } as MapComponentInputMapLayersConfig,
        visualisations_sets: visualisationsSets
      } as MapComponentInputConfig
    };

    return mapComponent;
  }

  private static declareFieldsToLayerSource(layerSource: LayerSourceConfig, layerValues: any, mode: LAYER_MODE) {
    switch (layerValues.propertySource) {
      case PROPERTY_SELECTOR_SOURCE.fix_color:
      case PROPERTY_SELECTOR_SOURCE.fix_slider:
      case PROPERTY_SELECTOR_SOURCE.fix_input:
        break;
      case PROPERTY_SELECTOR_SOURCE.provided_color: {
        const colorConfig: ColorConfig = {
          color: layerValues.propertyProvidedColorFieldCtrl
        };
        if (!!layerValues.propertyProvidedColorLabelCtrl) {
          colorConfig.label = layerValues.propertyProvidedColorLabelCtrl;
        }
        layerSource.provided_fields.push(colorConfig);
        break;
      }
      case PROPERTY_SELECTOR_SOURCE.provided_field_for_agg: {
        let sorts = [];
        if (!layerSource.fetched_hits) {
          layerSource.fetched_hits = {
            sorts,
            fields: [],
            short_form_fields: []
          };
        }
        const fieldsSet = new Set(layerSource.fetched_hits.fields);
        const shortFieldsSet: Set<string> = new Set(layerSource.fetched_hits.short_form_fields);
        if (layerValues.propertyProvidedFieldAggFg && layerValues.propertyProvidedFieldAggFg.propertyProvidedFieldSortCtrl) {
          sorts = layerValues.propertyProvidedFieldAggFg.propertyProvidedFieldSortCtrl.split(',');
        }
        fieldsSet.add(layerValues.propertyProvidedFieldAggFg.propertyProvidedFieldAggCtrl);
        if (layerValues.propertyProvidedFieldAggFg.propertyShortFormatCtrl) {
          shortFieldsSet.add(layerValues.propertyProvidedFieldAggFg.propertyProvidedFieldAggCtrl);
        }
        layerSource.fetched_hits = {
          sorts,
          fields: Array.from(fieldsSet),
          short_form_fields: Array.from(shortFieldsSet)
        };
        break;
      }
      case PROPERTY_SELECTOR_SOURCE.provided_field_for_feature:
      case PROPERTY_SELECTOR_SOURCE.provided_numeric_field_for_feature: {
        layerSource.include_fields.push(layerValues.propertyProvidedFieldFeatureFg.propertyProvidedFieldFeatureCtrl);
        if (layerValues.propertyProvidedFieldFeatureFg.propertyShortFormatCtrl) {
          layerSource.short_form_fields.push(layerValues.propertyProvidedFieldFeatureFg.propertyProvidedFieldFeatureCtrl);
        }
        break;
      }
      case PROPERTY_SELECTOR_SOURCE.displayable_metric_on_field:
      case PROPERTY_SELECTOR_SOURCE.metric_on_field: {
        const countMetricFg = layerValues.propertyCountOrMetricFg;
        if (countMetricFg.propertyCountOrMetricCtrl === 'count') {
          layerSource.metrics.push({
            field: '',
            metric: 'count',
            normalize: false,
            short_format: !!countMetricFg.propertyShortFormatCtrl
          });
        } else {
          layerSource.metrics.push({
            field: countMetricFg.propertyFieldCtrl,
            metric: countMetricFg.propertyMetricCtrl.toString().toLowerCase(),
            normalize: false,
            short_format: !!countMetricFg.propertyShortFormatCtrl
          });
        }
        break;
      }
      case PROPERTY_SELECTOR_SOURCE.generated: {
        layerSource.colors_from_fields.push(layerValues.propertyGeneratedFieldCtrl);
        break;
      }
      case PROPERTY_SELECTOR_SOURCE.manual: {
        layerSource.include_fields.push(layerValues.propertyManualFg.propertyManualFieldCtrl);
        break;
      }
      case PROPERTY_SELECTOR_SOURCE.interpolated: {
        const interpolatedValues = layerValues.propertyInterpolatedFg;
        if (mode === LAYER_MODE.features) {
          if (interpolatedValues.propertyInterpolatedNormalizeCtrl) {
            layerSource.normalization_fields.push(
              {
                on: interpolatedValues.propertyInterpolatedFieldCtrl,
                per: interpolatedValues.propertyInterpolatedNormalizeLocalFieldCtrl
              });
          } else {
            layerSource.include_fields.push(interpolatedValues.propertyInterpolatedFieldCtrl);
          }
        } else {
          if (interpolatedValues.propertyInterpolatedCountOrMetricCtrl === 'count') {
            layerSource.metrics.push({
              field: '',
              metric: 'count',
              normalize: !!interpolatedValues.propertyInterpolatedCountNormalizeCtrl
            });
          } else {
            layerSource.metrics.push({
              field: interpolatedValues.propertyInterpolatedFieldCtrl,
              metric: (interpolatedValues.propertyInterpolatedMetricCtrl).toString().toLowerCase(),
              normalize: !!interpolatedValues.propertyInterpolatedNormalizeCtrl
            });
          }
        }
        break;
      }
    }
  }

  private static getSearchContributor(searchConfigGlobal: SearchGlobalFormGroup, collection: string): ContributorConfig[] {
    return searchConfigGlobal.customControls.searchConfigurations.controls.map(sc => ({
      type: SEARCH_TYPE,
      identifier: SEARCH_TYPE + '_' + sc.customControls.collection.value + '_'
        + sc.customControls.searchField.value + '_' + sc.customControls.autocompleteField.value,
      collection: sc.customControls.collection.value,
      search_field: sc.customControls.searchField.value,
      name: searchConfigGlobal.customControls.name.value,
      icon: searchConfigGlobal.customControls.unmanagedFields.icon.value,
      autocomplete_field: sc.customControls.autocompleteField.value,
      autocomplete_size: searchConfigGlobal.customControls.autocompleteSize.value,
    }));

  }

  // TODO put in common with getAnalyticsContributor ?
  private static getTimelineContributor(
    timelineConfigGlobal: TimelineGlobalFormGroup,
    isDetailed: boolean,
    collectionParamsMap?: Map<string, CollectionReferenceDescription>
  ): ContributorConfig {

    const timelineAggregation = timelineConfigGlobal.customControls.tabsContainer.dataStep.timeline.aggregation.customControls;
    const detailedTimelineDataStep = timelineConfigGlobal.customControls.tabsContainer.dataStep.detailedTimeline;
    const collection = timelineConfigGlobal.customControls.tabsContainer.dataStep.timeline.collection.value;
    const unmanagedDataFields = isDetailed ?
      timelineConfigGlobal.customControls.unmanagedFields.dataStep.detailedTimeline :
      timelineConfigGlobal.customControls.unmanagedFields.dataStep.timeline;
    const contributor: ContributorConfig = {
      type: (isDetailed ? 'detailedhistogram' : 'histogram'),
      identifier: (isDetailed ? 'detailedTimeline' : 'timeline'),
      collection,
      name: unmanagedDataFields.name.value,
      icon: unmanagedDataFields.icon.value,
      isOneDimension: unmanagedDataFields.isOneDimension.value,
      useUtc: timelineConfigGlobal.value.useUtc
    };

    const aggregationModel: AggregationModelConfig = {
      type: 'datehistogram',
      field: timelineAggregation.aggregationField.value
    };

    if (!isDetailed && timelineAggregation.aggregationBucketOrInterval.value === BY_BUCKET_OR_INTERVAL.INTERVAL) {
      aggregationModel.interval = {
        value: parseInt(timelineAggregation.aggregationIntervalSize.value, 10),
        unit: timelineAggregation.aggregationIntervalUnit.value
      };
    } else if (!isDetailed) {
      contributor.numberOfBuckets = timelineAggregation.aggregationBucketsNumber.value;
    } else {
      contributor.numberOfBuckets = detailedTimelineDataStep.bucketsNumber.value;
    }

    contributor.aggregationmodels = [aggregationModel];

    if (isDetailed) {
      contributor.annexedContributorId = 'timeline';
      contributor.selectionExtentPercentage =
        timelineConfigGlobal.customControls.tabsContainer.renderStep.detailedTimeline.selectionExtentPercent.value / 100;
    }
    if (!!timelineConfigGlobal.value.tabsContainer.dataStep.additionalCollections.collections && !!collectionParamsMap) {
      contributor.additionalCollections = timelineConfigGlobal.value.tabsContainer.dataStep.additionalCollections.collections
        .filter(c => collectionParamsMap.has(c.value))
        .map(
          c => ({
            collectionName: c.value,
            field: collectionParamsMap.get(c.value).params.timestamp_path
          })
        );
    }


    return contributor;
  }

  private static getTimelineComponent(timelineConfigGlobal: TimelineGlobalFormGroup, isDetailed: boolean): AnalyticComponentConfig {

    const renderStep = isDetailed ? timelineConfigGlobal.customControls.tabsContainer.renderStep.detailedTimeline :
      timelineConfigGlobal.customControls.tabsContainer.renderStep.timeline;

    const timelineUuid = timelineConfigGlobal.customControls.unmanagedFields.dataStep.timeline.uuid;
    const detailedTimelineUuid = timelineConfigGlobal.customControls.unmanagedFields.dataStep.detailedTimeline.uuid;

    const unmanagedTimelineFields = timelineConfigGlobal.customControls.unmanagedFields.renderStep.timeline;
    const unmanagedDetailedTimelineFields = timelineConfigGlobal.customControls.unmanagedFields.renderStep.detailedTimeline;
    const unmanagedFields = isDetailed ? unmanagedDetailedTimelineFields : unmanagedTimelineFields;

    const timelineComponent: AnalyticComponentConfig = {
      contributorId: (isDetailed ? 'detailedTimeline' : 'timeline'),
      componentType: WIDGET_TYPE.histogram,
      uuid: isDetailed ? detailedTimelineUuid.value : timelineUuid.value,
      input: {
        id: isDetailed ? 'histogram-detailed-timeline' : 'histogram-timeline',
        xTicks: unmanagedFields.xTicks.value,
        yTicks: unmanagedFields.yTicks.value,
        xLabels: unmanagedFields.xLabels.value,
        yLabels: unmanagedFields.yLabels.value,
        xUnit: unmanagedFields.xUnit.value,
        yUnit: unmanagedFields.yUnit.value,
        chartXLabel: unmanagedFields.chartXLabel.value,
        shortYLabels: unmanagedFields.shortYLabels.value,
        chartTitle: renderStep.chartTitle.value,
        customizedCssClass: unmanagedFields.customizedCssClass.value,
        multiselectable: isDetailed ?
          unmanagedDetailedTimelineFields.multiselectable.value :
          timelineConfigGlobal.customControls.tabsContainer.renderStep.timeline.isMultiselectable.value,
        brushHandlesHeightWeight: unmanagedFields.brushHandlesHeightWeight.value,
        dataType: 'time',
        isHistogramSelectable: unmanagedFields.isHistogramSelectable.value,
        ticksDateFormat: timelineConfigGlobal.customControls.tabsContainer.renderStep.timeline.dateFormat.value,
        chartType: renderStep.chartType.value,
        chartHeight: unmanagedFields.chartHeight.value,
        chartWidth: unmanagedFields.chartWidth.value,
        xAxisPosition: unmanagedFields.xAxisPosition.value,
        yAxisStartsFromZero: unmanagedFields.yAxisStartsFromZero.value,
        descriptionPosition: unmanagedFields.descriptionPosition.value,
        showXTicks: unmanagedFields.showXTicks.value,
        showYTicks: unmanagedFields.showYTicks.value,
        showXLabels: unmanagedFields.showXLabels.value,
        showYLabels: unmanagedFields.showYLabels.value,
        showHorizontalLines: unmanagedFields.showHorizontalLines.value,
        isSmoothedCurve: unmanagedFields.isSmoothedCurve.value,
        barWeight: unmanagedFields.barWeight.value
      } as AnalyticComponentHistogramInputConfig
    };

    if (!isDetailed) {
      timelineComponent.input.topOffsetRemoveInterval = unmanagedTimelineFields.topOffsetRemoveInterval.value;
    }

    return timelineComponent;
  }

  public static getAnalyticsContributor(widgetType: any, widgetData: any, icon: string): ContributorConfig {
    // TODO use customControls from widgets config form groups, like the Search export
    const contrib = this.getWidgetContributor(widgetData, widgetType, icon);
    switch (widgetType) {
      case WIDGET_TYPE.histogram: {
        contrib.type = 'histogram';
        const aggregationModel = {
          type: widgetData.dataStep.aggregation.aggregationFieldType === 'time' ? 'datehistogram' : 'histogram',
          field: widgetData.dataStep.aggregation.aggregationField
        } as AggregationModelConfig;

        this.addNumberOfBucketsOrInterval(contrib, aggregationModel, widgetData.dataStep.aggregation);

        this.addMetricToAggregationModel(aggregationModel, widgetData.dataStep.metric);

        contrib.jsonpath = widgetData.dataStep.metric.metricCollectFunction === DEFAULT_METRIC_VALUE ?
          JSONPATH_COUNT : JSONPATH_METRIC;
        contrib.useUtc = widgetData.dataStep.useUtc;
        contrib.aggregationmodels = [aggregationModel];

        break;
      }
      case WIDGET_TYPE.swimlane: {
        contrib.type = 'swimlane';
        const swimlane = {
          id: 1,
          name: widgetData.title,
          xAxisField: widgetData.dataStep.aggregation.aggregationField,
          termField: widgetData.dataStep.termAggregation.termAggregationField
        } as SwimlaneConfig;

        swimlane.aggregationmodels = [];
        swimlane.useUtc = widgetData.dataStep.useUtc;
        swimlane.aggregationmodels.push({
          type: 'term',
          field: widgetData.dataStep.termAggregation.termAggregationField,
          size: widgetData.dataStep.termAggregation.termAggregationSize
        });

        const dateAggregationModel = {
          type: widgetData.dataStep.aggregation.aggregationFieldType === 'time' ? 'datehistogram' : 'histogram',
          field: widgetData.dataStep.aggregation.aggregationField
        } as AggregationModelConfig;
        this.addNumberOfBucketsOrInterval(contrib, dateAggregationModel, widgetData.dataStep.aggregation);

        this.addMetricToAggregationModel(dateAggregationModel, widgetData.dataStep.metric);

        swimlane.aggregationmodels.push(dateAggregationModel);
        swimlane.jsonpath = widgetData.dataStep.metric.metricCollectFunction === DEFAULT_METRIC_VALUE ?
          '$.count' : '$.metrics[0].value';
        contrib.swimlanes = [swimlane];
        break;
      }
      case WIDGET_TYPE.metric: {
        contrib.type = 'metric';
        contrib.function = !!widgetData.dataStep.function ? widgetData.dataStep.function : 'm[0]';
        contrib.metrics = Array.from(widgetData.dataStep.metrics);

        break;
      }
      case WIDGET_TYPE.metricstable: {
        contrib.type = 'metricstable';
        contrib.collection = widgetData.collection;
        contrib.numberOfBuckets = widgetData.dataStep.numberOfBuckets;
        if (!!widgetData.dataStep.sort && !!widgetData.dataStep.sort.collection) {
          contrib.sort = widgetData.dataStep.sort;
        }
        contrib.configuration = widgetData.dataStep.subtables.map(c => ({
          termfield: c.aggregationField,
          collection: c.collection,
          metrics: c.columns.map(c => ({
            metric: c.metricCollectFunction,
            field: c.metricCollectField,
          }))
        }));
        break;
      }
      case WIDGET_TYPE.powerbars: {
        contrib.type = 'tree';
        const aggregationModel: AggregationModelConfig = {
          type: 'term',
          field: widgetData.dataStep.aggregationField,
          size: widgetData.dataStep.aggregationSize,
          order: widgetData.dataStep.metric.sortOrder,
          on: widgetData.dataStep.metric.sortOn
        };
        if (!!widgetData.renderStep.propertyProvidedColorFieldCtrl) {
          contrib.colorField = widgetData.renderStep.propertyProvidedColorFieldCtrl;
          aggregationModel.fetch_hits = {
            size: 1,
            include: [contrib.colorField]
          };
        }
        this.addMetricToAggregationModel(aggregationModel, widgetData.dataStep.metric);
        contrib.jsonpath = widgetData.dataStep.metric.metricCollectFunction === DEFAULT_METRIC_VALUE ?
          JSONPATH_COUNT : JSONPATH_METRIC;
        contrib.aggregationmodels = [aggregationModel];
        if (!!widgetData.dataStep.operator) {
          contrib.filterOperator = widgetData.dataStep.operator === 'Neq' ? 'Ne' : 'Eq';
        }
        contrib.allowOperatorChange = widgetData.renderStep.allowOperatorChange;
        break;
      }
      case WIDGET_TYPE.donut: {
        contrib.type = 'tree';
        contrib.aggregationmodels = Array.from(widgetData.dataStep.aggregationmodels).map((agg: any) => {
          agg.type = 'term';
          return agg;
        });
        break;
      }
      case WIDGET_TYPE.resultlist: {
        contrib.type = 'resultlist';
        contrib.search_size = widgetData.dataStep.searchSize;
        const fieldsConfig: FieldsConfiguration = {
          idFieldName: widgetData.dataStep.idFieldName,
          titleFieldNames: [{ fieldPath: widgetData.renderStep.tileLabelField, process: '' }],
          tooltipFieldNames: [{ fieldPath: widgetData.renderStep.tooltipField, process: '' }],
          icon: 'fiber_manual_record',
          iconColorFieldName: widgetData.renderStep.colorIdentifier
        };
        if (widgetData.renderStep.thumbnailUrl) {
          fieldsConfig.urlThumbnailTemplate = widgetData.renderStep.thumbnailUrl;
        }
        if (widgetData.renderStep.imageUrl) {
          fieldsConfig.urlImageTemplate = widgetData.renderStep.imageUrl;
        }
        if (widgetData.dataStep.detailsTitle) {
          fieldsConfig.detailsTitleTemplate = widgetData.dataStep.detailsTitle;
        }

        contrib.fieldsConfiguration = fieldsConfig;
        contrib.columns = [];
        (widgetData.dataStep.columns as Array<any>).forEach(c =>
          contrib.columns.push({
            columnName: c.columnName,
            fieldName: c.fieldName,
            dataType: c.dataType,
            process: c.process,
            useColorService: !!c.useColorService,
            sort: c.sort
          }));

        contrib.details = [];
        (widgetData.dataStep.details).forEach((d, index) => {
          const fields = d.fields.map(f => ({
            path: f.path,
            label: f.label,
            process: f.process
          }));
          contrib.details.push({
            name: d.name,
            order: index + 1,
            fields
          });
        });
        contrib.includeMetadata = [];
        const metadatas = new Set<string>();
        /** TODO :Grid steps contains, booleans, urls...; we need to filter those controls properly */
        Object.keys(widgetData.renderStep).forEach(v => {
          if (!!widgetData.renderStep[v] && v !== 'isDefaultMode') {
            if (Array.isArray(widgetData.renderStep[v])) {
              (widgetData.renderStep[v] as Array<string>).forEach(f => metadatas.add(f));
            } else {
              metadatas.add(widgetData.renderStep[v]);
            }
          }
        });
        contrib.includeMetadata = Array.from(metadatas);
        break;
      }
    }
    return contrib;
  }

  private static getResultListContributors(resultLists: FormArray): ContributorConfig[] {
    const contribs = [];
    resultLists.value.forEach(list => {
      const contrib = this.getWidgetContributor(list, WIDGET_TYPE.resultlist, 'table_chart');
      contrib.type = 'resultlist';
      contrib.search_size = list.dataStep.searchSize;
      const fieldsConfig: FieldsConfiguration = {
        idFieldName: list.dataStep.idFieldName,
        titleFieldNames: [{
          fieldPath: list.gridStep.tileLabelField,
          process: list.gridStep.tileLabelFieldProcess
        }],
        tooltipFieldNames: [{
          fieldPath: list.gridStep.tooltipField,
          process: list.gridStep.tooltipFieldProcess
        }],
        iconColorFieldName: list.gridStep.colorIdentifier,
        useHttpQuicklooks: list.gridStep.useHttpQuicklooks,
        useHttpThumbnails: list.gridStep.useHttpThumbnails
      };
      if (list.dataStep.detailsTitle) {
        fieldsConfig.detailsTitleTemplate = list.dataStep.detailsTitle;
      }
      if (list.gridStep.thumbnailUrl) {
        fieldsConfig.urlThumbnailTemplate = list.gridStep.thumbnailUrl;
      }

      if (list.gridStep.quicklookUrls) {
        fieldsConfig.urlImageTemplates = list.gridStep.quicklookUrls.map(formValues => {
          const quicklook: DescribedUrl = { url: formValues.url, description: formValues.description };
          if (formValues.filter.field !== '') {
            quicklook.filter = { field: formValues.filter.field, values: formValues.filter.values.map(v => v.value) };
          }
          return quicklook;
        });
      }

      contrib.fieldsConfiguration = fieldsConfig;
      contrib.columns = [];
      (list.dataStep.columns as Array<any>).forEach(c =>
        contrib.columns.push({
          columnName: c.columnName,
          fieldName: c.fieldName,
          dataType: c.dataType,
          process: c.process,
          useColorService: !!c.useColorService,
          sort: c.sort
        }));

      contrib.details = [];
      (list.dataStep.details).forEach((d, index) => {
        const fields = d.fields.map(f => ({
          path: f.path,
          label: f.label,
          process: f.process
        }));
        contrib.details.push({
          name: d.name,
          order: index + 1,
          fields
        });
      });
      contrib.includeMetadata = [];
      const metadatas = new Set<string>();
      /** TODO : Grid steps contains, booleans, urls...; we need to filter those controls properly */
      Object.keys(list.gridStep).forEach(v => {
        if (!!list.gridStep[v] && v !== 'isDefaultMode') {
          if (Array.isArray(list.gridStep[v])) {
            (list.gridStep[v] as Array<string>).forEach(f => metadatas.add(f));
          } else {
            metadatas.add(list.gridStep[v]);
          }
        }
      });
      contribs.push(contrib);
    });
    return contribs;
  }

  public static getResultListComponent(resultLists: FormArray) {
    const lists = [];
    resultLists.value.forEach(list => {
      lists.push(this.getAnalyticsComponent(WIDGET_TYPE.resultlist, list, null));
    });

    return lists;
  }

  private static getWidgetContributor(widgetData: any, widgetType: any, icon: string) {
    return {
      identifier: this.getContributorId(widgetData, widgetType),
      name: widgetData.title,
      title: widgetData.title,
      collection: widgetData.dataStep.collection,
      icon,
      ... !!widgetData.renderStep?.chartType ?
        {
          charttype: widgetData.renderStep?.chartType,
          isOneDimension: widgetData.unmanagedFields.dataStep.isOneDimension
        } : {}
    } as ContributorConfig;
  }

  public static getAnalyticsGroup(tabName: string, group: any, groupIndex: number, lookAndFeelGlobalFormGroup?: LookAndFeelGlobalFormGroup) {
    const groupAnalytic = {
      groupId: tabName + '-' + groupIndex.toString(),
      title: group.title,
      tab: tabName,
      icon: group.icon,
      components: []
    } as AnalyticConfig;
    group.content.forEach(widget => {
      groupAnalytic.components.push(this.getAnalyticsComponent(
        widget.widgetType, widget.widgetData, group.itemPerLine, lookAndFeelGlobalFormGroup));
    });

    return groupAnalytic;
  }

  private static addMetricToAggregationModel(aggregationModel: AggregationModelConfig, metricData: any) {
    if (!!metricData.metricCollectFunction && metricData.metricCollectFunction !== DEFAULT_METRIC_VALUE) {
      aggregationModel.metrics = [
        {
          collect_fct: metricData.metricCollectFunction.toLowerCase(),
          collect_field: metricData.metricCollectField
        }
      ];
    }
  }

  /**
   * generates an identifier based on the definition of the contributor:
   * - aggregationmodel
   * - metrics ...
   * @param widgetData The widget's configuration from a form
   * @param widgetType Type of the widget
   * @returns The id of the resulting contributor
   */
  public static getContributorId(widgetData: any, widgetType: string): string {
    let idString = widgetData.dataStep.collection + '-';
    if (widgetType === WIDGET_TYPE.histogram || widgetType === WIDGET_TYPE.swimlane) {
      const agg = widgetData.dataStep.aggregation;
      idString += agg.aggregationField + '-' + agg.aggregationFieldType + '-' + agg.aggregationBucketOrInterval;
      if (!!widgetData.dataStep.metric) {
        idString += '-' + (widgetData.dataStep.metric.metricCollectFunction !== undefined ?
          widgetData.dataStep.metric.metricCollectFunction : '') + '-' + (!!widgetData.dataStep.metric.metricCollectField ?
          widgetData.dataStep.metric.metricCollectField : '');
      }
      if (agg.aggregationBucketOrInterval === 'bucket') {
        idString += '-' + agg.aggregationBucketsNumber;
      } else {
        idString += '-' + agg.aggregationIntervalSize + '-' + (!!agg.aggregationIntervalUnit ? agg.aggregationIntervalUnit : '');
      }
      if (widgetType === WIDGET_TYPE.swimlane) {
        const termAgg = widgetData.dataStep.termAggregation;
        idString += !!termAgg.termAggregationField ? termAgg.termAggregationField : '' + '-' + termAgg.termAggregationSize;
      }
    } else if (widgetType === WIDGET_TYPE.powerbars) {
      idString += widgetData.dataStep.aggregationField + '-' + widgetData.dataStep.aggregationSize;
      if (!!widgetData.dataStep.metric) {
        idString += widgetData.dataStep.metric.metricCollectFunction !== undefined ?
          ('-' + widgetData.dataStep.metric.metricCollectFunction) : '';
        idString += !!widgetData.dataStep.metric.metricCollectField ? ('-' + widgetData.dataStep.metric.metricCollectField) : '';
        idString += widgetData.dataStep.metric.sortOrder !== undefined ? ('-' + widgetData.dataStep.metric.sortOrder) : '';
        idString += widgetData.dataStep.metric.sortOn !== undefined ? ('-' + widgetData.dataStep.metric.sortOn) : '';
      }
    } else if (widgetType === WIDGET_TYPE.metric) {
      idString += widgetData.dataStep.function +
        Array.from(widgetData.dataStep.metrics)
          .map((m: any) => m.field + '-' + m.metric + '-' + hashCode(stringifyArlasFilter(m.filter))).sort().join('');
    } else if (widgetType === WIDGET_TYPE.metricstable) {
      idString = Array.from(widgetData.dataStep.subtables).map((sb: any) =>
        sb.collection + '-' + sb.aggregationField + '-' + Array.from(sb.columns)
          .map((c: any) => c.metricCollectFunction + '-' + c.metricCollectField).join('-')

      ).join('-');
    } else if (widgetType === WIDGET_TYPE.donut) {
      widgetData.dataStep.aggregationmodels.forEach(am => {
        idString += am.field + '-' + am.size + '-';
      });
    } else if (widgetType === WIDGET_TYPE.resultlist) {
      idString += widgetData.dataStep.idFieldName + '-' + widgetData.dataStep.searchSize + '-';
      if (!!widgetData.dataStep.columns) {
        widgetData.dataStep.columns.forEach(c => idString += c.columnName + '-');
      }
      if (!!widgetData.dataStep.details) {
        widgetData.dataStep.details.forEach(d => idString += d.name + '-');
      }
    }
    return idString;
  }

  private static getAnalyticsComponent(
    widgetType: any,
    widgetData: any,
    itemPerLine: number,
    lookAndFeelConfigGlobal?: LookAndFeelGlobalFormGroup): AnalyticComponentConfig {
    const unmanagedRenderFields = widgetData.unmanagedFields.renderStep;
    const analyticsBoardWidth = 445;
    const contributorId = this.getContributorId(widgetData, widgetType);
    const uuid = widgetData.uuid;
    const usage = widgetData.usage;
    let component: AnalyticComponentConfig;
    if ([WIDGET_TYPE.histogram, WIDGET_TYPE.swimlane].indexOf(widgetType) >= 0) {
      const title = widgetData.title;
      component = {
        input: {
          id: contributorId,
          isHistogramSelectable: unmanagedRenderFields.isHistogramSelectable,
          multiselectable: !!widgetData.renderStep.multiselectable,
          topOffsetRemoveInterval: unmanagedRenderFields.topOffsetRemoveInterval,
          leftOffsetRemoveInterval: unmanagedRenderFields.leftOffsetRemoveInterval,
          brushHandlesHeightWeight: unmanagedRenderFields.brushHandlesHeightWeight,
          yAxisStartsFromZero: unmanagedRenderFields.yAxisStartsFromZero,
          chartType: widgetData.renderStep.chartType,
          chartTitle: title,
          chartHeight: !!unmanagedRenderFields.chartHeight ? unmanagedRenderFields.chartHeight : 100,
          chartWidth: !!itemPerLine && +itemPerLine !== 1 ?
            Math.ceil(analyticsBoardWidth / itemPerLine) - 6 : analyticsBoardWidth, // 6 => margin and padding left/right
          xAxisPosition: unmanagedRenderFields.xAxisPosition,
          descriptionPosition: unmanagedRenderFields.descriptionPosition,
          xTicks: unmanagedRenderFields.xTicks,
          yTicks: unmanagedRenderFields.yTicks,
          xLabels: unmanagedRenderFields.xLabels,
          yLabels: unmanagedRenderFields.yLabels,
          xUnit: unmanagedRenderFields.xUnit,
          yUnit: unmanagedRenderFields.yUnit,
          chartXLabel: unmanagedRenderFields.chartXLabel,
          chartYLabel: unmanagedRenderFields.chartYLabel,
          shortYLabels: unmanagedRenderFields.shortYLabels,
          showXTicks: unmanagedRenderFields.showXTicks,
          showYTicks: unmanagedRenderFields.showYTicks,
          showXLabels: unmanagedRenderFields.showXLabels,
          showYLabels: unmanagedRenderFields.showYLabels,
          showHorizontalLines: widgetData.renderStep.showHorizontalLines,
          barWeight: unmanagedRenderFields.barWeight,
          dataType: widgetData.dataStep.aggregation.aggregationFieldType,
          highighlightItems: undefined
        } as AnalyticComponentInputConfig
      } as AnalyticComponentConfig;

      switch (widgetType) {
        case WIDGET_TYPE.histogram: {
          component.componentType = WIDGET_TYPE.histogram;
          component.showExportCsv = widgetData.renderStep.showExportCsv;
          component.input.ticksDateFormat = widgetData.renderStep.ticksDateFormat;
          component.input.customizedCssClass = widgetData.dataStep.aggregation.aggregationFieldType === 'numeric' ?
            'arlas-histogram-analytics' : 'arlas-timeline-analytics';
          (component.input as AnalyticComponentHistogramInputConfig).isSmoothedCurve = unmanagedRenderFields.isSmoothedCurve;

          ConfigExportHelper.updateCollectionUnit(widgetData, lookAndFeelConfigGlobal, component);
          break;
        }
        case WIDGET_TYPE.swimlane: {
          component.componentType = WIDGET_TYPE.swimlane;
          component.showExportCsv = false;
          const swimlaneInput = (component.input as AnalyticComponentSwimlaneInputConfig);
          swimlaneInput.swimLaneLabelsWidth = unmanagedRenderFields.swimLaneLabelsWidth;
          swimlaneInput.swimlaneHeight = unmanagedRenderFields.swimlaneHeight;
          swimlaneInput.swimlaneMode = widgetData.renderStep.swimlaneMode;
          swimlaneInput.swimlaneBorderRadius = unmanagedRenderFields.swimlaneBorderRadius;
          swimlaneInput.paletteColors = widgetData.renderStep.paletteColors;
          swimlaneInput.swimlane_representation = widgetData.renderStep.swimlaneRepresentation;
          swimlaneInput.customizedCssClass = 'arlas-swimlane';
          const swimlaneOptions = {} as AnalyticComponentSwimlaneInputOptionsConfig;
          swimlaneOptions.nan_color = widgetData.renderStep.NaNColor;
          if (!!widgetData.renderStep.zerosColors) {
            swimlaneOptions.zeros_color = widgetData.renderStep.zerosColors;
          }
          swimlaneInput.swimlane_options = swimlaneOptions;
          break;
        }
      }
    } else if (widgetType === WIDGET_TYPE.metric) {
      component = {
        componentType: WIDGET_TYPE.metric,
        input: {
          customizedCssClass: unmanagedRenderFields.customizedCssClass,
          shortValue: !!widgetData.renderStep.shortValue,
          valuePrecision: +widgetData.renderStep.valuePrecision,
          chartWidth: !!itemPerLine && +itemPerLine !== 1 ?
            Math.ceil(analyticsBoardWidth / itemPerLine) - 6 : analyticsBoardWidth // 6 => margin and padding left/right
        }
      } as AnalyticComponentConfig;
      if (widgetData.renderStep.beforeValue) {
        component.input.beforeValue = widgetData.renderStep.beforeValue;
      }
      if (widgetData.renderStep.afterValue) {
        component.input.afterValue = widgetData.renderStep.afterValue;
      }
    } else if (widgetType === WIDGET_TYPE.powerbars) {
      component = {
        showExportCsv: widgetData.renderStep.showExportCsv,
        componentType: WIDGET_TYPE.powerbars,
        input: {
          chartTitle: widgetData.title,
          powerbarTitle: widgetData.title,
          displayFilter: !!widgetData.renderStep.displayFilter,
          scrollable: !!widgetData.renderStep.scrollable,
          filterOperator: {
            value: !!widgetData.dataStep.operator ? widgetData.dataStep.operator : 'Eq',
            display: !!widgetData.renderStep.allowOperatorChange
          },
          useColorService: !!widgetData.renderStep.useColorService,
          useColorFromData: !!widgetData.renderStep.useColorFromData,
          unit: widgetData.dataStep.unit,
          chartWidth: !!itemPerLine && +itemPerLine !== 1 ?
            Math.ceil(analyticsBoardWidth / itemPerLine) - 6 : analyticsBoardWidth // 6 => margin and padding left/right
        }
      } as AnalyticComponentConfig;
    } else if (widgetType === WIDGET_TYPE.metricstable) {
      component = {
        componentType: WIDGET_TYPE.metricstable,
        input: {
          filterOperator: {
            value: 'Eq',
            display: !!widgetData.renderStep.allowOperatorChange
          },
          useColorService: !!widgetData.renderStep.useColorService,
          normaliseBy: widgetData.renderStep.normaliseBy,
          showRowField: widgetData.renderStep.showRowField,
          applyColorTo: 'row',
          headerDisplayMode: widgetData.renderStep.headerDisplayMode,
          selectWithCheckbox: !!widgetData.renderStep.selectWithCheckbox,
        }
      } as AnalyticComponentConfig;
    } else if (widgetType === WIDGET_TYPE.donut) {
      if (!itemPerLine) {
        itemPerLine = 1;
      }
      const containerWidth = Math.ceil(analyticsBoardWidth / +itemPerLine);
      let donutDiameter = 175;
      if (!!itemPerLine && +itemPerLine === 2) {
        donutDiameter = 170;
      }
      if (!!itemPerLine && +itemPerLine === 3) {
        donutDiameter = 125;
      }
      component = {
        componentType: WIDGET_TYPE.donut,
        showExportCsv: widgetData.renderStep.showExportCsv,
        input: {
          id: contributorId,
          customizedCssClass: unmanagedRenderFields.customizedCssClass,
          diameter: donutDiameter,
          containerWidth,
          multiselectable: !!widgetData.renderStep.multiselectable,
          opacity: widgetData.renderStep.opacity
        }
      } as AnalyticComponentConfig;

    } else if (widgetType === WIDGET_TYPE.resultlist) {
      component = {
        componentType: WIDGET_TYPE.resultlist,
        input: {
          id: contributorId,
          tableWidth: !!itemPerLine && +itemPerLine !== 1 ?
            Math.ceil(analyticsBoardWidth / itemPerLine) - 6 : analyticsBoardWidth, // 6 => margin and padding left/right
          globalActionsList: unmanagedRenderFields.globalActionsList,
          searchSize: widgetData.dataStep.searchSize,
          nLastLines: unmanagedRenderFields.nLastLines,
          detailedGridHeight: unmanagedRenderFields.detailedGridHeight,
          nbGridColumns: unmanagedRenderFields.nbGridColumns,
          displayFilters: !!widgetData.settingsStep.displayFilters,
          hasGridMode: !!widgetData.gridStep.thumbnailUrl,
          defautMode: (!!widgetData.gridStep.thumbnailUrl && !!widgetData.gridStep.isDefaultMode) ?
            'grid' : 'list',
          visualisationLink: widgetData.sactionStep.visualisationLink,
          downloadLink: widgetData.sactionStep.downloadLink,
          isBodyHidden: unmanagedRenderFields.isBodyHidden,
          isGeoSortActived: !!widgetData.settingsStep.isGeoSortActived,
          isAutoGeoSortActived: unmanagedRenderFields.isAutoGeoSortActived,
          selectedItemsEvent: unmanagedRenderFields.selectedItemsEvent,
          consultedItemEvent: unmanagedRenderFields.consultedItemEvent,
          actionOnItemEvent: unmanagedRenderFields.actionOnItemEvent,
          globalActionEvent: unmanagedRenderFields.globalActionEvent,
          useColorService: true,
          cellBackgroundStyle: widgetData.settingsStep.cellBackgroundStyle,
          visualisationsList: ConfigExportHelper.getVisualisationList(widgetData.visualisationStep.visualisationsList),
          options: {
            showActionsOnhover: 'true',
            showDetailIconName: 'keyboard_arrow_down',
            hideDetailIconName: 'keyboard_arrow_up',
            icon: widgetData.icon,
            showName: widgetData.showName,
            showIcon: widgetData.showIcon
          }
        } as AnalyticComponentResultListInputConfig
      } as AnalyticComponentConfig;
    }
    component.contributorId = contributorId;
    component.uuid = uuid;
    component.usage = usage;
    return component;
  }

  public static getVisualisationList(visualisationList: ResultListVisualisationFormWidget[]){
    const visualisations = [];
    visualisationList.forEach(visualisationWidgetConfig => {
      const visualisation: VisualisationListInputConfig =  {
        name: visualisationWidgetConfig.name,
        description: visualisationWidgetConfig.description,
        dataGroups: []
      };
      visualisation.dataGroups = this.buildDataGroups(visualisationWidgetConfig);
      visualisations.push(visualisation);
    });
    return visualisations;
  }

  public static buildDataGroups(visualisationWidgetConfig: ResultListVisualisationFormWidget){
    return visualisationWidgetConfig.dataGroups.map(dataG => {
      const dataGroup: DataGroupInputConfig = {
        filters: [],
        name: dataG.name,
        protocol: dataG.protocol,
        visualisationUrl: dataG.visualisationUrl
      };
      dataGroup.filters = this.buildDataGroupCriteria(dataG);
      return dataGroup;
    });
  }

  protected static  buildDataGroupCriteria(dataG: ResultListVisualisationDataGroupFormWidget) {
    return dataG.filters.map(f => {
      // return a lowercase string
      const op = Expression.OpEnum[f.filterOperation];
      // convert in upper case for arlas api
      const opArlas = (op.charAt(0).toUpperCase() + op.slice(1)) as ArlasExpression;
      const criteria: DataGroupInputCondition = {
        field: f.filterField.value,
        op: opArlas,
        type: f.filterField.type,
        value: null
      };

      if (f.filterOperation === Expression.OpEnum.Like) {
        criteria.value =  f.filterValues.filterInValues.map(v => v.value);
      } else if (isNumberOperator(f.filterOperation) &&
      NUMERIC_TYPES.includes(criteria.type as unknown as CollectionReferenceDescriptionProperty.TypeEnum)
      ) {
        criteria.value = f.filterValues.filterEqualValues;
      } else if (f.filterOperation === Expression.OpEnum.Range) {
        criteria.value =  f.filterValues.filterMinRangeValues + ';' + f.filterValues.filterMaxRangeValues;
      } else if (f.filterOperation === Expression.OpEnum.Eq) {
        criteria.value = f.filterValues.filterBoolean;
      }
      return criteria;
    });
  }


  public static updateCollectionUnit(widgetData: any, lookAndFeelConfigGlobal: LookAndFeelGlobalFormGroup, com: AnalyticComponentConfig) {
    if (widgetData.dataStep.metric.metricCollectFunction === 'Count' &&
      lookAndFeelConfigGlobal !== null && lookAndFeelConfigGlobal !== undefined) {
      const value = widgetData.unmanagedFields.renderStep.yUnit;
      const lookAndFeelFormControl = (<FormArray>lookAndFeelConfigGlobal.customControls.units.value).controls
        .filter(c => c.value.collection === widgetData.dataStep.collection);
      const hasFoundValue = lookAndFeelFormControl !== null && lookAndFeelFormControl !== undefined && lookAndFeelFormControl.length > 0;
      if (hasFoundValue) {
        const collectionUnit = lookAndFeelFormControl[0]?.value?.unit ?? widgetData.dataStep.collection.value;
        com.input.yUnit = (widgetData.unmanagedFields.renderStep.yUnit !== collectionUnit) ? collectionUnit : value;
      }
    }
  }

  private static exportSideModulesConfig(config: Config, sideModulesGlobal: SideModulesGlobalFormGroup) {
    const sideModulesControls = sideModulesGlobal.customControls;

    if (sideModulesControls.useShare.value) {
      config.arlas.web.components.share = {
        geojson: {
          max_for_feature: sideModulesControls.share.maxForFeature.value,
          max_for_topology: sideModulesControls.share.maxForTopology.value,
          sort_excluded_type: sideModulesControls.unmanagedFields.sortExcludedTypes.value,
        }
      };
    }

    if (sideModulesControls.useDownload.value) {
      config.arlas.web.components.download = {};
    }

    if (sideModulesControls.useTagger.value) {
      config.arlas.tagger = {
        url: sideModulesControls.tagger.serverUrl.value,
        collection: sideModulesControls.tagger.collection.value,
      };
    }
  }

  public static getOptions(lookAndFeelConfigGlobal: LookAndFeelGlobalFormGroup): WebConfigOptions {
    const showSpinner = !!lookAndFeelConfigGlobal.customControls.spinner.value;
    const spinnerColor: string = lookAndFeelConfigGlobal.customControls.spinnerColor.value;
    const spinnerDiameter: string = lookAndFeelConfigGlobal.customControls.spinnerDiameter.value;
    const zoomToDataStrategy: string = lookAndFeelConfigGlobal.customControls.zoomToDataStrategy.value;

    const options = {
      drag_items: !!lookAndFeelConfigGlobal.customControls.dragAndDrop.value,
      zoom_to_strategy: !!zoomToDataStrategy ? zoomToDataStrategy : ZoomToDataStrategy.NONE,
      indicators: !!lookAndFeelConfigGlobal.customControls.indicators.value,
      spinner: {
        show: showSpinner,
        color: (showSpinner && !!spinnerColor) ? spinnerColor : '',
        diameter: (showSpinner && !!spinnerDiameter) ? spinnerDiameter : ''
      },
      tabs: []
    } as WebConfigOptions;
    return options;
  }

  private static addNumberOfBucketsOrInterval(
    contrib: ContributorConfig,
    aggregationModel: AggregationModelConfig,
    aggregationData: any) {

    if (aggregationData.aggregationBucketOrInterval === BY_BUCKET_OR_INTERVAL.BUCKET) {
      contrib.numberOfBuckets = aggregationData.aggregationBucketsNumber;
    } else {
      aggregationModel.interval = {
        value: parseInt(aggregationData.aggregationIntervalSize, 10)
      };
      if (!!aggregationData.aggregationIntervalUnit) {
        aggregationModel.interval.unit = aggregationData.aggregationIntervalUnit;
      }
    }
  }

  public static toSnakeCase(str) {
    return str &&
      str
        .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        .map(x => x.toLowerCase())
        .join('_');
  }
}
