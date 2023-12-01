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
  BucketsIntervalFormBuilderService,
  BucketsIntervalFormGroup,
} from '@analytics-config/services/buckets-interval-form-builder/buckets-interval-form-builder.service';
import { BUCKET_TYPE } from '@analytics-config/services/buckets-interval-form-builder/models';
import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { CollectionService } from '@services/collection-service/collection.service';
import { toNumericOrDateFieldsObs, toOptionsObs } from '@services/collection-service/tools';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { StartupService } from '@services/startup/startup.service';
import {
  ConfigFormGroup, HiddenFormControl, InputFormControl, MultipleSelectFormControl, SelectFormControl,
  SliderFormControl, SlideToggleFormControl
} from '@shared-models/config-form';
import { ArlasColorService, ChartType } from 'arlas-web-components';
import { ArlasSettingsService } from 'arlas-wui-toolkit';

enum DateFormats {
  English = '%b %d %Y  %H:%M',
  French = '%d %b %Y  %H:%M'
}

export class TimelineGlobalFormGroup extends ConfigFormGroup {

  public constructor(
    collection: string,
    collectionService: CollectionService,
    startupService: StartupService,
    mainFormService: MainFormService,
    settingsService: ArlasSettingsService,
    timelineBucketsIntervalFg?: BucketsIntervalFormGroup,
    colorService?: ArlasColorService,
  ) {
    super(
      {
        useDetailedTimeline: new SlideToggleFormControl(
          '',
          marker('Use detailed timeline?'),
          '',
          {
            resetDependantsOnChange: true
          }
        ),
        useUtc: new SlideToggleFormControl(
          '',
          marker('Use UTC time Zone to display date?'),
          marker('Use UTC time Zone to display date description'),
          {
            resetDependantsOnChange: true
          }
        ),
        // using container because form groups with tabs cannot be at same level as form control
        tabsContainer: new ConfigFormGroup({
          dataStep: new ConfigFormGroup({
            timeline: new ConfigFormGroup({
              collection: new SelectFormControl(
                collection,
                marker('Collection'),
                marker('Timeline collection description'),
                false,
                collectionService.getCollections().map(c => ({ label: c, value: c })),
                {
                  optional: false,
                  resetDependantsOnChange: true
                }
              ),
              aggregation: timelineBucketsIntervalFg
                .withDependsOn(() => [this.customControls.tabsContainer.dataStep.timeline.collection])
                .withOnDependencyChange(
                  () => {
                    const selectedCollection = this.customControls.tabsContainer.dataStep.timeline.collection.value;
                    timelineBucketsIntervalFg.setCollection(selectedCollection);
                    toOptionsObs(toNumericOrDateFieldsObs(collectionService
                      .getCollectionFields(selectedCollection)))
                      .subscribe(collectionFields => {
                        timelineBucketsIntervalFg.customControls.aggregationField.setSyncOptions(collectionFields);
                        collectionService.getDescribe(selectedCollection).subscribe(collectionRef => {
                          timelineBucketsIntervalFg.customControls.aggregationField.setValue(collectionRef.params.timestamp_path);
                        });
                      });
                  }
                )
            }
            ).withTitle(marker('Timeline')),
            detailedTimeline: new ConfigFormGroup({
              bucketsNumber: new SliderFormControl(
                '',
                marker('Number of buckets'),
                marker(''),
                2,
                150,
                1
              )
            }, {
              dependsOn: () => [this.customControls.useDetailedTimeline],
              onDependencyChange: (control) =>
                control.enableIf(this.customControls.useDetailedTimeline.value)
            }
            ).withTitle(marker('Detailed timeline')),
            additionalCollections: new ConfigFormGroup({
              collections: new MultipleSelectFormControl(
                '',
                marker('Additional collections'),
                marker('Additional collections description'),
                false,
                collectionService.getCollections()
                  .filter(c => c !== collection)
                  .map(c => ({
                    label: c,
                    value: c,
                    color: colorService.getColor(c),
                    detail: '' // Fill in onDependencyChange on form load
                  })),
                {
                  optional: true,
                },
                false
              )
            }, {
              dependsOn: () => [this.customControls.tabsContainer.dataStep.timeline.collection],
              onDependencyChange: () => {
                if (this.customControls.tabsContainer.dataStep.timeline.collection.dirty) {
                  this.customControls.tabsContainer.dataStep.additionalCollections.collections.savedItems = new Set<string>();
                  this.customControls.tabsContainer.dataStep.additionalCollections.collections.selectedMultipleItems = [];
                  this.customControls.tabsContainer.dataStep.timeline.collection.markAsPristine();
                }
                this.customControls.tabsContainer.dataStep.additionalCollections.collections.setSyncOptions(
                  collectionService.getCollections().filter(c => c !== this.customControls.tabsContainer.dataStep.timeline.collection.value)
                    .map(c => ({
                      label: c,
                      value: c,
                      color: colorService.getColor(c),
                      detail: collectionService.getCollectionInterval(c)
                    }))
                );
              }
            }).withTitle(marker('Additional collections'))

          }).withTabName(marker('Data')),
          renderStep: new ConfigFormGroup({
            timeline: new ConfigFormGroup({
              chartTitle: new InputFormControl(
                '',
                marker('Chart title'),
                marker('Chart title description')
              ),
              chartType: new SelectFormControl(
                '',
                marker('Chart type'),
                marker('Timeline type description'),
                false,
                [ChartType[ChartType.area], ChartType[ChartType.bars], ChartType[ChartType.curve]].map(s =>
                  ({ label: s, value: s })),
                {
                  dependsOn: () => [this.customControls.tabsContainer.dataStep.additionalCollections.collections],
                  onDependencyChange: (control) => {
                    if (
                      !!this.customControls.tabsContainer.dataStep.additionalCollections.collections.value &&
                      this.customControls.tabsContainer.dataStep.additionalCollections.collections.value.length > 0) {
                      control.setValue(ChartType[ChartType.curve]);
                    }
                  }
                }
              ),
              dateFormat: new SelectFormControl(
                '',
                marker('Date format'),
                marker('Date format description'),
                false,
                Object.keys(DateFormats).map(df => ({
                  label: df + ' (' + DateFormats[df] + ')', value: DateFormats[df]
                }))
              ),
              isMultiselectable: new SlideToggleFormControl(
                false,
                marker('Is multiselectable?'),
                marker('Is timeline multi-selectable description')
              )
            }).withTitle('Timeline'),
            detailedTimeline: new ConfigFormGroup(
              {
                chartTitle: new InputFormControl(
                  '',
                  marker('Chart title'),
                  marker('Chart title description')
                ),
                chartType: new SelectFormControl(
                  '',
                  marker('Chart type'),
                  marker('Timeline type description'),
                  false,
                  [ChartType[ChartType.area], ChartType[ChartType.bars], ChartType[ChartType.curve]].map(s =>
                    ({ label: s, value: s })),
                  {
                    dependsOn: () => [this.customControls.tabsContainer.dataStep.additionalCollections.collections],
                    onDependencyChange: (control) => {
                      if (
                        !!this.customControls.tabsContainer.dataStep.additionalCollections.collections.value &&
                        this.customControls.tabsContainer.dataStep.additionalCollections.collections.value.length > 0) {
                        control.setValue(ChartType[ChartType.curve]);
                      }
                    }
                  }
                ),
                selectionExtentPercent: new SliderFormControl(
                  '',
                  marker('Percent of selection extent'),
                  marker('Timeline percent of selection extent description'),
                  0,
                  100,
                  5
                )
              },
              {
                dependsOn: () => [this.customControls.useDetailedTimeline],
                onDependencyChange: (control) =>
                  control.enableIf(this.customControls.useDetailedTimeline.value)
              }).withTitle(marker('Detailed timeline')),

          }).withTabName(marker('Render'))
        }),
        unmanagedFields: new FormGroup({
          dataStep: new FormGroup({
            timeline: new FormGroup({
              name: new FormControl(),
              icon: new FormControl(),
              isOneDimension: new FormControl(),
              uuid: new HiddenFormControl(
                '',
                null,
                {
                  optional: true
                })
            }),
            detailedTimeline: new FormGroup({
              name: new FormControl(),
              icon: new FormControl(),
              isOneDimension: new FormControl(),
              uuid: new HiddenFormControl(
                '',
                null,
                {
                  optional: true
                })
            })
          }),
          renderStep: new FormGroup({
            timeline: new FormGroup({
              xTicks: new FormControl(),
              yTicks: new FormControl(),
              xLabels: new FormControl(),
              yLabels: new FormControl(),
              xUnit: new FormControl(),
              yUnit: new FormControl(),
              chartXLabel: new FormControl(),
              customizedCssClass: new FormControl(),
              chartHeight: new FormControl(),
              brushHandlesHeightWeight: new FormControl(),
              isHistogramSelectable: new FormControl(),
              chartWidth: new FormControl(),
              xAxisPosition: new FormControl(),
              yAxisStartsFromZero: new FormControl(),
              descriptionPosition: new FormControl(),
              showXTicks: new FormControl(),
              showYTicks: new FormControl(),
              showXLabels: new FormControl(),
              showYLabels: new FormControl(),
              shortYLabels: new FormControl(),
              showHorizontalLines: new FormControl(),
              isSmoothedCurve: new FormControl(),
              barWeight: new FormControl(),
              topOffsetRemoveInterval: new FormControl(),
            }),
            detailedTimeline: new FormGroup({
              xTicks: new FormControl(),
              yTicks: new FormControl(),
              xLabels: new FormControl(),
              yLabels: new FormControl(),
              xUnit: new FormControl(),
              yUnit: new FormControl(),
              chartXLabel: new FormControl(),
              customizedCssClass: new FormControl(),
              chartHeight: new FormControl(),
              multiselectable: new FormControl(),
              brushHandlesHeightWeight: new FormControl(),
              isHistogramSelectable: new FormControl(),
              chartWidth: new FormControl(),
              xAxisPosition: new FormControl(),
              yAxisStartsFromZero: new FormControl(),
              descriptionPosition: new FormControl(),
              showXTicks: new FormControl(),
              showYTicks: new FormControl(),
              showXLabels: new FormControl(),
              showYLabels: new FormControl(),
              shortYLabels: new FormControl(),
              showHorizontalLines: new FormControl(),
              isSmoothedCurve: new FormControl(),
              barWeight: new FormControl(),
            })
          }),

        })
      });

    // tslint:disable-next-line:no-string-literal
    if (!!settingsService.settings && settingsService.settings['use_time_filter']) {
      this.customControls.tabsContainer.dataStep.additionalCollections.collections.valueChanges.subscribe(r => {
        startupService.interceptorRegistry.forEach((v, k) => {
          if (r.map(c => c.value).indexOf(k) < 0 && k !== collection) {
            startupService.removeArlasInterceptor(k);
          }
        });
        r.map(c => c.value).forEach(value => {
          if (startupService.interceptorRegistry.get(value) === null || startupService.interceptorRegistry.get(value) === undefined) {
            const url = mainFormService.startingConfig.getFg().get('serverUrl').value;
            startupService.getTimeFilter(value, url, collectionService, settingsService).subscribe(filter => {
              startupService.applyArlasInterceptor(value, filter);
            });
          }
        });
      });
    }

  }

