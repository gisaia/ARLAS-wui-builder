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
import {ResultlistDetailFormGroup} from '@analytics-config/services/resultlist-form-builder/form-group';
import {isNumberOperator} from '@analytics-config/services/resultlist-form-builder/models';
import {
    ResultlistConfigForm,
    ResultlistFormBuilderService,
    ResultListVisualisationsDataGroup,
    ResultListVisualisationsDataGroupCondition,
    ResultListVisualisationsFormGroup
} from '@analytics-config/services/resultlist-form-builder/resultlist-form-builder.service';
import {buildDetailField} from '@analytics-config/services/resultlist-form-builder/utils';
import {AbstractControl, FormArray} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {marker} from '@colsen1991/ngx-translate-extract-marker';
import {TranslateService} from '@ngx-translate/core';
import {Expression} from 'arlas-api';
import {ArlasColorService} from 'arlas-web-components';
import {firstValueFrom} from 'rxjs';
import {CollectionService} from '../services/collection-service/collection.service';
import {NUMERIC_TYPES} from '../services/collection-service/tools';
import {
    AnalyticComponentResultListInputConfig,
    ContributorConfig,
    DataGroupInputConfig
} from '../services/main-form-manager/models-config';
import {ImportElement, importElements} from '../services/main-form-manager/tools';
import {
    ButtonToggleFormControl,
    ConfigFormGroup, FieldTemplateControl,
    HiddenFormControl,
    SelectFormControl,
    SlideToggleFormControl,
    TextareaFormControl
} from '@shared-models/config-form';

interface ResultListConfigFeederOptions {
    widgetData: ResultlistConfigForm;
    contributor: ContributorConfig;
    input: AnalyticComponentResultListInputConfig;
}

interface DataStep {
    collection: SelectFormControl;
    defaultMode: ButtonToggleFormControl;
    columns: FormArray;
    grid: {
        aHasGridView: SlideToggleFormControl;
        aTitle: {
            titleLabelField: SelectFormControl;
            titleLabelFieldProcess: TextareaFormControl;
        };
        bTooltip: {
            tooltipField: SelectFormControl;
            tooltipFieldProcess: TextareaFormControl;
        };
        color: {
            colorIdentifier: SelectFormControl;
        };
    };
    detailsTitle: HiddenFormControl;
    details: FormArray;
    idFieldName: HiddenFormControl;
}

interface VisualisationStep {
    visualisationsList: FormArray<any>;
    thumbnailAndQuicklook: {
        useHttpThumbnails: SlideToggleFormControl;
        useHttpQuicklooks: SlideToggleFormControl;
        thumbnailUrl: FieldTemplateControl;
        quicklookUrls: FormArray;
    };
    visualisations: ConfigFormGroup;
};

export class ResultListInputsFeeder {
    public readonly MIN_SEARCH_SIZE = 50;
    protected dataStep: DataStep;
    protected settingsStep: any;
    protected sactionStep: any;
    protected visualisationStep: VisualisationStep;
    protected customControls: any;

    public constructor(protected options: ResultListConfigFeederOptions, protected messageService?: MatSnackBar,
                       protected translate?: TranslateService) {
        this.dataStep = options.widgetData.customControls.dataStep;
        this.settingsStep = options.widgetData.customControls.settingsStep;
        this.sactionStep = options.widgetData.customControls.sactionStep;
        this.visualisationStep = options.widgetData.customControls.visualisationStep;
        this.customControls = options.widgetData.customControls;
    }

    public import<T>(value: T, control: AbstractControl) {
        if (value !== null) {
            control.setValue(value);
        }
        return this;
    }

    public imports(elements: Array<ImportElement>) {
        importElements(elements);
        return this;
    }

    public importTitle() {
        this.import(this.options.contributor.name, this.options.widgetData.customControls.title);
        return this;
    }

    public importActionsSteps() {
        return this.imports([
            {
                value: this.options.input.downloadLink,
                control: this.sactionStep.downloadLink
            }
        ]);
    }


