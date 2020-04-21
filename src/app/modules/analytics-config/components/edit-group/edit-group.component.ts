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
import {
  Component, OnInit, Input, Output, EventEmitter,
  ChangeDetectorRef
} from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { WIDGET_TYPE } from './models';
import { MatDialog } from '@angular/material';
import { EditWidgetDialogComponent } from '../edit-widget-dialog/edit-widget-dialog.component';
import { NGXLogger } from 'ngx-logger';
import { EditWidgetDialogData } from '../edit-widget-dialog/models';
import { AnalyticGroupConfiguration } from 'arlas-wui-toolkit/components/analytics-board/analytics.utils';
import { ArlasCollaborativesearchService, ArlasStartupService, ArlasConfigService } from 'arlas-wui-toolkit';
import { ContributorBuilder } from 'arlas-wui-toolkit/services/startup/contributorBuilder';
import { HistogramComponent } from 'arlas-web-components';
import { HistogramContributor } from 'arlas-web-contributors';
import { OperationEnum } from 'arlas-web-core';
import { ConfigExportHelper } from '@services/main-form-import-export/config-export-helper';

@Component({
  selector: 'app-edit-group',
  templateUrl: './edit-group.component.html',
  styleUrls: ['./edit-group.component.scss']
})
export class EditGroupComponent implements OnInit {

  @Input() public formGroup: FormGroup;
  @Input() public preview = [];
  @Output() public remove = new EventEmitter();


  public contentTypes = [
    [WIDGET_TYPE.histogram],
    [WIDGET_TYPE.donut],
    [WIDGET_TYPE.powerbar],
    [WIDGET_TYPE.resultlist],
    [WIDGET_TYPE.metric],
    [WIDGET_TYPE.swimlane],
    [WIDGET_TYPE.metric, WIDGET_TYPE.metric],
    [WIDGET_TYPE.donut, WIDGET_TYPE.powerbar],
    [WIDGET_TYPE.donut, WIDGET_TYPE.swimlane],
    [WIDGET_TYPE.histogram, WIDGET_TYPE.histogram],
    [WIDGET_TYPE.powerbar, WIDGET_TYPE.powerbar],
    [WIDGET_TYPE.metric, WIDGET_TYPE.metric, WIDGET_TYPE.metric],
    [WIDGET_TYPE.powerbar, WIDGET_TYPE.powerbar, WIDGET_TYPE.powerbar]
  ];
  public getContentTypes = (nbWidgets: number) => this.contentTypes.filter(elmt => elmt.length === nbWidgets);
  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private logger: NGXLogger,
    private cdr: ChangeDetectorRef,
    private arlasStartupService: ArlasStartupService,
    private collaborativesearchService: ArlasCollaborativesearchService,
    private configService: ArlasConfigService,

  ) { }

  public ngOnInit() {
    this.resetWidgetsOnTypeChange();
  }
  /**
   * on content type change, re-create the formgroup for each widget to define
   */
  private resetWidgetsOnTypeChange() {
    this.contentType.valueChanges.subscribe(values => {
      this.content.clear();
      values.forEach(v => this.content.push(this.formBuilder.group({
        widgetType: [v],
        widgetData: new FormGroup({}, (fg: FormGroup) => ({ validateWidget: { valid: !!fg.controls.length } }))
      })));
    });
  }

  public editWidget(widgetIndex: number) {
    const widgetFg = this.content.get(widgetIndex.toString()) as FormGroup;
    this.dialog.open(EditWidgetDialogComponent, {
      data: {
        widgetType: widgetFg.value.widgetType,
        formData: widgetFg.value.widgetData
      } as EditWidgetDialogData
    })
      .afterClosed().subscribe(result => {
        if (result) {
          widgetFg.setControl('widgetData', result);
          const contrib = this.createContributor(widgetFg.value.widgetType,
            widgetFg.value.widgetData, this.formGroup.controls.icon.value);
          this.formGroup.controls.preview.setValue([ConfigExportHelper.getAnalyticsGroup('preview', this.formGroup.value, 1)]);
          contrib.updateFromCollaboration({
            id: '',
            operation: OperationEnum.add,
            all: false
          });
          this.cdr.detectChanges();
        }
      });
  }


  public createContributor = (widgetType, widgetData, icon) => {
    const contribConfig = ConfigExportHelper.getAnalyticsContributor(widgetType, widgetData, icon) as any;
    const currentConfig = this.configService.getConfig() as any;
    // add web contributors in config if not exist
    if (currentConfig.arlas.web === undefined) {
      currentConfig.arlas.web = {};
      currentConfig.arlas.web.contributors = [];
    } else if (currentConfig.arlas.web.contributors === undefined) {
      currentConfig.arlas.web.contributors = [];
    }
    if (this.arlasStartupService.contributorRegistry.get(contribConfig.identifier) === undefined) {
      currentConfig.arlas.web.contributors.push(contribConfig);
      this.configService.setConfig(currentConfig);
      const contributor = ContributorBuilder.buildContributor(WIDGET_TYPE[widgetType],
        contribConfig.identifier,
        this.configService,
        this.collaborativesearchService);
      this.arlasStartupService.contributorRegistry
        .set(contribConfig.identifier, contributor);
    }
    return this.arlasStartupService.contributorRegistry.get(contribConfig.identifier);
  }

  get contentType() {
    return this.formGroup.controls.contentType;
  }

  get contentTypeValue() {
    return this.formGroup.controls.contentType.value as Array<string>;
  }

  get content() {
    return this.formGroup.controls.content as FormArray;
  }
}