  public customControls = {
    useDetailedTimeline: this.get('useDetailedTimeline') as SlideToggleFormControl,
    useUtc: this.get('useUtc') as SlideToggleFormControl,
    tabsContainer: {
      dataStep: {
        timeline: {
          collection: this.get('tabsContainer.dataStep.timeline.collection') as SelectFormControl,
          aggregation: this.get('tabsContainer.dataStep.timeline.aggregation') as BucketsIntervalFormGroup
        },
        detailedTimeline: {
          bucketsNumber: this.get('tabsContainer.dataStep.detailedTimeline.bucketsNumber') as SliderFormControl
        },
        additionalCollections: {
          collections: this.get('tabsContainer.dataStep.additionalCollections.collections') as MultipleSelectFormControl
        }
      },
      renderStep: {
        timeline: {
          chartTitle: this.get('tabsContainer.renderStep.timeline.chartTitle') as InputFormControl,
          chartType: this.get('tabsContainer.renderStep.timeline.chartType') as SelectFormControl,
          dateFormat: this.get('tabsContainer.renderStep.timeline.dateFormat') as SelectFormControl,
          isMultiselectable: this.get('tabsContainer.renderStep.timeline.isMultiselectable') as SlideToggleFormControl
        },
        detailedTimeline: {
          chartTitle: this.get('tabsContainer.renderStep.detailedTimeline.chartTitle') as InputFormControl,
          chartType: this.get('tabsContainer.renderStep.detailedTimeline.chartType') as SelectFormControl,
          selectionExtentPercent: this.get('tabsContainer.renderStep.detailedTimeline.selectionExtentPercent') as SliderFormControl
        }
      }
    },
    unmanagedFields: {
      dataStep: {
        timeline: {
          name: this.get('unmanagedFields.dataStep.timeline.name'),
          icon: this.get('unmanagedFields.dataStep.timeline.icon'),
          isOneDimension: this.get('unmanagedFields.dataStep.timeline.isOneDimension'),
          uuid: this.get('unmanagedFields.dataStep.timeline.uuid')
        },
        detailedTimeline: {
          name: this.get('unmanagedFields.dataStep.detailedTimeline.name'),
          icon: this.get('unmanagedFields.dataStep.detailedTimeline.icon'),
          isOneDimension: this.get('unmanagedFields.dataStep.detailedTimeline.isOneDimension'),
          uuid: this.get('unmanagedFields.dataStep.detailedTimeline.uuid')
        }
      },
      renderStep: {
        timeline: {
          xTicks: this.get('unmanagedFields.renderStep.timeline.xTicks'),
          yTicks: this.get('unmanagedFields.renderStep.timeline.yTicks'),
          xLabels: this.get('unmanagedFields.renderStep.timeline.xLabels'),
          yLabels: this.get('unmanagedFields.renderStep.timeline.yLabels'),
          xUnit: this.get('unmanagedFields.renderStep.timeline.xUnit'),
          yUnit: this.get('unmanagedFields.renderStep.timeline.yUnit'),
          chartXLabel: this.get('unmanagedFields.renderStep.timeline.chartXLabel'),
          customizedCssClass: this.get('unmanagedFields.renderStep.timeline.customizedCssClass'),
          chartHeight: this.get('unmanagedFields.renderStep.timeline.chartHeight'),
          brushHandlesHeightWeight: this.get('unmanagedFields.renderStep.timeline.brushHandlesHeightWeight'),
          isHistogramSelectable: this.get('unmanagedFields.renderStep.timeline.isHistogramSelectable'),
          chartWidth: this.get('unmanagedFields.renderStep.timeline.chartWidth'),
          xAxisPosition: this.get('unmanagedFields.renderStep.timeline.xAxisPosition'),
          yAxisStartsFromZero: this.get('unmanagedFields.renderStep.timeline.yAxisStartsFromZero'),
          descriptionPosition: this.get('unmanagedFields.renderStep.timeline.descriptionPosition'),
          showXTicks: this.get('unmanagedFields.renderStep.timeline.showXTicks'),
          showYTicks: this.get('unmanagedFields.renderStep.timeline.showYTicks'),
          showXLabels: this.get('unmanagedFields.renderStep.timeline.showXLabels'),
          showYLabels: this.get('unmanagedFields.renderStep.timeline.showYLabels'),
          shortYLabels: this.get('unmanagedFields.renderStep.timeline.shortYLabels'),
          showHorizontalLines: this.get('unmanagedFields.renderStep.timeline.showHorizontalLines'),
          isSmoothedCurve: this.get('unmanagedFields.renderStep.timeline.isSmoothedCurve'),
          barWeight: this.get('unmanagedFields.renderStep.timeline.barWeight'),
          topOffsetRemoveInterval: this.get('unmanagedFields.renderStep.timeline.topOffsetRemoveInterval'),
        },
        detailedTimeline: {
          xTicks: this.get('unmanagedFields.renderStep.detailedTimeline.xTicks'),
          yTicks: this.get('unmanagedFields.renderStep.detailedTimeline.yTicks'),
          xLabels: this.get('unmanagedFields.renderStep.detailedTimeline.xLabels'),
          yLabels: this.get('unmanagedFields.renderStep.detailedTimeline.yLabels'),
          xUnit: this.get('unmanagedFields.renderStep.detailedTimeline.xUnit'),
          yUnit: this.get('unmanagedFields.renderStep.detailedTimeline.yUnit'),
          chartXLabel: this.get('unmanagedFields.renderStep.detailedTimeline.chartXLabel'),
          customizedCssClass: this.get('unmanagedFields.renderStep.detailedTimeline.customizedCssClass'),
          chartHeight: this.get('unmanagedFields.renderStep.detailedTimeline.chartHeight'),
          multiselectable: this.get('unmanagedFields.renderStep.detailedTimeline.multiselectable'),
          brushHandlesHeightWeight: this.get('unmanagedFields.renderStep.detailedTimeline.brushHandlesHeightWeight'),
          isHistogramSelectable: this.get('unmanagedFields.renderStep.detailedTimeline.isHistogramSelectable'),
          chartWidth: this.get('unmanagedFields.renderStep.detailedTimeline.chartWidth'),
          xAxisPosition: this.get('unmanagedFields.renderStep.detailedTimeline.xAxisPosition'),
          yAxisStartsFromZero: this.get('unmanagedFields.renderStep.detailedTimeline.yAxisStartsFromZero'),
          descriptionPosition: this.get('unmanagedFields.renderStep.detailedTimeline.descriptionPosition'),
          showXTicks: this.get('unmanagedFields.renderStep.detailedTimeline.showXTicks'),
          showYTicks: this.get('unmanagedFields.renderStep.detailedTimeline.showYTicks'),
          showXLabels: this.get('unmanagedFields.renderStep.detailedTimeline.showXLabels'),
          showYLabels: this.get('unmanagedFields.renderStep.detailedTimeline.showYLabels'),
          shortYLabels: this.get('unmanagedFields.renderStep.detailedTimeline.shortYLabels'),
          showHorizontalLines: this.get('unmanagedFields.renderStep.detailedTimeline.showHorizontalLines'),
          isSmoothedCurve: this.get('unmanagedFields.renderStep.detailedTimeline.isSmoothedCurve'),
          barWeight: this.get('unmanagedFields.renderStep.detailedTimeline.barWeight'),
        }
      }
    }
  };

