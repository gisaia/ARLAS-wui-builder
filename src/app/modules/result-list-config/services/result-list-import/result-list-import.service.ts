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

import { ResultlistFormBuilderService } from '@analytics-config/services/resultlist-form-builder/resultlist-form-builder.service';
import { Injectable } from '@angular/core';
import { CollectionService } from '@services/collection-service/collection.service';
import {
  AnalyticComponentConfig,
  AnalyticComponentResultListInputConfig,
  Config,
  ContributorConfig
} from '@services/main-form-manager/models-config';
import { importElements } from '@services/main-form-manager/tools';
import { MainFormService } from '@services/main-form/main-form.service';
import { ArlasColorService } from 'arlas-web-components';


@Injectable({
  providedIn: 'root'
})
export class ResultListImportService {

  public constructor(
    private mainFormService: MainFormService,
    private resultlistFormBuilder: ResultlistFormBuilderService,
    private colorService: ArlasColorService,
    private collectionService: CollectionService
  ) { }

  public doImport(config: Config) {
    if (!!config.arlas.web.components && !!config.arlas.web.components.resultlists) {
      config.arlas.web.components.resultlists.forEach(c => {
        const contributorId = c.contributorId;
        const contributor = config.arlas.web.contributors.find(contrib => contrib.identifier === contributorId);
        const listFg = this.getResultlistWidgetData(c, contributor);
        this.mainFormService.resultListConfig.getResultListsFa().push(listFg);
      });
    }
  }

  private getResultlistWidgetData(component: AnalyticComponentConfig, contributor: ContributorConfig) {
    const widgetData = this.resultlistFormBuilder.build(contributor.collection);
    const dataStep = widgetData.customControls.dataStep;
    const renderStep = widgetData.customControls.renderStep;
    const actionStep = widgetData.customControls.zactionStep;
    const title = widgetData.customControls.title;
    const icon = widgetData.customControls.icon;
    const showName = widgetData.customControls.showName;
    const showIcon = widgetData.customControls.showIcon;
    const inputs = component.input as AnalyticComponentResultListInputConfig;
    const titleFieldNames = contributor.fieldsConfiguration.titleFieldNames;
    const tooltipFieldNames = contributor.fieldsConfiguration.tooltipFieldNames;
    importElements([
      {
        value: contributor.name,
        control: title
      },
      {
        value: !!inputs.options.icon ? inputs.options.icon : 'short_text',
        control: icon
      },
      {
        value: inputs.options.showName !== undefined ? inputs.options.showName : true,
        control: showName
      },
      {
        value: inputs.options.showIcon !== undefined ? inputs.options.showIcon : true,
        control: showIcon
      },
      {
        value: contributor.collection,
        control: dataStep.collection
      },
      {
        value: contributor.search_size >= 50 ? contributor.search_size : 50,
        control: dataStep.searchSize
      },
      {
        value: inputs.visualisationLink,
        control: actionStep.visualisationLink
      },
      {
        value: inputs.downloadLink,
        control: actionStep.downloadLink
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
        value: contributor.fieldsConfiguration.useHttpThumbnails,
        control: renderStep.gridStep.useHttpThumbnails
      },
      {
        value: contributor.fieldsConfiguration.useHttpQuicklooks,
        control: renderStep.gridStep.useHttpQuicklooks
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

    inputs?.visualisationsList?.forEach( visualisation => {
      const visualisationForm = this.resultlistFormBuilder.buildVisualisation();
      importElements([
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
          const itemFamily = this.resultlistFormBuilder
            .buildVisualisationsItemFamily(contributor.collection);
          importElements([
            {
              value: itemF.visualisationUrl,
              control: itemFamily.customControls.visualisationUrl
            },
            {
              value: itemF.itemsFamily,
              control: itemFamily.customControls.itemsFamily
            },
            {
              value: itemF.protocol,
              control: itemFamily.customControls.protocol
            },
          ]);
          if (itemF.filter) {
            const selectedItems = itemF.filter.values.map(
              v => ({ value: v.value, label: v.value, color: this.colorService.getColor(v.color) }));

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
            this.collectionService.getTermAggregation(
              contributor.collection,
              itemFamily.customControls.filter.field.value)
              .then(keywords => {
                itemFamily.customControls.filter.values.setSyncOptions(keywords.map(k => ({ value: k, label: k })));
              });
          }
          visualisationForm.customControls.itemsFamilies.push(itemFamily);
        });
      }
      widgetData.customControls.zactionStep.visualisationSection.visualisationsList.push(visualisationForm);
    });

    if (contributor.fieldsConfiguration.urlImageTemplate) {
      const quicklook = this.resultlistFormBuilder.buildQuicklook(contributor.collection);
      importElements([
        {
          value: contributor.fieldsConfiguration.urlImageTemplate,
          control: quicklook.customControls.url
        }
      ]);
      widgetData.customControls.renderStep.gridStep.quicklookUrls.push(quicklook);
    }


    contributor.fieldsConfiguration.urlImageTemplates?.forEach(descUrl => {
      const quicklook = this.resultlistFormBuilder.buildQuicklook(contributor.collection);
      importElements([
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
          v => ({ value: v, label: v, color: this.colorService.getColor(v) }));

        importElements([{
          value: descUrl.filter.field,
          control: quicklook.customControls.filter.field
        },
        {
          value: selectedItems,
          control: quicklook.customControls.filter.values
        }]);

        quicklook.customControls.filter.values.selectedMultipleItems = selectedItems;
        quicklook.customControls.filter.values.savedItems = new Set(descUrl.filter.values);
        this.collectionService.getTermAggregation(
          contributor.collection,
          quicklook.customControls.filter.field.value)
          .then(keywords => {
            quicklook.customControls.filter.values.setSyncOptions(keywords.map(k => ({ value: k, label: k })));
          });
      }

      widgetData.customControls.renderStep.gridStep.quicklookUrls.push(quicklook);
    });

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
        },
        {
          value: !!c.sort ? c.sort : '',
          control: column.customControls.sort
        }
      ]);
      widgetData.customControls.dataStep.columns.push(column);
    });

    importElements([
      {
        value: !!contributor.fieldsConfiguration.detailsTitleTemplate ? contributor.fieldsConfiguration.detailsTitleTemplate : '',
        control: dataStep.detailsTitle
      }
    ]);

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
}
