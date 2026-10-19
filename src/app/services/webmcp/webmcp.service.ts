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

import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { v4 as uuidv4 } from 'uuid';
import { WIDGET_TYPE } from '../../modules/analytics-config/components/edit-group/models';
import { MainFormManagerService } from '../main-form-manager/main-form-manager.service';
import {
  AnalyticComponentConfig,
  AnalyticConfig,
  Config,
  ContributorConfig
} from '../main-form-manager/models-config';
import { MapConfig } from '../main-form-manager/models-map-config';

export interface AddChartParams {
  title: string;
  chartType: 'histogram' | 'donut' | 'powerbars' | 'swimlane';
  field: string;
  collection?: string;
  tab?: string;
  dataType?: 'numeric' | 'time';
  step?: number;
  chartWidth?: number;
  chartHeight?: number;
}

export interface AddChartResult {
  success: boolean;
  contributorId: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebmcpService {

  public constructor(
    private readonly mainFormManagerService: MainFormManagerService,
    private readonly logger: NGXLogger
  ) {}

  /**
   * Adds a new chart widget to the analytics dashboard and updates the reactive forms.
   */
  public addChart(params: AddChartParams): AddChartResult {
    const { generatedConfig, generatedMapConfig } = this.mainFormManagerService.exportConfig();
    const collectionName = params.collection
      || generatedConfig?.arlas?.server?.collection?.name
      || 'default';

    const contributorId = `contributor_${params.chartType}_${Date.now()}`;
    const componentUuid = uuidv4();
    const chartWidth = params.chartWidth ?? 445;
    const chartHeight = params.chartHeight ?? 120;
    const dataType = params.dataType ?? (params.chartType === 'swimlane' ? 'time' : 'numeric');

    let contributorConfig: ContributorConfig;
    let componentConfig: AnalyticComponentConfig;

    if (params.chartType === 'histogram') {
      const isDate = dataType === 'time';
      contributorConfig = {
        type: 'histogram',
        identifier: contributorId,
        name: params.title,
        collection: collectionName,
        isOneDimension: true,
        useUtc: true,
        aggregationmodels: [
          {
            type: isDate ? 'datehistogram' : 'histogram',
            field: params.field,
            interval: isDate ? { unit: 'day', value: 1 } : { value: params.step ?? 1 }
          }
        ]
      };
      componentConfig = {
        uuid: componentUuid,
        contributorId,
        componentType: WIDGET_TYPE.histogram,
        input: {
          id: contributorId,
          chartTitle: params.title,
          dataType,
          chartWidth,
          chartHeight,
          barWeight: 0.8,
          isHistogramSelectable: true
        }
      };
    } else if (params.chartType === 'donut') {
      contributorConfig = {
        type: 'tree',
        identifier: contributorId,
        name: params.title,
        collection: collectionName,
        aggregationmodels: [
          {
            type: 'term',
            field: params.field,
            size: 10
          }
        ]
      };
      componentConfig = {
        uuid: componentUuid,
        contributorId,
        componentType: WIDGET_TYPE.donut,
        input: {
          id: contributorId,
          chartTitle: params.title,
          diameter: 170,
          containerWidth: 223
        }
      };
    } else if (params.chartType === 'powerbars') {
      contributorConfig = {
        type: 'tree',
        identifier: contributorId,
        name: params.title,
        collection: collectionName,
        aggregationmodels: [
          {
            type: 'term',
            field: params.field,
            size: 10
          }
        ]
      };
      componentConfig = {
        uuid: componentUuid,
        contributorId,
        componentType: WIDGET_TYPE.powerbars,
        input: {
          id: contributorId,
          powerbarTitle: params.title,
          chartWidth
        }
      };
    } else if (params.chartType === 'swimlane') {
      contributorConfig = {
        type: 'swimlane',
        identifier: contributorId,
        name: params.title,
        collection: collectionName,
        swimlanes: [
          {
            id: 1,
            name: params.title,
            xAxisField: params.field,
            termField: params.field,
            jsonpath: '$.count',
            useUtc: true,
            aggregationmodels: [
              {
                type: 'datehistogram',
                field: params.field,
                interval: { unit: 'day', value: 1 }
              }
            ]
          }
        ]
      };
      componentConfig = {
        uuid: componentUuid,
        contributorId,
        componentType: WIDGET_TYPE.swimlane,
        input: {
          id: contributorId,
          chartTitle: params.title,
          dataType: 'time',
          chartWidth,
          chartHeight,
          barWeight: 0.8
        }
      };
    } else {
      throw new Error(`Unsupported chart type: ${params.chartType}`);
    }

    if (!generatedConfig.arlas) {
      generatedConfig.arlas = {} as any;
    }
    if (!generatedConfig.arlas.web) {
      generatedConfig.arlas.web = {} as any;
    }
    if (!generatedConfig.arlas.web.contributors) {
      generatedConfig.arlas.web.contributors = [];
    }
    if (!generatedConfig.arlas.web.analytics) {
      generatedConfig.arlas.web.analytics = [];
    }

    generatedConfig.arlas.web.contributors.push(contributorConfig);

    const tabName = params.tab || 'Analytics';
    const newGroup: AnalyticConfig = {
      groupId: `group_${Date.now()}`,
      title: params.title,
      tab: tabName,
      icon: 'bar_chart',
      components: [componentConfig]
    };
    generatedConfig.arlas.web.analytics.push(newGroup);

    if (!generatedConfig.arlas.web.options) {
      generatedConfig.arlas.web.options = {} as any;
    }
    if (!generatedConfig.arlas.web.options.tabs) {
      generatedConfig.arlas.web.options.tabs = [];
    }
    if (!generatedConfig.arlas.web.options.tabs.some(t => t.name === tabName)) {
      generatedConfig.arlas.web.options.tabs.push({
        name: tabName,
        icon: 'dashboard',
        showName: true,
        showIcon: true
      });
    }

    this.mainFormManagerService.doImport(generatedConfig, generatedMapConfig);

    return {
      success: true,
      contributorId,
      message: `Chart '${params.title}' (${params.chartType}) successfully added to tab '${tabName}'.`
    };
  }

  /**
   * Registers WebMCP tools with the browser's model context if supported.
   */
  public async registerTools(): Promise<void> {
    const modelContext = (document as any).modelContext || (navigator as any).modelContext;

    if (!modelContext || typeof modelContext.registerTool !== 'function') {
      this.logger.info('WebMCP is not supported or enabled in this browser environment.');
      return;
    }

    try {
      // 1. Tool: get_current_configuration
      await modelContext.registerTool({
        name: 'get_current_configuration',
        description: 'Returns the current state of config.json and config.map.json from the dashboard builder.',
        inputSchema: {
          type: 'object',
          properties: {}
        },
        execute: async () => {
          this.logger.info('WebMCP: Executing get_current_configuration');
          const { generatedConfig, generatedMapConfig } = this.mainFormManagerService.exportConfig();
          return {
            config: generatedConfig,
            mapConfig: generatedMapConfig
          };
        }
      });

      // 2. Tool: import_configuration
      await modelContext.registerTool({
        name: 'import_configuration',
        description: 'Imports a complete config.json and config.map.json to update the visual dashboard builder forms.',
        inputSchema: {
          type: 'object',
          properties: {
            config: {
              type: 'object',
              description: 'The ARLAS WUI config.json specification'
            },
            mapConfig: {
              type: 'object',
              description: 'The ARLAS WUI config.map.json MapLibre specification'
            }
          },
          required: ['config', 'mapConfig']
        },
        execute: async (params: { config: Config; mapConfig: MapConfig; }) => {
          this.logger.info('WebMCP: Executing import_configuration');
          this.mainFormManagerService.doImport(params.config, params.mapConfig);
          return {
            success: true,
            message: 'Configuration successfully imported into ARLAS WUI Builder.'
          };
        }
      });

      // 3. Tool: add_chart
      await modelContext.registerTool({
        name: 'add_chart',
        description: 'Adds a new chart widget (histogram, donut, powerbars, or swimlane) to the analytics dashboard.',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'The title of the chart'
            },
            chartType: {
              type: 'string',
              enum: ['histogram', 'donut', 'powerbars', 'swimlane'],
              description: 'The type of visualization chart'
            },
            field: {
              type: 'string',
              description: 'The data field to aggregate or display'
            },
            collection: {
              type: 'string',
              description: 'The target collection name (optional, defaults to current collection)'
            },
            tab: {
              type: 'string',
              description: 'The tab where the chart will be placed (optional, defaults to "Analytics")'
            },
            dataType: {
              type: 'string',
              enum: ['numeric', 'time'],
              description: 'Data type of the field for histogram or swimlane (numeric or time)'
            },
            step: {
              type: 'number',
              description: 'Interval or bucket step for numeric histograms (optional)'
            },
            chartWidth: {
              type: 'number',
              description: 'Chart width in pixels (optional, default 445)'
            },
            chartHeight: {
              type: 'number',
              description: 'Chart height in pixels (optional, default 120)'
            }
          },
          required: ['title', 'chartType', 'field']
        },
        execute: async (params: AddChartParams) => {
          this.logger.info(`WebMCP: Executing add_chart for ${params.title} (${params.chartType})`);
          return this.addChart(params);
        }
      });

      this.logger.info('WebMCP tools successfully registered.');
    } catch (error) {
      this.logger.error('Failed to register WebMCP tools:', error);
    }
  }
}