  public customGroups = {
    tabsContainer: this.get('tabsContainer') as ConfigFormGroup,
    dataStep: this.get('tabsContainer.dataStep') as ConfigFormGroup,
    dataStepTimeline: this.get('tabsContainer.dataStep.timeline') as ConfigFormGroup,
    dataStepDetailedTimeline: this.get('tabsContainer.dataStep.detailedTimeline') as ConfigFormGroup,
    renderStep: this.get('tabsContainer.renderStep') as ConfigFormGroup,
    renderStepTimeline: this.get('tabsContainer.renderStep.timeline') as ConfigFormGroup,
    renderStepDetailedTimeline: this.get('tabsContainer.renderStep.detailedTimeline') as ConfigFormGroup,
  };
}

@Injectable({
  providedIn: 'root'
})
export class TimelineGlobalFormBuilderService {

  public constructor(
    private defaultValuesService: DefaultValuesService,
    private bucketsIntervalBuilderService: BucketsIntervalFormBuilderService,
    private collectionService: CollectionService,
    private mainFormService: MainFormService,
    private colorService: ArlasColorService,
    private startupService: StartupService,
    private settingsService: ArlasSettingsService,

  ) { }

  public build(collection: string) {
    const timelineBucketIntervalFg = this.bucketsIntervalBuilderService.build(collection, BUCKET_TYPE.TEMPORAL);
    const timelineFormGroup = new TimelineGlobalFormGroup(
      collection, this.collectionService, this.startupService, this.mainFormService, this.settingsService,
      timelineBucketIntervalFg, this.colorService
    );
    this.defaultValuesService.setDefaultValueRecursively(
      'timeline.global',
      timelineFormGroup);

    return timelineFormGroup;
  }
}
