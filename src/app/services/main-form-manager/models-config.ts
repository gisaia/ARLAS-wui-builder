import { Layer } from './models-map-config';
import { BasemapStyle } from 'arlas-web-components';
import { VisualisationSetConfig } from 'arlas-web-components';

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

export const JSONPATH_COUNT = '$.count';
export const JSONPATH_METRIC = '$.metrics[0].value';
export const CHIPSEARCH_TYPE = 'chipssearch';
export const CHIPSEARCH_IDENTIFIER = 'chipssearch';
import { LayerSourceConfig } from 'arlas-web-contributors';

export interface Config {
  arlas: ArlasConfig;
  'arlas-wui': {
    web: {
      app: {
        components: {
          chipssearch: ChipSearchConfig;
        };
        name: string;
        unit?: string;
        units?: { unit?: string; collection?: string; ignored?: boolean; }[];
        name_background_color: string;
      };
    };
  };
  extraConfigs?: Array<ArlasExtraConfig>;
}
export interface ArlasExtraConfig {
  configPath: string;
  replacedAttribute: string;
  replacer: string;
}

export interface ArlasConfig {
  web: WebConfig;
  server: ServerConfig;
  tagger?: {
    url: string;
    collection: {
      name: string;
    };
  };
}

export interface ChipSearchConfig {
  name: string;
  icon: string;
}

export interface WebConfig {
  contributors: Array<ContributorConfig>;
  components: {
    timeline: AnalyticComponentConfig;
    detailedTimeline?: AnalyticComponentConfig;
    mapgl: MapglComponentConfig;
    resultlists: Array<AnalyticComponentConfig>;
    share?: {
      geojson: {
        max_for_feature: number;
        max_for_topology: number;
        sort_excluded_type: Array<string>;
      };
    };
    download?: {
      auth_type?: string;
    };
  };
  analytics: Array<AnalyticConfig>;
  colorGenerator: { keysToColors: Array<[string, string]>; };
  options?: WebConfigOptions;
  externalNode: any;
}

export interface WebConfigOptions {
  drag_items?: boolean;
  zoom_to_data?: boolean;
  indicators?: boolean;
  spinner?: SpinnerOptions;
}

export interface SpinnerOptions {
  show: boolean;
  diameter?: string;
  color?: string;
  strokeWidth?: number;
}

export interface ServerConfig {
  url: string;
  collection: {
    name: string;
  };
  max_age_cache: number;
}

export interface ContributorConfig {
  type: string;
  identifier: string;
  collection: string;
  geo_query_op?: string;
  geo_query_field?: string;
  layers_sources?: Array<LayerSourceConfig>;
  name: string;
  title?: string;
  charttype?: string;
  search_field?: string;
  network_precision?: any;
  icon?: string;
  autocomplete_field?: string;
  autocomplete_size?: number;
  numberOfBuckets?: number;
  isOneDimension?: boolean;
  aggregationmodels?: Array<AggregationModelConfig>;
  annexedContributorId?: string;
  selectionExtentPercentage?: number;
  datatype?: string;
  jsonpath?: string;
  swimlanes?: Array<SwimlaneConfig>;
  function?: string;
  metrics?: Array<{ field: string; metric: string; }>;
  search_size?: number;
  fieldsConfiguration?: FieldsConfiguration;
  columns?: Array<{ columnName: string; fieldName: string; dataType: string; process: string; useColorService: boolean; }>;
  details?: Array<{
    name: string;
    order: number;
    fields: Array<{ path: string; label: string; process: string; }>;
  }>;
  colorField?: string;
  useUtc?: boolean;
  additionalCollections?: Array<{ collectionName: string; field: string; }>;
  includeMetadata?: Array<string>;
  filterOperator?: string;
  allowOperatorChange?: boolean;
}

export interface FieldsConfiguration {
  idFieldName: string;
  thumbnailFieldName?: string;
  imageFieldName?: string;
  urlImageTemplate?: string;
  urlThumbnailTemplate?: string;
  titleFieldNames?: Array<{ fieldPath: string; process: string; }>;
  tooltipFieldNames?: Array<{ fieldPath: string; process: string; }>;
  iconColorFieldName?: string;
  icon?: string;
}

export interface SwimlaneConfig {
  id: number;
  name: string;
  xAxisField: string;
  termField: string;
  aggregationmodels?: Array<AggregationModelConfig>;
  jsonpath: string;
  useUtc: boolean;
}

export interface AnalyticConfig {
  groupId: string;
  title: string;
  tab: string;
  icon: string;
  components: Array<AnalyticComponentConfig>;
}

export interface AnalyticComponentConfig {
  contributorId: string;
  componentType: string;
  showExportCsv?: boolean;
  input: AnalyticComponentInputConfig;
}

