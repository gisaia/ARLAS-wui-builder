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
  ResultlistConfigForm, ResultlistFormBuilderService
} from '@analytics-config/services/resultlist-form-builder/resultlist-form-builder.service';
import { AbstractControl } from '@angular/forms';
import { CollectionService } from '@services/collection-service/collection.service';
import { AnalyticComponentConfig, ContributorConfig } from '@services/main-form-manager/models-config';
import { Filter, Expression } from 'arlas-api';
import { ArlasColorService } from 'arlas-web-components';
export interface ImportElement {
  value: any;
  control: AbstractControl;
}

export function importElements(elements: Array<ImportElement>) {
  elements
    .filter(e => e.value !== null)
    .forEach(element => element.control.setValue(element.value));
}

export function importResultListQuickLook (widgetData: ResultlistConfigForm, contributor: ContributorConfig,
  resultListFormBuilder: ResultlistFormBuilderService, colorService: ArlasColorService, collectionService: CollectionService){
  contributor.fieldsConfiguration.urlImageTemplates?.forEach(descUrl => {
    const quicklook = resultListFormBuilder.buildQuicklook(contributor.collection);
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
        v => ({ value: v, label: v, color: colorService.getColor(v) }));

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
      collectionService.getTermAggregation(
        contributor.collection,
        quicklook.customControls.filter.field.value)
        .then(keywords => {
          quicklook.customControls.filter.values.setSyncOptions(keywords.map(k => ({ value: k, label: k })));
        });
    }

    widgetData.customControls.gridStep.quicklookUrls.push(quicklook);
  });
}

export function importResultListContributorDetail(widgetData: ResultlistConfigForm, contributor: ContributorConfig,
  resultlistFormBuilder){
  (contributor.details || [])
    .sort((d1, d2) => d1.order - d2.order)
    .forEach(d => {

      const detail = resultlistFormBuilder.buildDetail();
      importElements([
        {
          value: d.name,
          control: detail.customControls.name
        }
      ]);

      d.fields.forEach(f => {
        const field = resultlistFormBuilder.buildDetailField(contributor.collection);
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
}

export function importResultListUnmanagedFields(component: AnalyticComponentConfig, unmanagedRenderFields: any){
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
}

export function stringifyArlasFilter(filter: Filter): string {
  let arlasFilterAsString = '';
  if (!!filter) {
    if (!!filter.f) {
      /** transform AND expressions to a sorted string */
      const andExpressionsAsString = filter.f.map(orExpressions => {
        /** transform OR expressions to a sorted string */
        const orExpressionsAstring = orExpressions.map(exp => stringifyArlasExpression(exp)).sort().join('|');
        return orExpressionsAstring;
      }).sort().join('&');
      arlasFilterAsString += 'arlas-f-' + andExpressionsAsString.trim();
    }
    if (filter.q) {
      /** transform AND expressions to a sorted string */
      const andStrings = filter.f.map(or => {
        /** transform OR expressions to a sorted string */
        const orStrings = or.sort().join('|');
        return orStrings;
      }).sort().join('&');
      arlasFilterAsString += 'arlas-q-' + andStrings.trim();
    }
    if (filter.dateformat) {
      arlasFilterAsString += 'arlas-dateformat-' + filter.dateformat.trim();
    }
    if (filter.righthand) {
      arlasFilterAsString += 'arlas-righthand-true';
    }
  }
  return arlasFilterAsString;
}


export function stringifyArlasExpression(exp: Expression): string {
  return `${exp.field}-${exp.op}-${exp.value}`;
}

export function hashCode(s): number {
  let h = 0;
  if (!s || s.length === 0) {
    return h;
  }
  for (let i = 0; i < s.length; i++) {
    // tslint:disable-next-line: no-bitwise
    h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  }
  return h;
}
