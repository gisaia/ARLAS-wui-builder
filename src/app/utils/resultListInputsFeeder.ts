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
import {
  ResultlistConfigForm,
  ResultlistFormBuilderService
} from '@analytics-config/services/resultlist-form-builder/resultlist-form-builder.service';
import { AbstractControl } from '@angular/forms';
import { CollectionService } from '@services/collection-service/collection.service';
import { AnalyticComponentResultListInputConfig, ContributorConfig } from '@services/main-form-manager/models-config';
import { ImportElement, importElements } from '@services/main-form-manager/tools';
import { ArlasColorService } from 'arlas-web-components';

interface ResultListConfigFeederOptions {
    widgetData: ResultlistConfigForm;
    contributor: ContributorConfig;
    input: AnalyticComponentResultListInputConfig;
}

export class ResultListInputsFeeder {
  protected dataStep: any;
  protected gridStep: any;
  protected settingsStep: any;
  protected sactionStep: any;
  protected visualisationStep: any;
  protected customControls: any;
  public constructor(protected options: ResultListConfigFeederOptions) {
    this.dataStep = options.widgetData.customControls.dataStep;
    this.gridStep = options.widgetData.customControls.gridStep;
    this.settingsStep = options.widgetData.customControls.settingsStep;
    this.sactionStep = options.widgetData.customControls.sactionStep;
    this.visualisationStep = options.widgetData.customControls.visualisationStep;
    this.customControls = options.widgetData.customControls;
  }

  public import<T>(value: T, control: AbstractControl){
    if(value !== null){
      control.setValue(value);
    }
    return this;
  }

  public imports(elements: Array<ImportElement>){
    importElements(elements);
    return this;
  }

  public importTitle(){
    this.import(this.options.contributor.name, this.options.widgetData.customControls.title);
    return this;
  }

  public importActionsSteps(){
    return this.imports([
      {
        value: this.options.input.downloadLink,
        control: this.sactionStep.downloadLink
      },
      {
        value: this.options.input.visualisationLink,
        control: this.sactionStep.visualisationLink
      },
    ]);
  }


  public importSettingsSteps(){
    return this.imports([
      {
        value: this.options.input.displayFilters,
        control: this.settingsStep.displayFilters
      },
      {
        value: this.options.input.isGeoSortActived,
        control: this.settingsStep.isGeoSortActived
      },
      {
        value: this.options.input.cellBackgroundStyle,
        control: this.settingsStep.cellBackgroundStyle
      }
    ]);
  }

  public importGridStep(){
    const  titleFieldNames = this.options.contributor.fieldsConfiguration.titleFieldNames;
    const tooltipFieldNames = this.options.contributor.fieldsConfiguration.tooltipFieldNames;
    return this.imports([
      {
        value: !!this.options.contributor.fieldsConfiguration.urlThumbnailTemplate ?
          this.options.contributor.fieldsConfiguration.urlThumbnailTemplate : '',
        control: this.gridStep.thumbnailUrl
      },
      {
        value: this.options.input.defautMode === 'grid',
        control:  this.gridStep.isDefaultMode
      },
      {
        value:  this.options.contributor.fieldsConfiguration.useHttpThumbnails,
        control:  this.gridStep.useHttpThumbnails
      },
      {
        value:  this.options.contributor.fieldsConfiguration.useHttpQuicklooks,
        control:  this.gridStep.useHttpQuicklooks
      },
      {
        value: !!titleFieldNames && titleFieldNames.length > 0 ? titleFieldNames[0].fieldPath : '',
        control:  this.gridStep.tileLabelField
      },
      {
        value: !!titleFieldNames && titleFieldNames.length > 0 ? titleFieldNames[0].process : '',
        control:  this.gridStep.tileLabelFieldProcess
      },
      {
        value: !!tooltipFieldNames && tooltipFieldNames.length > 0 ? tooltipFieldNames[0].fieldPath : '',
        control:  this.gridStep.tooltipField
      },
      {
        value: !!tooltipFieldNames && tooltipFieldNames.length > 0 ? tooltipFieldNames[0].process : '',
        control:  this.gridStep.tooltipFieldProcess
      },
      {
        value:  this.options.contributor.fieldsConfiguration.iconColorFieldName,
        control: this.gridStep.colorIdentifier
      }]);
  }

