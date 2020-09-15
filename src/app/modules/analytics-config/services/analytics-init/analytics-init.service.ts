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
import { FormBuilder, Validators, AbstractControl, FormGroup } from '@angular/forms';
import { MainFormService } from '@services/main-form/main-form.service';
import { ConfigExportHelper } from '@services/main-form-manager/config-export-helper';
import { ArlasStartupService, ArlasCollaborativesearchService, ArlasConfigService } from 'arlas-wui-toolkit';
import { ContributorBuilder } from 'arlas-wui-toolkit/services/startup/contributorBuilder';
import { WIDGET_TYPE } from '@analytics-config/components/edit-group/models';
import { OperationEnum } from 'arlas-web-core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsInitService {

  public groupIndex = 0;

  constructor(
    private formBuilder: FormBuilder,
    private mainFormService: MainFormService,
    private arlasStartupService: ArlasStartupService,
    private collaborativesearchService: ArlasCollaborativesearchService,
    private configService: ArlasConfigService,
    private translate: TranslateService
  ) { }

  public initModule() {

    this.mainFormService.analyticsConfig.initListFa(
      this.initTabsList([
      ])
    );
  }

  public initTabsList(tabsList: Array<AbstractControl>) {
    return this.formBuilder.array(
      tabsList);
  }

  public initNewTab(name: string) {
    return this.formBuilder.group({
      tabName: [
        name,
        Validators.required
      ],
      contentFg: this.formBuilder.group({})
    });
  }

  public initTabContent(tabContent: FormGroup) {
    tabContent.addControl('groupsFa', this.formBuilder.array(
      [],
      Validators.required
    ));
  }

  public initNewGroup(name: string) {
    return this.formBuilder.group({
      icon: [
        null,
        Validators.required
      ],
      title: [
        name,
        Validators.required
      ],
      itemPerLine: [
        null
      ],
      contentType: [
        null,
        Validators.required
      ],
      content: this.formBuilder.array([]),
      preview: [new Array()]
    });
  }

  public initNewWidget(type: string) {
    return this.formBuilder.group({
      widgetType: [type],
      widgetData: new FormGroup({}, (fg: FormGroup) => ({ validateWidget: { valid: !!fg.controls.length } }))
    });
  }

  public createPreviewContributor(groupFg: FormGroup, widgetFg: FormGroup) {
    const contrib = this.createContributor(
      widgetFg.value.widgetType,
      widgetFg.value.widgetData,
      groupFg.controls.icon.value);
    groupFg.controls.preview.setValue(ConfigExportHelper.getAnalyticsGroup('preview', groupFg.value, this.groupIndex++));
    contrib.updateFromCollaboration({
      id: '',
      operation: OperationEnum.add,
      all: false
    });
  }

  public createContributor(widgetType: string, widgetData: any, icon: string) {
    const contribConfig = ConfigExportHelper.getAnalyticsContributor(widgetType, widgetData, icon) as any;
    const currentConfig = this.configService.getConfig() as any;

    // add web contributors in config if not exist
    currentConfig.arlas.web = currentConfig.arlas.web || {};
    currentConfig.arlas.web.contributors = currentConfig.arlas.contributors || [];

    if (!this.arlasStartupService.contributorRegistry.has(contribConfig.identifier)) {
      currentConfig.arlas.web.contributors.push(contribConfig);
    } else {
      const contributorsWithMetric = currentConfig.arlas.web.contributors.filter(config => config.identifier !== contribConfig.identifier);
      contributorsWithMetric.push(contribConfig);
      currentConfig.arlas.web.contributors = contributorsWithMetric;
    }
    this.configService.setConfig(currentConfig);

    // TODO do something more robust
    const contribType = [WIDGET_TYPE.powerbars.toString(), WIDGET_TYPE.donut.toString()].indexOf(widgetType) >= 0 ? 'tree' : widgetType;
    const contributor = ContributorBuilder.buildContributor(
      contribType,
      contribConfig.identifier,
      this.configService,
      this.collaborativesearchService);
    this.arlasStartupService.contributorRegistry.set(
      contribConfig.identifier, contributor);
    return this.arlasStartupService.contributorRegistry.get(contribConfig.identifier);
  }

}
