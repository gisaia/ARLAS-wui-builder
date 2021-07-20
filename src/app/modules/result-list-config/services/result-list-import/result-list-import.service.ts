import { Injectable } from '@angular/core';
import {
  AnalyticComponentConfig,
  AnalyticComponentResultListInputConfig,
  Config,
  ContributorConfig
} from '@services/main-form-manager/models-config';
import { importElements } from '@services/main-form-manager/tools';
import { MainFormService } from '@services/main-form/main-form.service';
import { ResultlistFormBuilderService } from '@analytics-config/services/resultlist-form-builder/resultlist-form-builder.service';

@Injectable({
  providedIn: 'root'
})
export class ResultListImportService {

  constructor(
    private mainFormService: MainFormService,
    private resultlistFormBuilder: ResultlistFormBuilderService
  ) { }

  public doImport(config: Config) {
    if (!!config.arlas.web.analytics) {
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
        value: !!titleFieldNames && titleFieldNames.length > 0 ? titleFieldNames[0].fieldPath : '',
        control: renderStep.gridStep.tileLabelField
      },
      {
        value: !!tooltipFieldNames && tooltipFieldNames.length > 0 ? tooltipFieldNames[0].fieldPath : '',
        control: renderStep.gridStep.tooltipField
      },
      {
        value: contributor.fieldsConfiguration.thumbnailFieldName,
        control: renderStep.gridStep.thumbnailUrl
      },
      {
        value: contributor.fieldsConfiguration.imageFieldName,
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
        value: component.input.defautMode,
        control: unmanagedRenderFields.defautMode
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