  public importDataSteps(){
    return this.imports([
      {
        value: this.options.contributor.collection,
        control: this.dataStep.collection
      },
      {
        value: this.options.contributor.search_size >= 50 ? this.options.contributor.search_size : 50,
        control: this.dataStep.searchSize
      },
      {
        value: this.options.contributor.fieldsConfiguration.idFieldName,
        control: this.dataStep.idFieldName
      },
    ]);
  }

  // not present in analytics config that is why it is separate
  public importIcons(){
    this.imports(
      [
        {
          value: !!this.options.input.options.icon ? this.options.input.options.icon : 'short_text',
          control: this.customControls.icon
        },
        {
          value: this.options.input.options.showIcon !== undefined ? this.options.input.options.showIcon : true,
          control: this.customControls.showIcon
        },
      ]
    );
    return this;
  }

  public importVisualisationStep(resultListFormBuilder: ResultlistFormBuilderService,
    colorService: ArlasColorService, collectionService: CollectionService){
    if(this.options.input.visualisationsList && this.options.input.visualisationsList.length > 0) {
      this.options.input.visualisationsList.forEach(visualisation => {
        const visualisationForm = resultListFormBuilder.buildVisualisation();
        this.imports([
          {
            value: visualisation.description,
            control: visualisationForm.customControls.description
          },
          {
            value: visualisation.name,
            control: visualisationForm.customControls.name
          },
        ]);

        if(visualisation?.itemsFamilies && visualisation.itemsFamilies.length > 0) {
          visualisation?.itemsFamilies.forEach(itemF => {
            const itemFamily = resultListFormBuilder
              .buildVisualisationsItemFamily(this.options.contributor.collection);
            importElements([
              {
                value: itemF.visualisationUrl,
                control: itemFamily.customControls.visualisationUrl
              },
              {
                value: itemF.itemsFamily,
                control: itemFamily.customControls.dataGroups
              },
              {
                value: itemF.protocol,
                control: itemFamily.customControls.protocol
              },
            ]);
            if (itemF.filter) {
              const selectedItems = itemF.filter.values.map(
                v => ({ value: v.value, label: v.value, color: colorService.getColor(v.color) }));

              importElements([{
                value: itemF.filter.field,
                control: itemFamily.customControls.filter.field
              },
              {
                value: selectedItems,
                control: itemFamily.customControls.filter.values
              }]);

              itemFamily.customControls.filter.values.selectedMultipleItems = selectedItems;
              itemFamily.customControls.filter.values.savedItems = new Set(selectedItems.map(v => v.value));
              collectionService.getTermAggregation(
                this.options.contributor.collection,
                itemFamily.customControls.filter.field.value)
                .then(keywords => {
                  itemFamily.customControls.filter.values.setSyncOptions(keywords.map(k => ({ value: k, label: k })));
                });
            }
            visualisationForm.customControls.dataGroups.push(itemFamily);
          });
        }
        this.visualisationStep.visualisationsList.push(visualisationForm);
      });
    }

    return this;
  }

  public importResultListQuickLook (resultListFormBuilder: ResultlistFormBuilderService,
    colorService: ArlasColorService, collectionService: CollectionService){

    if (this.options.contributor.fieldsConfiguration.urlImageTemplate) {
      const quicklook = resultListFormBuilder.buildQuicklook(this.options.contributor.collection);
      this.import(this.options.contributor.fieldsConfiguration.urlImageTemplate, quicklook.customControls.url);
      this.gridStep.quicklookUrls.push(quicklook);
    }

    this.options.contributor.fieldsConfiguration.urlImageTemplates?.forEach(descUrl => {
      const quicklook = resultListFormBuilder.buildQuicklook(this.options.contributor.collection);
      this.imports([
        {
          value: descUrl.url,
          control: quicklook.customControls.url
        },
        {
          value: descUrl.description,
          control: quicklook.customControls.description
        }
      ]);
      if (descUrl.filter) {
        const selectedItems = descUrl.filter.values.map(
          v => ({ value: v, label: v, color: colorService.getColor(v) }));

        this.imports([{
          value: descUrl.filter.field,
          control: quicklook.customControls.filter.field
        },
        {
          value: selectedItems,
          control: quicklook.customControls.filter.values
        }]);

        quicklook.customControls.filter.values.selectedMultipleItems = selectedItems;
        quicklook.customControls.filter.values.savedItems = new Set(descUrl.filter.values);
        collectionService.getTermAggregation(
          this.options.contributor.collection,
          quicklook.customControls.filter.field.value)
          .then(keywords => {
            quicklook.customControls.filter.values.setSyncOptions(keywords.map(k => ({ value: k, label: k })));
          });
      }

      this.options.widgetData.customControls.gridStep.quicklookUrls.push(quicklook);
    });
    return this;
  }

