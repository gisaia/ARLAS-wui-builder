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
import { Aggregation, Expression } from 'arlas-api';
import { BasemapStyle, TerrainConfiguration, VisualisationSetConfig } from 'arlas-map';
import { FieldsConfiguration, LayerSourceConfig } from 'arlas-web-contributors';
import { AnalyticsTabs, ZoomToDataStrategy } from 'arlas-wui-toolkit';
import { Layer } from './models-map-config';

export const JSONPATH_COUNT = '$.count';
export const JSONPATH_METRIC = '$.metrics[0].value';
/** @deprectaed */
export const CHIPSEARCH_TYPE = 'chipssearch';
export const SEARCH_TYPE = 'search';
/** @deprectaed */
export const CHIPSEARCH_IDENTIFIER = 'chipssearch';
export const SEARCH_IDENTIFIER = 'search';

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
      };
    };
  };
  resources: {
    previewId?: string;
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
  filters_shortcuts: ShortcutsConfig[];
  colorGenerator: { keysToColors: Array<[string, string]>; };
  options?: WebConfigOptions;
  externalNode: any;
}

export interface WebConfigOptions {
  drag_items?: boolean;
  /** @deprecated */
  zoom_to_data?: boolean;
  zoom_to_strategy?: ZoomToDataStrategy;
  indicators?: boolean;
  spinner?: SpinnerOptions;
  tabs: AnalyticsTabs[];
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
  window_extent_geometry?: string;
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
  columns?: Array<{ columnName: string; fieldName: string; dataType: string; process: string; useColorService: boolean; sort: string; }>;
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
  sort?: MetricsTableSortConfig;
  configuration?: Array<MetricsSubTableConfig>;

}

export interface MetricsSubTableConfig {
  termfield: string;
  collection: string;
  metrics: Array<{
    metric: string;
    field?: string;
  }>;

}

export interface MetricsTableSortConfig {
  collection?: string;
  termfield?: string;
  order?: Aggregation.OrderEnum;
  on?: 'metric' | 'count';
  metric?: {
    metric: string;
    field: string;
  };
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
  /** this uuid will be used a reference to a component configuration and reused by a shortcut. */
  uuid: string;
  usage?: WidgetUsage;
  contributorId: string;
  shortcutContributorId?: string;
  componentType: WIDGET_TYPE;
  showExportCsv?: boolean;
  input: AnalyticComponentInputConfig;
}

/** a widget can be displayed in
 * - analytics only
 * - shortcuts only
 * - both
 */
export type WidgetUsage = 'analytics' | 'shortcuts' | 'both';


export interface ShortcutsConfig {
  uuid: string;
  title: string;
  order?: number;
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
  chartYLabel?: string;
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
  applyColorTo?: 'column'|'row';
  headerDisplayMode?: 'chip'|'title'|'full';
  normaliseBy?:  'column'|'table';
  selectWithCheckbox?: boolean;
  showRowField?: boolean;
}

export interface AnalyticComponentResultListInputConfig extends AnalyticComponentInputConfig {
  visualisationsList?: VisualisationListInputConfig[];
  options?: AnalyticComponentResultListInputOptions;
  detailWidth?: number;
  visualisationLink?: string;
  downloadLink?: string;
}

export interface VisualisationListInputConfig {
  description: string;
  name: string;
  dataGroups: DataGroupInputConfig[];
}

export interface DataGroupInputConfig {
  name: string;
  protocol: string;
  visualisationUrl: string;
  filters: DataGroupInputCondition[];
}

export type ArlasExpression = keyof typeof Expression.OpEnum;
export interface DataGroupInputCondition {
  field: string;
  op: string;
  type: string;
  value: string | number | string[] | boolean;
}

export interface AnalyticComponentResultListInputOptions {
  showActionsOnhover?: string;
  showDetailIconName?: string;
  hideDetailIconName?: string;
  icon?: string;
  showName?: boolean;
  showIcon?: boolean;
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
  enableGlobe: boolean;
  idFeatureField: string;
  mapLayers: MapComponentInputMapLayersConfig;
  visualisations_sets: Array<VisualisationSetConfig>;
  /** Configuration to display terrain elevation */
  terrain: TerrainConfiguration<maplibregl.RasterDEMSourceSpecification>;
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
  order?: Aggregation.OrderEnum;
  on?: Aggregation.OnEnum;

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