    public importSettingsSteps() {
        return this.imports([
            {
                value: this.options.contributor.search_size >= this.MIN_SEARCH_SIZE ? this.options.contributor.search_size : this.MIN_SEARCH_SIZE,
                control: this.settingsStep.searchSize
            },
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

    public importGridFromDataTabs() {
        const titleFieldNames = this.options.contributor.fieldsConfiguration.titleFieldNames;
        const tooltipFieldNames = this.options.contributor.fieldsConfiguration.tooltipFieldNames;
        return this.imports([
            {
                value: !!titleFieldNames && titleFieldNames.length > 0 ? titleFieldNames[0].fieldPath : '',
                control: this.dataStep.grid.aTitle.titleLabelField
            },
            {
                value: !!titleFieldNames && titleFieldNames.length > 0 ? titleFieldNames[0].process : '',
                control: this.dataStep.grid.aTitle.titleLabelFieldProcess
            },
            {
                value: !!tooltipFieldNames && tooltipFieldNames.length > 0 ? tooltipFieldNames[0].fieldPath : '',
                control: this.dataStep.grid.bTooltip.tooltipField
            },
            {
                value: !!tooltipFieldNames && tooltipFieldNames.length > 0 ? tooltipFieldNames[0].process : '',
                control: this.dataStep.grid.bTooltip.tooltipFieldProcess
            },
            {
                value: this.options.contributor.fieldsConfiguration.iconColorFieldName,
                control: this.dataStep.grid.color.colorIdentifier
            }
        ]);
    }

    public importDataSteps() {
        return this.imports([
            {
                value: this.options.contributor.collection,
                control: this.dataStep.collection
            },
            {
                value: this.options.contributor.fieldsConfiguration.idFieldName,
                control: this.dataStep.idFieldName
            },
            { // Order matter. Should be init before default mode
                value: this.options.input.hasGridView || /** retro compatibility code **/ ((this.options.input as any)?.defautMode === 'grid'),
                control: this.dataStep.grid.aHasGridView
            },
            {
                value: this.options.input?.defaultMode ?? (this.options.input as any)?.defautMode, // Backward compat du to typo error
                control: this.dataStep.defaultMode
            }
        ]);
    }

    // not present in analytics config that is why it is separate
    public importIcons() {
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

    public importVisualisationStep(resultListFormBuilder: ResultlistFormBuilderService) {

        this.imports([
            {
                value: this.options.contributor.fieldsConfiguration.urlThumbnailTemplate ?? '',
                control: this.visualisationStep.thumbnailAndQuicklook.thumbnailUrl
            },
            {
                value: this.options.contributor.fieldsConfiguration.useHttpThumbnails,
                control: this.visualisationStep.thumbnailAndQuicklook.useHttpThumbnails
            },
            {
                value: this.options.contributor.fieldsConfiguration.useHttpQuicklooks,
                control: this.visualisationStep.thumbnailAndQuicklook.useHttpQuicklooks
            }
        ]);

        if (this.options.input.visualisationsList && this.options.input.visualisationsList.length > 0) {
            this.options.input.visualisationsList.forEach(visualisation => {
                const visualisationForm = new ResultListVisualisationsFormGroup();
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

                if (visualisation?.dataGroups && visualisation.dataGroups.length > 0) {
                    visualisation?.dataGroups.forEach(async dataGroupConf => {
                        const dataGroupForm = new ResultListVisualisationsDataGroup();
                        this.imports([
                            {
                                value: dataGroupConf.visualisationUrl,
                                control: dataGroupForm.customControls.visualisationUrl
                            },
                            {
                                value: dataGroupConf.name,
                                control: dataGroupForm.customControls.name
                            },
                            {
                                value: dataGroupConf.protocol,
                                control: dataGroupForm.customControls.protocol
                            },
                        ]);
                        const conditionForm = this.importDataGroupFilters(dataGroupConf, resultListFormBuilder);
                        dataGroupForm.setControl('filters', conditionForm);
                        dataGroupForm.customControls.filters =
                            dataGroupForm.get('filters') as FormArray<ResultListVisualisationsDataGroupCondition>;
                        visualisationForm.customControls.dataGroups.push(dataGroupForm);
                    });
                }
                this.visualisationStep.visualisationsList.push(visualisationForm);
            });
        }

        // interop code to migrate.
        const interopVisualisationForm = this.interopCode();
        if (interopVisualisationForm) {
            this.visualisationStep.visualisationsList.push(interopVisualisationForm);
        }
        return this;
    }

    public importResultListQuickLook(resultListFormBuilder: ResultlistFormBuilderService,
                                     colorService: ArlasColorService, collectionService: CollectionService) {
        if (this.options.contributor.fieldsConfiguration.urlImageTemplate) {
            const quicklook = resultListFormBuilder.buildQuicklook(this.options.contributor.collection);
            this.import(this.options.contributor.fieldsConfiguration.urlImageTemplate, quicklook.customControls.url);
            this.visualisationStep.thumbnailAndQuicklook.quicklookUrls.push(quicklook);
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
                    v => ({value: v, label: v, color: colorService.getColor(v)}));

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
                        quicklook.customControls.filter.values.setSyncOptions(keywords.map(k => ({
                            value: k,
                            label: k
                        })));
                    });
            }
            this.options.widgetData.customControls.visualisationStep.thumbnailAndQuicklook.quicklookUrls.push(quicklook);
        });
        return this;
    }

    public importResultListContributorDetail(collectionService: CollectionService) {
        (this.options.contributor.details || [])
            .sort((d1, d2) => d1.order - d2.order)
            .forEach(d => {

                const detail = new ResultlistDetailFormGroup();
                importElements([
                    {
                        value: d.name,
                        control: detail.customControls.name
                    }
                ]);

                d.fields.forEach(f => {
                    const field = buildDetailField(collectionService, this.options.contributor.collection);
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
                this.dataStep.details.push(detail);
            });
        return this;
    }

    public importContributorColumns(resultlistFormBuilder) {
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

    public importUnmanagedFields() {
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
            }
        ]);
    }

    protected importDataGroupFilters(
        dataGroupConf: DataGroupInputConfig,
        resultListFormBuilder: ResultlistFormBuilderService) {
        const formArray = new FormArray([]);
        if (dataGroupConf.filters && dataGroupConf.filters.length > 0) {
            dataGroupConf.filters.forEach(async (condition, i) => {
                // operator arrive here in First letter upper case. We have to transform them to lowercase to match
                // Exp Openum. We ensure consistency by converting the result in lowerCase
                const op = (Expression.OpEnum[(condition.op as string)].toLowerCase()) as Expression.OpEnum;
                const conditionForm = resultListFormBuilder
                    .buildVisualisationsDataGroupCriteria(this.options.contributor.collection);
                const fields = await firstValueFrom(conditionForm.collectionFields);
                const field = fields.find(file => file.name === condition.field);
                this.imports([
                    {
                        value: {value: condition.field, type: field.type},
                        control: conditionForm.customControls.filterField
                    },
                    {
                        value: op,
                        control: conditionForm.customControls.filterOperation
                    }
                ]);
                conditionForm.syncEditState();
                if (op === Expression.OpEnum.Like) {
                    const filterInValues = (condition.value as string[]);
                    this.imports([
                        {
                            value: filterInValues?.map(v => ({value: v})),
                            control: conditionForm.customControls.filterValues.filterInValues
                        }
                    ]);
                    conditionForm.customControls.filterValues.filterInValues.selectedMultipleItems = filterInValues.map(v => ({value: v}));
                    conditionForm.customControls.filterValues.filterInValues.savedItems = new Set(filterInValues);
                    conditionForm.customControls.filterValues.filterEqualValues.disable();
                } else if (isNumberOperator(op) &&
                    NUMERIC_TYPES.includes(condition.type as any)) {
                    this.imports([
                        {
                            value: +condition.value,
                            control: conditionForm.customControls.filterValues.filterEqualValues
                        }
                    ]);
                } else if (op === Expression.OpEnum.Range) {
                    const min = +(condition.value as string).split(';')[0];
                    const max = +(condition.value as string).split(';')[1];
                    this.imports([
                        {
                            value: min,
                            control: conditionForm.customControls.filterValues.filterMinRangeValues
                        },
                        {
                            value: max,
                            control: conditionForm.customControls.filterValues.filterMaxRangeValues
                        }
                    ]);
                } else if (op === Expression.OpEnum.Eq) {
                    this.imports([
                        {
                            value: condition.value,
                            control: conditionForm.customControls.filterValues.filterBoolean
                        }
                    ]);
                }
                formArray.push(conditionForm);
            });
        }
        return formArray;
    }

    /**
     * Methode to transform a visualisation link into a data group
     * @private
     */
    private interopCode() {
        if (this.options.input.visualisationLink) {
            const visualisationForm = new ResultListVisualisationsFormGroup();
            visualisationForm.customControls.name.setValue(this.translate?.instant('Visualisation Link'));
            const dataGroupForm = new ResultListVisualisationsDataGroup();
            this.imports([
                {
                    value: this.options.input.visualisationLink,
                    control: dataGroupForm.customControls.visualisationUrl
                }
            ]);
            dataGroupForm.customControls.name.setValue(this.translate?.instant('Visualisation Link'));
            dataGroupForm.customControls.protocol.setValue('other');
            visualisationForm.customControls.dataGroups.push(dataGroupForm);

            const key = marker('Your visualisation link config has been moved');
            if (this.messageService) {
                this.messageService.open(this.translate?.instant(key) ?? key, null, {duration: 7000});
            }
            return visualisationForm;
        }
        return null;
    }
}


export class AnalyticsResultListInputsFeeder extends ResultListInputsFeeder {
    public importDataSteps() {
        return this.imports([{
            value: this.options.contributor.collection,
            control: this.dataStep.collection
        },
            {
                value: this.options.contributor.search_size,
                control: this.settingsStep.searchSize
            },
            {
                value: this.options.contributor.fieldsConfiguration.idFieldName,
                control: this.dataStep.idFieldName
            }]);
    }

    public importGridStep() {
        return this.imports([
            {
                value: this.options.input?.defaultMode ?? (this.options.input as any)?.defautMode, // Backward compat due to typo error,
                control: this.dataStep.defaultMode
            },
            {
                value: this.options.contributor.fieldsConfiguration.iconColorFieldName,
                control: this.dataStep.grid.color.colorIdentifier
            },
        ]);
    }

    public importContributorColumns(resultlistFormBuilder) {
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
