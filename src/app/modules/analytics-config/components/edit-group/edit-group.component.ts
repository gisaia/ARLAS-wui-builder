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
import { Subject } from 'rxjs';
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
          this.createContributor('1');
          this.formGroup.controls
            .preview.setValue([this.analyticsBoardConfig('1')]);
          this.arlasStartupService.contributorRegistry.get('1').updateFromCollaboration({
            id: '',
            operation: OperationEnum.add,
            all: false
          });
          widgetFg.
            setControl('widgetData', result);
          this.cdr.detectChanges();
        }
      });
  }

  // Use to test hardcoding preview
  public analyticsBoardConfig(identifier) {
    return {
      groupId: identifier,
      title: 'Course over ground (degree)',
      icon: 'explore',
      tab: 'Preview',
      components: [
        {
          contributorId: identifier,
          componentType: 'histogram',
          input: {
            dataType: 'numeric',
            id: identifier,
            isHistogramSelectable: true,
            multiselectable: true,
            topOffsetRemoveInterval: 40,
            leftOffsetRemoveInterval: 18,
            brushHandlesHeightWeight: 0.8,
            yAxisStartsFromZero: true,
            chartType: 'area',
            chartTitle: 'Course over ground',
            chartWidth: 445,
            chartHeight: 100,
            customizedCssClass: 'arlas-histogram-analytics',
            xAxisPosition: 'bottom',
            descriptionPosition: 'bottom',
            xTicks: 4,
            yTicks: 1,
            xLabels: 4,
            yLabels: 4,
            showXTicks: true,
            showYTicks: true,
            showXLabels: true,
            showYLabels: true,
            showHorizontalLines: false,
            isSmoothedCurve: true,
            barWeight: 0.8
          }
        }
      ]
    };
  }

  // Use to test hardcoding contributor
  public getContribConfiguration(id) {
    return {
      type: 'histogram',
      identifier: id,
      aggregationmodels: [

        {
          type: 'histogram',
          field: 'course.cog'
        }
      ],
      name: 'Course over ground',
      charttype: 'area',
      numberOfBuckets: 50,
      title: 'Course over ground',
      icon: 'explore',
      isOneDimension: false
    };
  }

  public createContributor = (id) => {
    if (this.arlasStartupService.contributorRegistry.get(id) === undefined) {
      const config = {
        arlas: {
          web: {
            contributors: []
          }
        }
      };
      config.arlas.web.contributors.push(this.getContribConfiguration(id));
      this.configService.setConfig(config);
      const contributor = ContributorBuilder.buildContributor('histogram',
        id,
        this.configService,
        this.collaborativesearchService);
      this.arlasStartupService.contributorRegistry
        .set(id, contributor);
    }
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
