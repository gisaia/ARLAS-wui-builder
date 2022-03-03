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
import { WIDGET_TYPE } from '@analytics-config/components/edit-group/models';
import { Injectable } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import {
  AggregationModelConfig, AnalyticComponentConfig, AnalyticComponentHistogramInputConfig,
  AnalyticComponentResultListInputConfig, AnalyticComponentSwimlaneInputConfig, Config, ContributorConfig
} from '@services/main-form-manager/models-config';
import { ImportElement, importElements } from '@services/main-form-manager/tools';
import { MainFormService } from '@services/main-form/main-form.service';
import { PROPERTY_SELECTOR_SOURCE } from '@shared-services/property-selector-form-builder/models';
import { AnalyticsInitService } from '../analytics-init/analytics-init.service';
import { BucketsIntervalControls, BY_BUCKET_OR_INTERVAL } from '../buckets-interval-form-builder/buckets-interval-form-builder.service';
import { DonutFormBuilderService } from '../donut-form-builder/donut-form-builder.service';
import { HistogramFormBuilderService, HistogramFormGroup } from '../histogram-form-builder/histogram-form-builder.service';
import { DEFAULT_METRIC_VALUE, MetricCollectControls } from '../metric-collect-form-builder/metric-collect-form-builder.service';
import { MetricFormBuilderService } from '../metric-form-builder/metric-form-builder.service';
import { PowerbarFormBuilderService } from '../powerbar-form-builder/powerbar-form-builder.service';
import { ResultlistFormBuilderService } from '../resultlist-form-builder/resultlist-form-builder.service';
import { SwimlaneFormBuilderService, SwimlaneFormGroup } from '../swimlane-form-builder/swimlane-form-builder.service';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsImportService {

  private analyticsBoardWidth = 445;

  public constructor(
    private mainFormService: MainFormService,
    private defaultValuesService: DefaultValuesService,
    private analyticsInitService: AnalyticsInitService,
    private histogramFormBuilder: HistogramFormBuilderService,
    private swimlaneFormBuilder: SwimlaneFormBuilderService,
    private metricFormBuilder: MetricFormBuilderService,
    private powerbarFormBuilder: PowerbarFormBuilderService,
    private donutFormBuilder: DonutFormBuilderService,
    private resultlistFormBuilder: ResultlistFormBuilderService,
  ) { }

  public doImport(config: Config) {

    const tabs: Map<string, FormGroup> = new Map();

    if (!!config.arlas.web.analytics) {
      config.arlas.web.analytics.forEach(analyticGroup => {
        const tabName = analyticGroup.tab || this.defaultValuesService.getValue('analytics.tabs.default');
        const tab = tabs.has(tabName) ?
          tabs.get(tabName) : this.analyticsInitService.initNewTab(tabName);
        tabs.set(tabName, tab);

        this.analyticsInitService.initTabContent(tab.controls.contentFg as FormGroup);
        const newGroup = this.analyticsInitService.initNewGroup('');
        let itemPerLine = 1;
        // manage list of widgets
        const contentTypes = new Array();
        analyticGroup.components.forEach(c => {
          const importedWidget = this.importWidget(c, config, contentTypes);
          const widget = importedWidget[0];
          itemPerLine = importedWidget[1];
          (newGroup.controls.content as FormArray).push(widget);
          this.analyticsInitService.createPreviewContributor(newGroup, widget);
        });
        newGroup.patchValue({
          icon: analyticGroup.icon,
          title: analyticGroup.title,
          itemPerLine,
          contentType: contentTypes
        });
        ((tab.controls.contentFg as FormGroup).controls.groupsFa as FormArray).push(newGroup);
      });
    }

    tabs.forEach(tab => this.mainFormService.analyticsConfig.getListFa().push(tab));
  }

  public importWidget(c: AnalyticComponentConfig, config: Config, contentTypes = new Array()): [FormGroup, number] {
    const widget = this.analyticsInitService.initNewWidget(c.componentType);
    const contributorId = c.contributorId;
    const contributor = config.arlas.web.contributors.find(contrib => contrib.identifier === contributorId);
    const defaultCollection = config.arlas.server.collection.name;
    /** retro-combatibility with mono-collection dashboards */
    if (!contributor.collection) {
      contributor.collection = config.arlas.server.collection.name;
    }
    let widgetData;
    if (c.componentType === WIDGET_TYPE.histogram) {
      contentTypes.push(WIDGET_TYPE.histogram);
      widgetData = this.getHistogramWidgetData(c, contributor);
    } else if (c.componentType === WIDGET_TYPE.swimlane) {
      contentTypes.push(WIDGET_TYPE.swimlane);
      widgetData = this.getSwimlaneWidgetData(c, contributor);
    } else if (c.componentType === WIDGET_TYPE.metric) {
      contentTypes.push(WIDGET_TYPE.metric);
      widgetData = this.getMetricWidgetData(c, contributor);
    } else if (c.componentType === WIDGET_TYPE.powerbars) {
      contentTypes.push(WIDGET_TYPE.powerbars);
      widgetData = this.getPowerbarWidgetData(c, contributor);
    } else if (c.componentType === WIDGET_TYPE.donut) {
      contentTypes.push(WIDGET_TYPE.donut);
      widgetData = this.getDonutWidgetData(c, contributor);
    } else if (c.componentType === WIDGET_TYPE.resultlist) {
      contentTypes.push(WIDGET_TYPE.resultlist);
      widgetData = this.getResultlistWidgetData(c, contributor);
    }
    const chartWidth = c.input.chartWidth;
    const donutDiameter = c.input.diameter;
    const tableWidth = c.input.tableWidth;
    let itemPerLine = 1;
    if (!!chartWidth && c.componentType !== WIDGET_TYPE.donut) {
      // Each case has 2 values to maintain compatibility
      // with the previous version
      if (
        chartWidth === Math.ceil(this.analyticsBoardWidth / 2) - 6 // new version
        || chartWidth === Math.ceil(this.analyticsBoardWidth / 2) - 12 // old version
      ) {
        itemPerLine = 2;
      } else if (chartWidth === this.analyticsBoardWidth || chartWidth === this.analyticsBoardWidth - 12) {
        itemPerLine = 1;
      } else {
        itemPerLine = 3;
      }
    } else if (!!donutDiameter && c.componentType === WIDGET_TYPE.donut) {
      if (donutDiameter === 125) {
        itemPerLine = 3;
      } else if (donutDiameter === 170) {
        itemPerLine = 2;
      }
    } else if (!!tableWidth && c.componentType === WIDGET_TYPE.resultlist) {
      if (
        tableWidth === Math.ceil(this.analyticsBoardWidth / 2) - 6 // new version
        || tableWidth === Math.ceil(this.analyticsBoardWidth / 2) - 12 // old version
      ) {
        itemPerLine = 2;
      } else if (
        tableWidth === Math.ceil(this.analyticsBoardWidth / 3) - 6 // new version
        || tableWidth === Math.ceil(this.analyticsBoardWidth / 3) - 12 // old version
      ) {
        itemPerLine = 3;
      }
    }
    widget.setControl('widgetData', widgetData);
    return [widget, itemPerLine];
  }

  private getHistogramWidgetData(component: AnalyticComponentConfig, contributor: ContributorConfig) {
    const widgetData = this.histogramFormBuilder.build(contributor.collection);
    const dataStep = widgetData.customControls.dataStep;
    const renderStep = widgetData.customControls.renderStep;
    const title = widgetData.customControls.title;
    const contribAggregationModel = contributor.aggregationmodels[0];
    importElements([
      {
        value: component.input.chartTitle,
        control: title
      },
      {
        value: contributor.collection,
        control: dataStep.collection
      },
      ...this.getAggregationImportElements(
        contributor,
        dataStep.aggregation.customControls,
        contribAggregationModel,
        component.input.dataType),
      ,
      ...this.getMetricImportElements(
        contribAggregationModel,
        dataStep.metric.customControls),
      ,
      {
        value: component.input.multiselectable,
        control: renderStep.multiselectable
      },
      {
        value: component.input.chartType,
        control: renderStep.chartType
      },
      {
        value: component.input.showHorizontalLines,
        control: renderStep.showHorizontalLines
      },
      {
        value: component.input.ticksDateFormat,
        control: renderStep.ticksDateFormat
      },
      {
        value: component.showExportCsv,
        control: renderStep.showExportCsv
      },
      {
        value: contributor.useUtc !== undefined ? contributor.useUtc : true,
        control: dataStep.useUtc
      }
    ]);

    // unmanaged fields
    const unmanagedFields = widgetData.customControls.unmanagedFields;
    importElements([
      {
        value: contributor.isOneDimension,
        control: unmanagedFields.dataStep.isOneDimension
      },
      ...this.getHistogramSwimlaneUnmanagedFields(component, widgetData)
      ,
      {
        value: (component.input as AnalyticComponentHistogramInputConfig).isSmoothedCurve,
        control: unmanagedFields.renderStep.isSmoothedCurve
      }
    ]);

    return widgetData;
  }

  private getSwimlaneWidgetData(component: AnalyticComponentConfig, contributor: ContributorConfig) {
    const widgetData = this.swimlaneFormBuilder.build(contributor.collection);
    const dataStep = widgetData.customControls.dataStep;
    const renderStep = widgetData.customControls.renderStep;
    const title = widgetData.customControls.title;
    const termeAggregationFg = dataStep.termAggregation;
    const dateAggregationModel = contributor.swimlanes[0].aggregationmodels.find(m => m.type === 'datehistogram' || m.type === 'histogram');
    const termAggregationModel = contributor.swimlanes[0].aggregationmodels.find(m => m.type === 'term');
    const swimlaneInput = component.input as AnalyticComponentSwimlaneInputConfig;

    importElements([
      {
        value: component.input.chartTitle,
        control: title
      },
      {
        value: contributor.collection,
        control: dataStep.collection
      },
      ...this.getAggregationImportElements(
        contributor,
        dataStep.aggregation.customControls,
        dateAggregationModel,
        component.input.dataType),
      ...this.getMetricImportElements(
        dateAggregationModel,
        dataStep.metric.customControls),
      {
        value: termAggregationModel.field,
        control: termeAggregationFg.termAggregationField
      },
      {
        value: termAggregationModel.size,
        control: termeAggregationFg.termAggregationSize
      },
      {
        value: !!swimlaneInput.swimlaneMode ? swimlaneInput.swimlaneMode : 'fixedHeight',
        control: renderStep.swimlaneMode
      },
      {
        value: !!swimlaneInput.swimlane_representation ? swimlaneInput.swimlane_representation :
          this.defaultValuesService.getDefaultConfig().swimlaneRepresentation,
        control: renderStep.swimlaneRepresentation
      },
      {
        value: !!swimlaneInput.paletteColors ? swimlaneInput.paletteColors : [
          330,
          170
        ],
        control: renderStep.paletteColors
      },
      {
        value: !!swimlaneInput && !!swimlaneInput.swimlane_options &&
          swimlaneInput.swimlane_options.zeros_color === this.defaultValuesService.getDefaultConfig().swimlaneZeroColor,
        control: renderStep.isZeroRepresentative
      },
      {
        value: !!swimlaneInput && !!swimlaneInput.swimlane_options &&
          swimlaneInput.swimlane_options.zeros_color ? swimlaneInput.swimlane_options.zeros_color : '#333',
        control: renderStep.zerosColors
      },
      {
        value: !!swimlaneInput && !!swimlaneInput.swimlane_options &&
          swimlaneInput.swimlane_options.nan_color ? swimlaneInput.swimlane_options.nan_color : '#333',
        control: renderStep.NaNColor
      },
      {
        value: contributor.useUtc !== undefined ? contributor.useUtc : true,
        control: dataStep.useUtc
      }
    ]);

    // unmanaged fields
    const unmanagedFields = widgetData.customControls.unmanagedFields;

    importElements([
      ...this.getHistogramSwimlaneUnmanagedFields(component, widgetData),
      {
        value: swimlaneInput.swimLaneLabelsWidth,
        control: unmanagedFields.renderStep.swimLaneLabelsWidth
      },
      {
        value: swimlaneInput.swimlaneHeight,
        control: unmanagedFields.renderStep.swimlaneHeight
      },
      {
        value: swimlaneInput.swimlaneBorderRadius,
        control: unmanagedFields.renderStep.swimlaneBorderRadius
      }
    ]);

    return widgetData;
  }

  private getHistogramSwimlaneUnmanagedFields(
    component: AnalyticComponentConfig,
    histogramFg: HistogramFormGroup | SwimlaneFormGroup) {
    const unmanagedFields = histogramFg.customControls.unmanagedFields;
    return [
      {
        value: component.input.isHistogramSelectable,
        control: unmanagedFields.renderStep.isHistogramSelectable
      },
      {
        value: component.input.topOffsetRemoveInterval,
        control: unmanagedFields.renderStep.topOffsetRemoveInterval
      },
      {
        value: component.input.leftOffsetRemoveInterval,
        control: unmanagedFields.renderStep.leftOffsetRemoveInterval
      },
      {
        value: component.input.brushHandlesHeightWeight,
        control: unmanagedFields.renderStep.brushHandlesHeightWeight
      },
      {
        value: component.input.yAxisStartsFromZero,
        control: unmanagedFields.renderStep.yAxisStartsFromZero
      },
      {
        value: component.input.xAxisPosition,
        control: unmanagedFields.renderStep.xAxisPosition
      },
      {
        value: component.input.descriptionPosition,
        control: unmanagedFields.renderStep.descriptionPosition
      },
      {
        value: component.input.xTicks,
        control: unmanagedFields.renderStep.xTicks
      },
      {
        value: component.input.yTicks,
        control: unmanagedFields.renderStep.yTicks
      },
      {
        value: component.input.xLabels,
        control: unmanagedFields.renderStep.xLabels
      },
      {
        value: component.input.yLabels,
        control: unmanagedFields.renderStep.yLabels
      },
      {
        value: component.input.xUnit,
        control: unmanagedFields.renderStep.xUnit
      },
      {
        value: component.input.yUnit,
        control: unmanagedFields.renderStep.yUnit
      },
      {
        value: component.input.chartXLabel,
        control: unmanagedFields.renderStep.chartXLabel
      },
      {
        value: component.input.shortYLabels,
        control: unmanagedFields.renderStep.shortYLabels
      },
      {
        value: component.input.showXTicks,
        control: unmanagedFields.renderStep.showXTicks
      },
      {
        value: component.input.showYTicks,
        control: unmanagedFields.renderStep.showYTicks
      },
      {
        value: component.input.showXLabels,
        control: unmanagedFields.renderStep.showXLabels
      },
      {
        value: component.input.showYLabels,
        control: unmanagedFields.renderStep.showYLabels
      },
      {
        value: component.input.barWeight,
        control: unmanagedFields.renderStep.barWeight
      },
      {
        value: !!component.input.chartHeight ? component.input.chartHeight : 100,
        control: unmanagedFields.renderStep.chartHeight
      },
      {
        value: !!component.input.chartWidth ? component.input.chartWidth : this.analyticsBoardWidth,
        control: unmanagedFields.renderStep.chartWidth
      }
    ];
  }

  private getMetricWidgetData(component: AnalyticComponentConfig, contributor: ContributorConfig) {
    const widgetData = this.metricFormBuilder.build(contributor.collection);
    const dataStep = widgetData.customControls.dataStep;
    const renderStep = widgetData.customControls.renderStep;
    const title = widgetData.customControls.title;

    // create a set to initialize metrics properly
    const metrics: Set<{ field: string; metric: string; }> = new Set<{ field: string; metric: string; }>();
    contributor.metrics.forEach(metric => metrics.add(metric));

    importElements([
      {
        value: contributor.title,
        control: title
      },
      {
        value: contributor.collection,
        control: dataStep.collection
      },
      {
        value: !!contributor.function && contributor.function === 'm[0]' ? '' : contributor.function,
        control: dataStep.function
      },
      {
        value: metrics,
        control: dataStep.metrics
      },
      {
        value: component.input.shortValue,
        control: renderStep.shortValue
      },
      {
        value: component.input.valuePrecision !== undefined ? component.input.valuePrecision : 0,
        control: renderStep.valuePrecision
      },
      {
        value: component.input.beforeValue,
        control: renderStep.beforeValue
      },
      {
        value: component.input.afterValue,
        control: renderStep.afterValue
      },

    ]);

    // unmanaged fields
    importElements([
      {
        value: component.input.customizedCssClass,
        control: widgetData.customControls.unmanagedFields.renderStep.customizedCssClass
      }
    ]);
    return widgetData;
  }

  private getPowerbarWidgetData(component: AnalyticComponentConfig, contributor: ContributorConfig) {
    const widgetData = this.powerbarFormBuilder.build(contributor.collection);
    const dataStep = widgetData.customControls.dataStep;
    const renderStep = widgetData.customControls.renderStep;
    const title = widgetData.customControls.title;
    const contribAggregationModel = contributor.aggregationmodels[0];
    const filterOperatorValue = !!component.input.filterOperator && !!component.input.filterOperator.value
      ? component.input.filterOperator.value : 'Eq';
    importElements([
      {
        value: contributor.title,
        control: title
      },
      {
        value: contributor.collection,
        control: dataStep.collection
      },
      {
        value: contributor.aggregationmodels[0].field,
        control: dataStep.aggregationField
      },
      {
        value: contributor.aggregationmodels[0].size,
        control: dataStep.aggregationSize
      },
      ...this.getMetricImportElements(
        contribAggregationModel,
        dataStep.metric.customControls),
      ,
      {
        value: component.input.unit,
        control: dataStep.unit
      },
      {
        value: component.input.displayFilter,
        control: renderStep.displayFilter
      },
      {
        value: filterOperatorValue,
        control: dataStep.operator
      },
      {
        value: !!component.input.filterOperator ? component.input.filterOperator.display : true,
        control: renderStep.allowOperatorChange
      },
      {
        value: component.input.useColorService === true ? PROPERTY_SELECTOR_SOURCE.manual : component.input.useColorFromData === true ?
          PROPERTY_SELECTOR_SOURCE.provided_color : undefined,
        control: renderStep.modeColor
      },
      {
        value: component.input.useColorService,
        control: renderStep.useColorService
      },
      {
        value: component.input.useColorFromData,
        control: renderStep.useColorFromData
      },
      {
        value: contributor.colorField,
        control: renderStep.propertyProvidedColorFieldCtrl
      },
      {
        value: component.showExportCsv,
        control: renderStep.showExportCsv
      },
      {
        value: component.input.scrollable,
        control: renderStep.scrollable
      }
    ]);
    return widgetData;
  }

  private getDonutWidgetData(component: AnalyticComponentConfig, contributor: ContributorConfig) {
    const widgetData = this.donutFormBuilder.build(contributor.collection);
    const dataStep = widgetData.customControls.dataStep;
    const renderStep = widgetData.customControls.renderStep;
    const title = widgetData.customControls.title;

    // create a set to initialize aggregationmodels properly
    const aggregationsModels: Set<{ field: string; size: number; }> = new Set<{ field: string; size: number; }>();
    contributor.aggregationmodels.forEach(aggModel => aggregationsModels.add({ field: aggModel.field, size: aggModel.size }));
    let donutOpacity = 0.5;
    if (component.input.opacity !== undefined && component.input.opacity !== null) {
      donutOpacity = component.input.opacity;
      /** transform all opacities between [0 and 100] to [0 and 1] */
      if (donutOpacity > 1) {
        donutOpacity = donutOpacity / 100;
      }
    }
    importElements([
      {
        value: contributor.title,
        control: title
      },
      {
        value: contributor.collection,
        control: dataStep.collection
      },
      {
        value: aggregationsModels,
        control: dataStep.aggregationmodels
      },
      {
        value: donutOpacity,
        control: renderStep.opacity
      },
      {
        value: component.input.multiselectable,
        control: renderStep.multiselectable
      },
      {
        value: component.showExportCsv,
        control: renderStep.showExportCsv
      }
    ]);
    // unmanaged fields
    importElements([
      {
        value: component.input.customizedCssClass,
        control: widgetData.customControls.unmanagedFields.renderStep.customizedCssClass
      },
      {
        value: component.input.diameter !== undefined ? component.input.diameter : 175,
        control: widgetData.customControls.unmanagedFields.renderStep.diameter
      },
      {
        value: component.input.containerWidth !== undefined ? component.input.containerWidth : this.analyticsBoardWidth,
        control: widgetData.customControls.unmanagedFields.renderStep.containerWidth
      }
    ]);

    return widgetData;
  }

  private getResultlistWidgetData(component: AnalyticComponentConfig, contributor: ContributorConfig) {
    const widgetData = this.resultlistFormBuilder.build(contributor.collection);
    const dataStep = widgetData.customControls.dataStep;
    const renderStep = widgetData.customControls.renderStep;
    const title = widgetData.customControls.title;
    const inputs = component.input as AnalyticComponentResultListInputConfig;
    const titleFieldNames = contributor.fieldsConfiguration.titleFieldNames;
    const tooltipFieldNames = contributor.fieldsConfiguration.tooltipFieldNames;
    importElements([
      {
        value: contributor.name,
        control: title
      },
      {
        value: contributor.collection,
        control: dataStep.collection
      },
      {
        value: contributor.search_size,
        control: dataStep.searchSize
      },
      {
        value: contributor.fieldsConfiguration.idFieldName,
        control: dataStep.idFieldName
      },
      {
        value: component.input.defautMode === 'grid',
        control: renderStep.gridStep.isDefaultMode
      },
      {
        value: !!titleFieldNames && titleFieldNames.length > 0 ? titleFieldNames[0].fieldPath : '',
        control: renderStep.gridStep.tileLabelField
      },
      {
        value: !!titleFieldNames && titleFieldNames.length > 0 ? titleFieldNames[0].process : '',
        control: renderStep.gridStep.tileLabelFieldProcess
      },
      {
        value: !!tooltipFieldNames && tooltipFieldNames.length > 0 ? tooltipFieldNames[0].fieldPath : '',
        control: renderStep.gridStep.tooltipField
      },
      {
        value: !!tooltipFieldNames && tooltipFieldNames.length > 0 ? tooltipFieldNames[0].process : '',
        control: renderStep.gridStep.tooltipFieldProcess
      },
      {
        value: !!contributor.fieldsConfiguration.urlThumbnailTemplate ? contributor.fieldsConfiguration.urlThumbnailTemplate : '',
        control: renderStep.gridStep.thumbnailUrl
      },
      {
        value: !!contributor.fieldsConfiguration.urlImageTemplate ? contributor.fieldsConfiguration.urlImageTemplate : '',
        control: renderStep.gridStep.imageUrl
      },
      {
        value: contributor.fieldsConfiguration.iconColorFieldName,
        control: renderStep.gridStep.colorIdentifier
      },
      {
        value: inputs.displayFilters,
        control: renderStep.displayFilters
      },
      {
        value: inputs.isGeoSortActived,
        control: renderStep.isGeoSortActived
      },
      {
        value: inputs.cellBackgroundStyle,
        control: renderStep.cellBackgroundStyle
      }
    ]);

    contributor.columns.forEach(c => {
      const column = this.resultlistFormBuilder.buildColumn(contributor.collection);
      importElements([
        {
          value: c.columnName,
          control: column.customControls.columnName
        },
        {
          value: c.fieldName,
          control: column.customControls.fieldName
        },
        {
          value: c.dataType,
          control: column.customControls.dataType
        },
        {
          value: c.process,
          control: column.customControls.process
        },
        {
          value: c.useColorService,
          control: column.customControls.useColorService
        }
      ]);
      widgetData.customControls.dataStep.columns.push(column);
    });

    (contributor.details || [])
      .sort((d1, d2) => d1.order - d2.order)
      .forEach(d => {

        const detail = this.resultlistFormBuilder.buildDetail();
        importElements([
          {
            value: d.name,
            control: detail.customControls.name
          }
        ]);

        d.fields.forEach(f => {
          const field = this.resultlistFormBuilder.buildDetailField(contributor.collection);
          importElements([
            {
              value: f.label,
              control: field.customControls.label
            },
            {
              value: f.path,
              control: field.customControls.path
            },
            {
              value: f.process,
              control: field.customControls.process
            },
          ]);
          detail.customControls.fields.push(field);
        });

        widgetData.customControls.dataStep.details.push(detail);
      });

    // unmanaged fields
    const componentInput = component.input;
    const unmanagedRenderFields = widgetData.customControls.unmanagedFields.renderStep;
    importElements([
      {
        value: component.input.tableWidth,
        control: unmanagedRenderFields.tableWidth
      },
      {
        value: component.input.globalActionsList,
        control: unmanagedRenderFields.globalActionsList
      },
      {
        value: component.input.nLastLines,
        control: unmanagedRenderFields.nLastLines
      },
      {
        value: component.input.detailedGridHeight,
        control: unmanagedRenderFields.detailedGridHeight
      },
      {
        value: component.input.nbGridColumns,
        control: unmanagedRenderFields.nbGridColumns
      },
      {
        value: component.input.isBodyHidden,
        control: unmanagedRenderFields.isBodyHidden
      },
      {
        value: component.input.isAutoGeoSortActived,
        control: unmanagedRenderFields.isAutoGeoSortActived
      },
      {
        value: component.input.selectedItemsEvent,
        control: unmanagedRenderFields.selectedItemsEvent
      },
      {
        value: component.input.consultedItemEvent,
        control: unmanagedRenderFields.consultedItemEvent
      },
      {
        value: component.input.actionOnItemEvent,
        control: unmanagedRenderFields.actionOnItemEvent
      },
      {
        value: component.input.globalActionEvent,
        control: unmanagedRenderFields.globalActionEvent
      },
      {
        value: component.input.detailedGridHeight,
        control: unmanagedRenderFields.globalActionEvent
      }
    ]);

    return widgetData;
  }

  private getAggregationImportElements(
    contributor: ContributorConfig,
    aggregationControls: BucketsIntervalControls,
    contribAggregationModel: AggregationModelConfig,
    dataType: string): Array<ImportElement> {
    return [{
      value: !contributor.numberOfBuckets ? BY_BUCKET_OR_INTERVAL.INTERVAL : BY_BUCKET_OR_INTERVAL.BUCKET,
      control: aggregationControls.aggregationBucketOrInterval
    },
    {
      value: contributor.numberOfBuckets,
      control: aggregationControls.aggregationBucketsNumber
    },
    {
      value: contribAggregationModel.field,
      control: aggregationControls.aggregationField
    },
    {
      value: dataType,
      control: aggregationControls.aggregationFieldType
    },
    {
      value: !!contribAggregationModel.interval ? contribAggregationModel.interval.value : null,
      control: aggregationControls.aggregationIntervalSize
    },
    {
      value: !!contribAggregationModel.interval ? contribAggregationModel.interval.unit : null,
      control: aggregationControls.aggregationIntervalUnit
    }] as Array<ImportElement>;
  }

  private getMetricImportElements(
    contribAggregationModel: AggregationModelConfig,
    metricControls: MetricCollectControls) {

    return [
      {
        value: contribAggregationModel.metrics ? contribAggregationModel.metrics[0].collect_field : null,
        control: metricControls.metricCollectField
      },
      {
        value: contribAggregationModel.metrics ? contribAggregationModel.metrics[0].collect_fct.toUpperCase() : DEFAULT_METRIC_VALUE,
        control: metricControls.metricCollectFunction
      }
    ] as Array<ImportElement>;
  }

}
