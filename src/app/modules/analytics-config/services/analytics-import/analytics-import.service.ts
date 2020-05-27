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
import {
  Config, AnalyticComponentConfig, ContributorConfig, AggregationModelConfig,
  AnalyticComponentSwimlaneInputConfig,
  JSONPATH_COUNT
} from '@services/main-form-manager/models-config';
import { MainFormService } from '@services/main-form/main-form.service';
import { FormArray, FormGroup } from '@angular/forms';
import { AnalyticsInitService } from '../analytics-init/analytics-init.service';
import { WIDGET_TYPE } from '@analytics-config/components/edit-group/models';
import { HistogramFormBuilderService } from '../histogram-form-builder/histogram-form-builder.service';
import { SwimlaneFormBuilderService } from '../swimlane-form-builder/swimlane-form-builder.service';
import { DEFAULT_METRIC_VALUE, MetricCollectControls } from '../metric-collect-form-builder/metric-collect-form-builder.service';
import { BucketsIntervalControls } from '../buckets-interval-form-builder/buckets-interval-form-builder.service';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { ImportElement, importElements } from '@services/main-form-manager/tools';
import { MetricFormBuilderService } from '../metric-form-builder/metric-form-builder.service';
import { PowerbarFormBuilderService } from '../powerbar-form-builder/powerbar-form-builder.service';
import { DonutFormBuilderService } from '../donut-form-builder/donut-form-builder.service';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsImportService {

  constructor(
    private mainFormService: MainFormService,
    private defaultValuesService: DefaultValuesService,
    private analyticsInitService: AnalyticsInitService,
    private histogramFormBuilder: HistogramFormBuilderService,
    private swimlaneFormBuilder: SwimlaneFormBuilderService,
    private metricFormBuilder: MetricFormBuilderService,
    private powerbarFormBuilder: PowerbarFormBuilderService,
    private donutFormBuilder: DonutFormBuilderService,
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

        const isHistogram = analyticGroup.components.length === 1 && analyticGroup.components[0].componentType === WIDGET_TYPE.histogram;
        const isSwimlane = analyticGroup.components.length === 1 && analyticGroup.components[0].componentType === WIDGET_TYPE.swimlane;
        const isMetric = analyticGroup.components.length === 1 && analyticGroup.components[0].componentType === WIDGET_TYPE.metric;
        const isPowerbar = analyticGroup.components.length === 1 && analyticGroup.components[0].componentType === WIDGET_TYPE.powerbars;
        const isDonut = analyticGroup.components.length === 1 && analyticGroup.components[0].componentType === WIDGET_TYPE.donut;

        newGroup.patchValue({
          icon: analyticGroup.icon,
          title: analyticGroup.title,
          contentType:
            isHistogram ? [WIDGET_TYPE.histogram] : isSwimlane ? [WIDGET_TYPE.swimlane] : isMetric ? [WIDGET_TYPE.metric] :
              isPowerbar ? [WIDGET_TYPE.powerbars] : isDonut ? [WIDGET_TYPE.donut]
                : ''
        });

        // TODO manage a list of widgets
        const widget = this.analyticsInitService.initNewWidget(analyticGroup.components[0].componentType);
        const contributorId = analyticGroup.components[0].contributorId;
        const contributor = config.arlas.web.contributors.find(contrib => contrib.identifier === contributorId);

        const widgetData = isHistogram ? this.getHistogramWidgetData(analyticGroup.components[0], contributor) :
          isSwimlane ? this.getSwimlaneWidgetData(analyticGroup.components[0], contributor) :
            isMetric ? this.getMetricWidgetData(analyticGroup.components[0], contributor) :
              isPowerbar ? this.getPowerbarWidgetData(analyticGroup.components[0], contributor) :
                isDonut ? this.getDonutWidgetData(analyticGroup.components[0], contributor) :
                  new FormGroup({});
        widget.setControl('widgetData', widgetData);

        (newGroup.controls.content as FormArray).push(widget);
        this.analyticsInitService.createPreviewContributor(newGroup, widget);

        ((tab.controls.contentFg as FormGroup).controls.groupsFa as FormArray).push(newGroup);

      });
    }

    tabs.forEach(tab => this.mainFormService.analyticsConfig.getListFa().push(tab));
  }

  private getHistogramWidgetData(component: AnalyticComponentConfig, contributor: ContributorConfig) {
    const widgetData = this.histogramFormBuilder.build();
    const dataStep = widgetData.customControls.dataStep;
    const renderStep = widgetData.customControls.renderStep;

    const contribAggregationModel = contributor.aggregationmodels[0];

    importElements([
      {
        value: component.input.chartTitle,
        control: dataStep.name
      },
      ...this.getAggregationImportElements(
        contributor,
        dataStep.aggregation.customControls,
        contribAggregationModel,
        component.input.dataType),
      ,
      ...this.getMetricImportElements(
        contribAggregationModel,
        dataStep.metric.customControls,
        contributor.jsonpath),
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
      }
    ]);

    return widgetData;
  }

  private getSwimlaneWidgetData(component: AnalyticComponentConfig, contributor: ContributorConfig) {
    const widgetData = this.swimlaneFormBuilder.build();
    const dataStep = widgetData.customControls.dataStep;
    const renderStep = widgetData.customControls.renderStep;
    const termeAggregationFg = dataStep.termAggregation;
    const dateAggregationModel = contributor.swimlanes[0].aggregationmodels.find(m => m.type === 'datehistogram');
    const termAggregationModel = contributor.swimlanes[0].aggregationmodels.find(m => m.type === 'term');
    const swimlaneInput = component.input as AnalyticComponentSwimlaneInputConfig;

    importElements([
      {
        value: component.input.chartTitle,
        control: dataStep.name
      },
      ...this.getAggregationImportElements(
        contributor,
        dataStep.dateAggregation.customControls,
        dateAggregationModel,
        component.input.dataType),
      ...this.getMetricImportElements(
        dateAggregationModel,
        dataStep.metric.customControls,
        contributor.jsonpath),
      {
        value: termAggregationModel.field,
        control: termeAggregationFg.termAggregationField
      },
      {
        value: termAggregationModel.size,
        control: termeAggregationFg.termAggregationSize
      },
      {
        value: swimlaneInput.swimlaneMode,
        control: renderStep.swimlaneMode
      },
      {
        value: swimlaneInput.swimlaneRepresentation,
        control: renderStep.swimlaneRepresentation
      },
      {
        value: swimlaneInput.paletteColors,
        control: renderStep.paletteColors
      },
      {
        value: swimlaneInput.swimlaneOptions.zerosColor === this.defaultValuesService.getDefaultConfig().swimlaneZeroColor,
        control: renderStep.isZeroRepresentative
      },
      {
        value: swimlaneInput.swimlaneOptions.zerosColor,
        control: renderStep.zerosColors
      },
      {
        value: swimlaneInput.swimlaneOptions.nanColors,
        control: renderStep.NaNColors
      }
    ]);

    return widgetData;
  }

  private getMetricWidgetData(component: AnalyticComponentConfig, contributor: ContributorConfig) {
    const widgetData = this.metricFormBuilder.build();
    const dataStep = widgetData.customControls.dataStep;
    const renderStep = widgetData.customControls.renderStep;

    importElements([
      {
        value: contributor.title,
        control: dataStep.name
      },
      {
        value: !!contributor.function && contributor.function === 'm[0]' ? '' : contributor.function,
        control: dataStep.function
      },
      {
        value: contributor.metrics,
        control: dataStep.metrics
      },
      {
        value: component.input.shortValue,
        control: renderStep.shortValue
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
    return widgetData;
  }

  private getPowerbarWidgetData(component: AnalyticComponentConfig, contributor: ContributorConfig) {
    const widgetData = this.powerbarFormBuilder.build();
    const dataStep = widgetData.customControls.dataStep;
    const renderStep = widgetData.customControls.renderStep;

    importElements([
      {
        value: contributor.title,
        control: dataStep.name
      },
      {
        value: contributor.aggregationmodels[0].field,
        control: dataStep.aggregationField
      },
      {
        value: contributor.aggregationmodels[0].size,
        control: dataStep.aggregationSize
      },
      {
        value: component.input.powerbarTitle,
        control: renderStep.powerbarTitle
      },
      {
        value: component.input.displayFilter,
        control: renderStep.displayFilter
      },
      {
        value: component.input.useColorService,
        control: renderStep.useColorService
      }
    ]);
    return widgetData;
  }

  private getDonutWidgetData(component: AnalyticComponentConfig, contributor: ContributorConfig) {
    const widgetData = this.donutFormBuilder.build();
    const dataStep = widgetData.customControls.dataStep;
    const renderStep = widgetData.customControls.renderStep;

    importElements([
      {
        value: contributor.title,
        control: dataStep.name
      },
      {
        value: contributor.aggregationmodels,
        control: dataStep.aggregationmodels
      },
      {
        value: component.input.opacity,
        control: renderStep.opacity
      },
      {
        value: component.input.multiselectable,
        control: renderStep.multiselectable
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
      value: !contributor.numberOfBuckets,
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
    metricControls: MetricCollectControls,
    jsonpath: string) {

    return [
      {
        value: !contribAggregationModel.metrics || jsonpath === JSONPATH_COUNT ?
          DEFAULT_METRIC_VALUE : contribAggregationModel.metrics[0].collect_fct,
        control: metricControls.metricValue
      },
      {
        value: contribAggregationModel.metrics ? contribAggregationModel.metrics[0].collect_field : null,
        control: metricControls.metricCollectField
      },
      {
        value: contribAggregationModel.metrics ? contribAggregationModel.metrics[0].collect_fct : null,
        control: metricControls.metricCollectFunction
      }
    ] as Array<ImportElement>;
  }

}