  public importResultListContributorDetail(
    resultListFormBuilder: ResultlistFormBuilderService){
    (this.options.contributor.details || [])
      .sort((d1, d2) => d1.order - d2.order)
      .forEach(d => {

        const detail = resultListFormBuilder.buildDetail();
        importElements([
          {
            value: d.name,
            control: detail.customControls.name
          }
        ]);

        d.fields.forEach(f => {
          const field = resultListFormBuilder.buildDetailField(this.options.contributor.collection);
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

        this.options.widgetData.customControls.dataStep.details.push(detail);
      });
    return this;
  }

  public importContributorColumns(resultlistFormBuilder){
    this.options.contributor.columns.forEach(c => {
      const column = resultlistFormBuilder.buildColumn(this.options.contributor.collection);
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
        },
        {
          value: !!c.sort ? c.sort : '',
          control: column.customControls.sort
        }
      ]);
      this.dataStep.columns.push(column);
    });
    return this;
  }

  public importUnmanagedFields(){
    const unmanagedRenderFields = this.customControls.unmanagedFields.renderStep;
    return this.imports([
      {
        value: this.options.input.tableWidth,
        control: unmanagedRenderFields.tableWidth
      },
      {
        value: this.options.input.globalActionsList,
        control: unmanagedRenderFields.globalActionsList
      },
      {
        value: this.options.input.nLastLines,
        control: unmanagedRenderFields.nLastLines
      },
      {
        value: this.options.input.detailedGridHeight,
        control: unmanagedRenderFields.detailedGridHeight
      },
      {
        value: this.options.input.nbGridColumns,
        control: unmanagedRenderFields.nbGridColumns
      },
      {
        value: this.options.input.isBodyHidden,
        control: unmanagedRenderFields.isBodyHidden
      },
      {
        value: this.options.input.isAutoGeoSortActived,
        control: unmanagedRenderFields.isAutoGeoSortActived
      },
      {
        value: this.options.input.selectedItemsEvent,
        control: unmanagedRenderFields.selectedItemsEvent
      },
      {
        value: this.options.input.consultedItemEvent,
        control: unmanagedRenderFields.consultedItemEvent
      },
      {
        value: this.options.input.actionOnItemEvent,
        control: unmanagedRenderFields.actionOnItemEvent
      },
      {
        value: this.options.input.globalActionEvent,
        control: unmanagedRenderFields.globalActionEvent
      },
      {
        value: this.options.input.detailedGridHeight,
        control: unmanagedRenderFields.globalActionEvent
      }
    ]);
  }
}


export class AnalyticsResultListInputsFeeder extends ResultListInputsFeeder {
  public importDataSteps(){
    return this.imports([{
      value: this.options.contributor.collection,
      control:  this.dataStep.collection
    },
    {
      value: this.options.contributor.search_size,
      control:  this.dataStep.searchSize
    },
    {
      value: this.options.contributor.fieldsConfiguration.idFieldName,
      control:  this.dataStep.idFieldName
    }]);
  }

  public importGridStep(){
    return this.imports([
      {
        value: this.options.input.defautMode === 'grid',
        control:  this.gridStep.isDefaultMode
      },
      {
        value: !!this.options.contributor.fieldsConfiguration.urlThumbnailTemplate ?
          this.options.contributor.fieldsConfiguration.urlThumbnailTemplate : '',
        control:  this.gridStep.thumbnailUrl
      },
      {
        value: this.options.contributor.fieldsConfiguration.iconColorFieldName,
        control:  this.gridStep.colorIdentifier
      },
    ]);
  }

  public importContributorColumns(resultlistFormBuilder){
    this.options.contributor.columns.forEach(c => {
      const column = resultlistFormBuilder.buildColumn(this.options.contributor.collection);
      this.imports([
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
      this.options.widgetData.customControls.dataStep.columns.push(column);
    });
    return this;
  }
}
