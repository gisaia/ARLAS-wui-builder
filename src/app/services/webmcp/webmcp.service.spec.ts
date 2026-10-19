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

import { TestBed } from '@angular/core/testing';
import { LoggerModule } from 'ngx-logger';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MainFormManagerService } from '../main-form-manager/main-form-manager.service';
import { WebmcpService } from './webmcp.service';

describe('WebmcpService', () => {
  let service: WebmcpService;
  let mockMainFormManagerService: Partial<MainFormManagerService>;
  let mockConfig: any;
  let mockMapConfig: any;

  beforeEach(() => {
    mockConfig = {
      arlas: {
        server: { collection: { name: 'demo_collection' } },
        web: {
          contributors: [],
          analytics: [],
          options: { tabs: [] }
        }
      }
    };
    mockMapConfig = { layers: [] };

    mockMainFormManagerService = {
      exportConfig: vi.fn().mockImplementation(() => ({
        generatedConfig: JSON.parse(JSON.stringify(mockConfig)),
        generatedMapConfig: JSON.parse(JSON.stringify(mockMapConfig))
      })),
      doImport: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(null)
      ],
      providers: [
        WebmcpService,
        { provide: MainFormManagerService, useValue: mockMainFormManagerService }
      ]
    });

    service = TestBed.inject(WebmcpService);
  });

  afterEach(() => {
    delete (document as any).modelContext;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should handle missing modelContext gracefully', async () => {
    delete (document as any).modelContext;
    await expect(service.registerTools()).resolves.toBeUndefined();
  });

  it('should register get_current_configuration, import_configuration, and add_chart when modelContext is present', async () => {
    const registeredTools: any[] = [];
    (document as any).modelContext = {
      registerTool: vi.fn().mockImplementation((tool) => {
        registeredTools.push(tool);
        return Promise.resolve();
      })
    };

    await service.registerTools();

    expect((document as any).modelContext.registerTool).toHaveBeenCalledTimes(3);

    const getTool = registeredTools.find(t => t.name === 'get_current_configuration');
    expect(getTool).toBeDefined();
    const getResult = await getTool.execute({});
    expect(mockMainFormManagerService.exportConfig).toHaveBeenCalled();
    expect(getResult.config.arlas.server.collection.name).toBe('demo_collection');

    const importTool = registeredTools.find(t => t.name === 'import_configuration');
    expect(importTool).toBeDefined();
    const importResult = await importTool.execute({
      config: { updated: 'config' },
      mapConfig: { updated: 'mapConfig' }
    });
    expect(mockMainFormManagerService.doImport).toHaveBeenCalledWith(
      { updated: 'config' },
      { updated: 'mapConfig' }
    );
    expect(importResult.success).toBe(true);

    const addChartTool = registeredTools.find(t => t.name === 'add_chart');
    expect(addChartTool).toBeDefined();
    const chartResult = await addChartTool.execute({
      title: 'Events Over Time',
      chartType: 'histogram',
      field: 'event_date',
      dataType: 'time'
    });
    expect(chartResult.success).toBe(true);
    expect(mockMainFormManagerService.doImport).toHaveBeenCalled();
  });

  it('should add a histogram chart correctly', () => {
    const result = service.addChart({
      title: 'Speed Distribution',
      chartType: 'histogram',
      field: 'speed',
      dataType: 'numeric',
      step: 10
    });

    expect(result.success).toBe(true);
    expect(mockMainFormManagerService.doImport).toHaveBeenCalled();

    const [importedConfig] = (mockMainFormManagerService.doImport as any).mock.calls[0];
    expect(importedConfig.arlas.web.contributors.length).toBe(1);
    const contributor = importedConfig.arlas.web.contributors[0];
    expect(contributor.type).toBe('histogram');
    expect(contributor.aggregationmodels[0].field).toBe('speed');

    expect(importedConfig.arlas.web.analytics.length).toBe(1);
    const group = importedConfig.arlas.web.analytics[0];
    expect(group.title).toBe('Speed Distribution');
    expect(group.components[0].componentType).toBe('histogram');
  });

  it('should add a donut chart correctly', () => {
    const result = service.addChart({
      title: 'Vessel Types',
      chartType: 'donut',
      field: 'vessel_type'
    });

    expect(result.success).toBe(true);
    const [importedConfig] = (mockMainFormManagerService.doImport as any).mock.calls[0];
    const contributor = importedConfig.arlas.web.contributors[0];
    expect(contributor.type).toBe('tree');
    expect(contributor.aggregationmodels[0].type).toBe('term');

    const group = importedConfig.arlas.web.analytics[0];
    expect(group.components[0].componentType).toBe('donut');
  });

  it('should add a powerbars chart correctly', () => {
    const result = service.addChart({
      title: 'Top Flags',
      chartType: 'powerbars',
      field: 'flag'
    });

    expect(result.success).toBe(true);
    const [importedConfig] = (mockMainFormManagerService.doImport as any).mock.calls[0];
    const contributor = importedConfig.arlas.web.contributors[0];
    expect(contributor.type).toBe('tree');

    const group = importedConfig.arlas.web.analytics[0];
    expect(group.components[0].componentType).toBe('powerbars');
  });

  it('should add a swimlane chart correctly', () => {
    const result = service.addChart({
      title: 'Activity Lanes',
      chartType: 'swimlane',
      field: 'timestamp'
    });

    expect(result.success).toBe(true);
    const [importedConfig] = (mockMainFormManagerService.doImport as any).mock.calls[0];
    const contributor = importedConfig.arlas.web.contributors[0];
    expect(contributor.type).toBe('swimlane');
    expect(contributor.swimlanes[0].xAxisField).toBe('timestamp');

    const group = importedConfig.arlas.web.analytics[0];
    expect(group.components[0].componentType).toBe('swimlane');
  });
});
