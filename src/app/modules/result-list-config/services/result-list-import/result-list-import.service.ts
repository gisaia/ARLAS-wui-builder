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
  ResultlistFormBuilderService
} from '@analytics-config/services/resultlist-form-builder/resultlist-form-builder.service';
import { Injectable } from '@angular/core';
import { CollectionService } from '@services/collection-service/collection.service';
import {
  AnalyticComponentConfig,
  AnalyticComponentResultListInputConfig,
  Config,
  ContributorConfig
} from '@services/main-form-manager/models-config';
import { MainFormService } from '@services/main-form/main-form.service';
import { ResultListInputsFeeder } from '@utils/resultListInputsFeeder';
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
    const input = component.input as AnalyticComponentResultListInputConfig;
    const option = {
      widgetData,
      contributor,
      input
    };
    const resultListInputsFeeder = new ResultListInputsFeeder(option);
    resultListInputsFeeder
      .importTitle()
      .import(
        input.options.showName !== undefined ? input.options.showName : true,
        widgetData.customControls.showName)
      .importIcons()
      .importActionsSteps()
      .importSettingsSteps()
      .importDataSteps()
      .importGridStep()
      .import(!!contributor.fieldsConfiguration.detailsTitleTemplate ?
        contributor.fieldsConfiguration.detailsTitleTemplate : '',
      dataStep.detailsTitle
      )
      .importResultListQuickLook(this.resultlistFormBuilder, this.colorService, this.collectionService)
      .importContributorColumns(this.resultlistFormBuilder)
      .importUnmanagedFields();
    return widgetData;
  }
}