export interface AnalyticComponentInputConfig {
  id: string;
  dataType?: string;
  isHistogramSelectable?: boolean;
  ticksDateFormat?: string;
  multiselectable?: boolean;
  topOffsetRemoveInterval?: number;
  leftOffsetRemoveInterval?: number;
  brushHandlesHeightWeight?: number;
  yAxisStartsFromZero?: boolean;
  chartType?: string;
  chartTitle?: string;
  chartWidth?: number;
  chartHeight?: number;
  customizedCssClass?: string;
  xAxisPosition?: string;
  descriptionPosition?: string;
  xTicks?: number;
  yTicks?: number;
  xLabels?: number;
  yLabels?: number;
  xUnit?: string;
  yUnit?: string;
  unit?: string;
  chartXLabel?: string;
  showXTicks?: boolean;
  showYTicks?: boolean;
  showXLabels?: boolean;
  showYLabels?: boolean;
  shortYLabels?: boolean;
  showHorizontalLines?: boolean;
  barWeight?: number;
  beforeValue?: string;
  afterValue?: string;
  shortValue?: boolean;
  valuePrecision?: number;
  displayFilter?: boolean;
  filterOperator?: {
    value: 'Neq' | 'Eq';
    display: boolean;
  };
  useColorService?: boolean;
  useColorFromData?: boolean;
  opacity?: number;
  powerbarTitle?: string;
  diameter?: number;
  containerWidth?: number;
  tableWidth?: number;
  globalActionsList?: Array<any>;
  searchSize?: number;
  nLastLines?: number;
  detailedGridHeight?: number;
  nbGridColumns?: number;
  defautMode?: string;
  displayFilters?: boolean;
  isBodyHidden?: boolean;
  isGeoSortActived?: boolean;
  isAutoGeoSortActived?: boolean;
  selectedItemsEvent?: any;
  consultedItemEvent?: any;
  actionOnItemEvent?: any;
  globalActionEvent?: any;
  cellBackgroundStyle?: string;
  scrollable?: boolean;
}

export interface AnalyticComponentResultListInputConfig extends AnalyticComponentInputConfig {
  options?: AnalyticComponentResultListInputOptions;
  detailWidth?: number;
  visualisationLink?: string;
  downloadLink?: string;
}

export interface AnalyticComponentResultListInputOptions {
  showActionsOnhover?: string;
  showDetailIconName?: string;
  hideDetailIconName?: string;
}

export interface AnalyticComponentHistogramInputConfig extends AnalyticComponentInputConfig {
  isSmoothedCurve: boolean;
}

export interface AnalyticComponentSwimlaneInputConfig extends AnalyticComponentInputConfig {
  swimLaneLabelsWidth: number;
  swimlaneHeight: number;
  swimlaneMode: string;
  swimlaneBorderRadius: number;
  paletteColors: [number, number];
  swimlane_representation: string;
  swimlane_options: AnalyticComponentSwimlaneInputOptionsConfig;
}

export interface AnalyticComponentSwimlaneInputOptionsConfig {
  zeros_color?: string;
  nan_color?: string;
}

export interface MapglComponentConfig {
  allowMapExtend: boolean;
  nbVerticesLimit?: number;
  input: MapComponentInputConfig;
}

export interface MapComponentInputConfig {
  defaultBasemapStyle: BasemapStyle;
  basemapStyles: Array<BasemapStyle>;
  margePanForLoad: number;
  margePanForTest: number;
  initZoom: number;
  initCenter: [number, number];
  displayScale: boolean;
  displayCurrentCoordinates: boolean;
  idFeatureField: string;
  mapLayers: MapComponentInputMapLayersConfig;
  visualisations_sets: Array<VisualisationSetConfig>;
}

export interface MapComponentInputMapLayersConfig {
  layers: Array<Layer>;
  events: MapComponentInputMapLayersEventsConfig;
  externalEventLayers: Array<{ id: string; on: string; }>;
}

export interface MapComponentInputMapLayersEventsConfig {
  zoomOnClick: Array<string>;
  emitOnClick: Array<string>;
  onHover: Array<string>;
}

export interface AggregationModelConfig {
  type: string;
  field: string;
  size?: number;
  interval?: {
    value: number;
    unit?: string;
  };
  fetch_hits?: {
    size: number;
    include: Array<string>;
  };
  metrics?: Array<AggregationModelMetricConfig>;
}

export interface AggregationModelMetricConfig {
  collect_field: string;
  collect_fct: string;
}

export interface NormalizationFieldConfig {
  on: string;
  per: string;
}

export interface ConfigPersistence {
  name: string;
  config: string;
}
