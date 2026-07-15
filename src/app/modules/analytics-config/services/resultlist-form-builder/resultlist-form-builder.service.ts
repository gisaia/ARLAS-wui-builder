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
    EditResultlistQuicklookComponent
} from '@analytics-config/components/edit-resultlist-quicklook/edit-resultlist-quicklook.component';
import {
    ResultListVisualisationComponent
} from '@analytics-config/components/edit-resultlist-visualisation/result-list-visualisation.component';
import { ResultlistDataComponent } from '@analytics-config/components/resultlist-data/resultlist-data.component';
import { Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { marker } from '@colsen1991/ngx-translate-extract-marker';
import { DialogColorTableComponent } from '@map-config/components/dialog-color-table/dialog-color-table.component';
import { DialogColorTableData, KeywordColor } from '@map-config/components/dialog-color-table/models';
import { CollectionService } from '@services/collection-service/collection.service';
import { CollectionField } from '@services/collection-service/models';
import {
    NUMERIC_OR_DATE_OR_KEYWORD,
    NUMERIC_OR_DATE_OR_TEXT_TYPES,
    TEXT_OR_KEYWORD,
    toNumericOrDateOrKeywordOrTextObs,
    toNumericOrKeywordOrBooleanObs,
    toOptionsObs
} from '@services/collection-service/tools';
import { DefaultConfig, DefaultValuesService } from '@services/default-values/default-values.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { ConfigFormGroupComponent } from '@shared-components/config-form-group/config-form-group.component';
import { CollectionConfigFormGroup } from '@shared-models/collection-config-form';
import {
    ButtonFormControl,
    ButtonToggleFormControl,
    ComponentFormControl,
    ConfigFormControl,
    ConfigFormGroup,
    FieldTemplateControl,
    HiddenConfigFromGroup,
    HiddenFormControl,
    InputFormControl,
    MultipleSelectFormControl,
    SelectFormControl,
    SelectOption,
    SliderFormControl,
    SlideToggleFormControl,
    TextareaFormControl,
    TitleInputFormControl,
    TypedSelectFormControl
} from '@shared-models/config-form';
import { GeoFilterInputsBuilder } from '@shared-models/filter-input-builder';
import { WidgetConfigFormGroup } from '@shared-models/widget-config-form';
import { Expression } from 'arlas-api';
import { ArlasColorService } from 'arlas-web-components';
import { ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';
import { Observable } from 'rxjs';
import { WidgetFormBuilder } from '../widget-form-builder';
import { ResultListCardLineFormGroup, ResultlistDataConfigForm, ResultlistDetailFormGroup } from './form-group';
import {
    buildCardViewProperties, buildDetailField, CellBackgroundEnum, ResultListDefaultMode, resultModeDefaultList
} from './utils';

export class ResultlistConfigForm extends WidgetConfigFormGroup {
    public tabsOrder: string[] = ['dataStep', 'visualisationStep', 'sactionStep', 'settingsStep'];
    public customGroups = {
        dataStep: this.get('dataStep') as ResultlistDataConfigForm,
        sactionStep: this.get('sactionStep') as ConfigFormGroup,
        settingsStep: this.get('settingsStep') as ConfigFormGroup,
        visualisationStep: this.get('visualisationStep') as ConfigFormGroup
    };
    public customControls = {
        title: this.get('title') as TitleInputFormControl,
        icon: this.get('icon') as HiddenFormControl,
        showName: this.get('showName') as HiddenFormControl,
        showIcon: this.get('showIcon') as HiddenFormControl,
        dataStep: {
            collection: this.get('dataStep.collection') as SelectFormControl,
            defaultMode: this.get('dataStep.defaultMode') as ButtonToggleFormControl,
            columns: this.get('dataStep.columns') as FormArray,
            grid: {
                aHasGridView: this.get('dataStep.grid.aHasGridView') as SlideToggleFormControl,
                aTitle: {
                    titleLabelField: this.get('dataStep.grid.aTitle.titleLabelField') as SelectFormControl,
                    titleLabelFieldProcess: this.get('dataStep.grid.aTitle.titleLabelFieldProcess') as TextareaFormControl,
                },
                bTooltip:{
                    tooltipField: this.get('dataStep.grid.bTooltip.tooltipField') as SelectFormControl,
                    tooltipFieldProcess: this.get('dataStep.grid.bTooltip.tooltipFieldProcess') as TextareaFormControl,
                },
                color: {
                    colorIdentifier: this.get('dataStep.grid.color.colorIdentifier') as SelectFormControl
                }
            },
            cardViewProperties: this.get('dataStep.cardViewProperties') as FormArray,
            detailsTitle: this.get('dataStep.detailsTitle') as HiddenFormControl,
            details: this.get('dataStep.details') as FormArray,
            idFieldName: this.get('dataStep.idFieldName') as HiddenFormControl,
        },
        sactionStep: {
            visualisationLink: this.get('sactionStep.visualisationLink') as InputFormControl,
            downloadLink: this.get('sactionStep.downloadLink') as InputFormControl,
        },
        settingsStep: {
            searchSize: this.get('settingsStep.searchSize') as SliderFormControl,
            displayFilters: this.get('settingsStep.displayFilters') as SlideToggleFormControl,
            isGeoSortActived: this.get('settingsStep.isGeoSortActived') as SlideToggleFormControl,
            cellBackgroundStyle: this.get('settingsStep.cellBackgroundStyle') as SelectFormControl
        },
        visualisationStep: {
            visualisationsList: this.get('visualisationStep.visualisationsList') as FormArray,
            thumbnailAndQuicklook: {
                useHttpThumbnails: this.get('visualisationStep.thumbnailAndQuicklook.useHttpThumbnails') as SlideToggleFormControl,
                useHttpQuicklooks: this.get('visualisationStep.thumbnailAndQuicklook.useHttpQuicklooks') as SlideToggleFormControl,
                thumbnailUrl: this.get('visualisationStep.thumbnailAndQuicklook.thumbnailUrl') as FieldTemplateControl,
                quicklookUrls: this.get('visualisationStep.thumbnailAndQuicklook.quicklookUrls') as FormArray,
            },
            visualisations: this.get('visualisationStep.visualisations') as ConfigFormGroup,
        },
        unmanagedFields: {
            dataStep: {},
            renderStep: {
                tableWidth: this.get('unmanagedFields.renderStep.tableWidth'),
                globalActionsList: this.get('unmanagedFields.renderStep.globalActionsList'),
                nLastLines: this.get('unmanagedFields.renderStep.nLastLines'),
                detailedGridHeight: this.get('unmanagedFields.renderStep.detailedGridHeight'),
                nbGridColumns: this.get('unmanagedFields.renderStep.nbGridColumns'),
                isBodyHidden: this.get('unmanagedFields.renderStep.isBodyHidden'),
                isAutoGeoSortActived: this.get('unmanagedFields.renderStep.isAutoGeoSortActived'),
                selectedItemsEvent: this.get('unmanagedFields.renderStep.selectedItemsEvent'),
                consultedItemEvent: this.get('unmanagedFields.renderStep.consultedItemEvent'),
                actionOnItemEvent: this.get('unmanagedFields.renderStep.actionOnItemEvent'),
                globalActionEvent: this.get('unmanagedFields.renderStep.globalActionEvent')
            },
            sactionStep: {}
        }
    };

    public constructor(
        collection: string,
        collectionService: CollectionService,
        title?: string,
        options?: any
    ) {
        super(
            collection,
            {
                title: new InputFormControl(
                    !!title ? title : '',
                    marker('resultlist title'),
                    marker('resultlist title description'),
                    undefined,
                    {
                        childs: () => [this.customControls.dataStep.idFieldName]
                    }
                ),
                icon: new HiddenFormControl(
                    !!options && !!options.icon ? options.icon : 'short_text',
                    ''
                ),
                showName: new HiddenFormControl(
                    !!options && !!options.showName ? options.showName : true
                ),
                showIcon: new HiddenFormControl(
                    !!options && !!options.showIcon ? options.showIcon : true
                ),
                dataStep: new ConfigFormGroup({
                    collection: new SelectFormControl(
                        collection,
                        marker('Collection'),
                        marker('Resultlist collection description'),
                        false,
                        [],
                        {
                            optional: false,
                            resetDependantsOnChange: true,
                            isCollectionSelect: true
                        },
                        collectionService.getGroupCollectionItems()
                    ),
                    defaultMode: new ButtonToggleFormControl(
                        '',
                        resultModeDefaultList.map(o => ({...o})),
                        marker('List default mode description'),
                        {
                            resetDependantsOnChange: true,
                            dependsOn: () => [this.customControls.dataStep.grid.aHasGridView,
                                this.customControls.dataStep.cardViewProperties as any],
                            onDependencyChange: (control: ButtonToggleFormControl) => {
                                // if value was grid and grid is disabled set value to false
                                if(!this.customControls.dataStep.grid.aHasGridView.value) {
                                    this.customControls.dataStep.defaultMode.disableOption(ResultListDefaultMode.grid);
                                    if(this.customControls.dataStep.defaultMode.value === ResultListDefaultMode.grid){
                                        this.customControls.dataStep.defaultMode.setValue(ResultListDefaultMode.list);
                                    }
                                } else {
                                    this.customControls.dataStep.defaultMode.enableOption(ResultListDefaultMode.grid);
                                }

                                if(this.customControls.dataStep.cardViewProperties.length === 0){
                                    this.customControls.dataStep.defaultMode.disableOption(ResultListDefaultMode.card);
                                    if(this.customControls.dataStep.defaultMode.value === ResultListDefaultMode.card){
                                        this.customControls.dataStep.defaultMode.setValue(ResultListDefaultMode.list);
                                    }
                                } else {
                                    this.customControls.dataStep.defaultMode.enableOption(ResultListDefaultMode.card);
                                }
                            }
                        }),
                    columns: (new FormArray([], {
                        validators: Validators.required,
                    })),
                    grid: new HiddenConfigFromGroup({
                        aHasGridView: new SlideToggleFormControl(
                            false,
                            marker('Enable grid view'),
                            marker('Enable grid view description')
                        ),
                        aTitle: new ConfigFormGroup({

                            titleLabelField: new SelectFormControl(
                                '',
                                marker('Tile label'),
                                marker('Tile label description'),
                                true,
                                toOptionsObs(collectionService.getCollectionFields(collection, NUMERIC_OR_DATE_OR_TEXT_TYPES)),
                                {
                                    optional: true,
                                    dependsOn: () => [this.customControls.dataStep.collection],
                                    onDependencyChange: (control: SelectFormControl) => {
                                        if (!this.collection || this.customControls.dataStep.collection.dirty) {
                                            this.updateSelectFormControl(collectionService, control);
                                        }
                                    }
                                }
                            ),
                            titleLabelFieldProcess: new TextareaFormControl(
                                '',
                                marker('Transformation title'),
                                marker('Transformation title description'),
                                '',
                                1,
                                {
                                    optional: true,
                                    validators: [TextareaFormControl.processValidator('result')],
                                    dependsOn: () => [this.customControls.dataStep.collection],
                                    onDependencyChange: (control: TextareaFormControl) => {
                                        if (!this.collection || this.customControls.dataStep.collection.dirty) {
                                            control.setValue('');
                                        }
                                    }
                                }
                            ),
                        })
                            .withTitle(marker('Title configuration')),
                        bTooltip: new ConfigFormGroup({
                            tooltipField: new SelectFormControl(
                                '',
                                marker('Tooltip field'),
                                marker('Tooltip field description'),
                                true,
                                toOptionsObs(collectionService.getCollectionFields(collection, NUMERIC_OR_DATE_OR_TEXT_TYPES)),
                                {
                                    optional: true,
                                    dependsOn: () => [this.customControls.dataStep.collection],
                                    onDependencyChange: (control: SelectFormControl) => {
                                        if (!this.collection || this.customControls.dataStep.collection.dirty) {
                                            this.updateSelectFormControl(collectionService, control);
                                        }
                                    }
                                }
                            ),
                            tooltipFieldProcess: new TextareaFormControl(
                                '',
                                marker('Transformation tooltip'),
                                marker('Transformation tooltip description'),
                                '',
                                1,
                                {
                                    optional: true,
                                    validators: [TextareaFormControl.processValidator('result')],
                                    dependsOn: () => [this.customControls.dataStep.collection],
                                    onDependencyChange: (control: TextareaFormControl) => {
                                        if (!this.collection || this.customControls.dataStep.collection.dirty) {
                                            control.setValue('');
                                        }
                                    }
                                }
                            )
                        }).withTitle(marker('Tooltip configuration')),
                        color: new ConfigFormGroup({
                            colorIdentifier: new SelectFormControl(
                                '',
                                marker('Color identifier'),
                                marker('Color identifier description'),
                                true,
                                toOptionsObs(collectionService.getCollectionFields(collection, TEXT_OR_KEYWORD)),
                                {
                                    optional: true,
                                    dependsOn: () => [this.customControls.dataStep.collection],
                                    onDependencyChange: (control: SelectFormControl) => {
                                        if (!this.collection || this.customControls.dataStep.collection.dirty) {
                                            this.updateSelectFormControl(collectionService, control);
                                        }
                                    }
                                }
                            ),
                        }).withTitle(marker('Color configuration')),
                    }),
                    details: new FormArray([]),
                    cardViewProperties: new FormArray([]),

                    detailsTitle: new HiddenFormControl(
                        '',
                        undefined,
                        {
                            optional: true
                        }
                    ),
                    idFieldName: new HiddenFormControl(
                        '',
                        undefined,
                        {
                            dependsOn: () => [this.customControls.dataStep.collection],
                            onDependencyChange: (control) => {
                                this.setCollection(this.customControls.dataStep.collection.value);
                                collectionService.getDescribe(this.collection).subscribe(d => {
                                    control.setValue(d.params.id_path);
                                });
                            }
                        }
                    ),
                    customComponent: new ComponentFormControl(
                        ResultlistDataComponent,
                        {
                            control: () => this.customGroups.dataStep,
                        }
                    )
                }).withTabName(marker('Views')),
                sactionStep: new ConfigFormGroup({
                    downloadLink: new InputFormControl(
                        '',
                        marker('Download url service title'),
                        marker('Download url service description'),
                        'text',
                        {
                            optional: true,
                            dependsOn: () => [this.customControls.dataStep.collection]
                        }
                    )
                }).withTabName(marker('Actions')),
                settingsStep: new ConfigFormGroup({
                    searchSize: new SliderFormControl(
                        '',
                        marker('Pagination size'),
                        marker('Pagination size description'),
                        50,
                        500,
                        10
                    ),
                    displayFilters: new SlideToggleFormControl(
                        false,
                        marker('Display filters'),
                        marker('Display filters description')
                    ),
                    isGeoSortActived: new SlideToggleFormControl(
                        false,
                        marker('Activate geosort'),
                        marker('Activate geosort')
                    ),
                    cellBackgroundStyle: new SelectFormControl(
                        CellBackgroundEnum.filled,
                        marker('Background style of cells'),
                        marker('Background style of cells Description'),
                        false,
                        [
                            {label: marker('Filled'), value: CellBackgroundEnum.filled},
                            {label: marker('Outlined'), value: CellBackgroundEnum.outlined},
                        ],
                        {
                            optional: true,
                            dependsOn: () => [
                                this.customControls.dataStep.columns as any
                            ],
                            onDependencyChange: (control: ButtonFormControl) => {
                                const useColorService = this.customControls.dataStep.columns.controls
                                    .filter(c => c.get('useColorService').value === true).length > 0;
                                control.enableIf(useColorService);
                            }
                        }
                    ),
                }).withTabName(marker('Resultlist settings')),
                visualisationStep: new ConfigFormGroup({
                    visualisationsList: new FormArray([]),
                    thumbnailAndQuicklook: new ConfigFormGroup({
                        useHttpThumbnails: new SlideToggleFormControl(
                            false,
                            marker('Use http thumbnails'),
                            marker('Use http thumbnails description')
                        ),
                        useHttpQuicklooks: new SlideToggleFormControl(
                            false,
                            marker('Use http quicklooks'),
                            marker('Use http quicklooks description')
                        ),
                        thumbnailUrl: new FieldTemplateControl(
                            '',
                            marker('Thumbnail url'),
                            marker('Thumbnail url description'),
                            collectionService.getCollectionFields(collection),
                            false,
                            {
                                optional: true,
                                dependsOn: () => [this.customControls.dataStep.collection],
                                onDependencyChange: (control: FieldTemplateControl) => {
                                    if (!this.collection || this.customControls.dataStep.collection.dirty) {
                                        this.updateFieldTemplateControl(collectionService, control);
                                    }
                                }
                            }
                        ),
                        quicklookUrls: new FormArray([]),
                        quicklook: new ComponentFormControl(
                            EditResultlistQuicklookComponent,
                            {
                                collectionControl: () => this.customControls.dataStep.collection,
                                control: () => this.customControls.visualisationStep.thumbnailAndQuicklook.quicklookUrls
                            }
                        )
                    }).withTitle(marker('Thumbnail and Quicklook')),
                    visualisations: new ConfigFormGroup({
                        visualisation: new ComponentFormControl(
                            ResultListVisualisationComponent,
                            {
                                collectionControl: () => this.customControls.dataStep.collection,
                                control: () => this.customControls.visualisationStep.visualisationsList
                            }
                        )
                    }).withTitle(marker('Visualisation')),
                }).withTabName(marker('Images')),
                unmanagedFields: new FormGroup({
                    dataStep: new FormGroup({}),
                    renderStep: new FormGroup({
                        tableWidth: new FormControl(),
                        globalActionsList: new FormControl(),
                        nLastLines: new FormControl(),
                        detailedGridHeight: new FormControl(),
                        nbGridColumns: new FormControl(),
                        isBodyHidden: new FormControl(),
                        isAutoGeoSortActived: new FormControl(),
                        selectedItemsEvent: new FormControl(),
                        consultedItemEvent: new FormControl(),
                        actionOnItemEvent: new FormControl(),
                        globalActionEvent: new FormControl()
                    }),
                    sactionStep: new FormGroup({}),
                })
            });
    }

    private updateFieldTemplateControl(collectionService: CollectionService, control: FieldTemplateControl) {
        this.setCollection(this.customControls.dataStep.collection.value);
        toNumericOrDateOrKeywordOrTextObs(collectionService
            .getCollectionFields(this.customControls.dataStep.collection.value))
            .subscribe(collectionFs => {
                control.setValue('');
                control.fields = collectionFs;
                control.filterAutocomplete();
            });
    }

    private updateSelectFormControl(collectionService: CollectionService, control: SelectFormControl): void {
        this.setCollection(this.customControls.dataStep.collection.value);
        toOptionsObs(collectionService
            .getCollectionFields(this.customControls.dataStep.collection.value))
            .subscribe(collectionFs => {
                control.setSyncOptions(collectionFs);
                control.setValue('');
            });
    }
}

export class ResultlistColumnFormGroup extends CollectionConfigFormGroup {

    public customControls = {
        columnName: this.get('columnName') as InputFormControl,
        fieldName: this.get('fieldName') as SelectFormControl,
        dataType: this.get('dataType') as InputFormControl,
        process: this.get('process') as TextareaFormControl,
        useColorService: this.get('useColorService') as SlideToggleFormControl,
        sort: this.get('sort') as HiddenFormControl
    };

    public constructor(
        fieldsObs: Observable<Array<SelectOption>>,
        collection: string,
        private readonly globalKeysToColortrl: FormArray,
        defaultConfig: DefaultConfig,
        dialog: MatDialog,
        collectionService: CollectionService,
        private readonly colorService: ArlasColorService
    ) {
        super(collection,
            {
                columnName: new InputFormControl(
                    '',
                    marker('Column name'),
                    ''
                ),
                fieldName: new SelectFormControl(
                    '',
                    marker('Column field'),
                    '',
                    true,
                    fieldsObs
                ),
                dataType: new InputFormControl(
                    '',
                    marker('Unit of the column'),
                    '',
                    undefined,
                    {
                        optional: true
                    }
                ),
                process: new TextareaFormControl(
                    '',
                    marker('Transformation'),
                    '',
                    '',
                    1,
                    {
                        optional: true,
                        validators: [TextareaFormControl.processValidator('result')],
                    }
                ),
                useColorService: new SlideToggleFormControl(
                    false,
                    marker('Colorize'),
                    '',
                    {
                        optional: true

                    }
                ),
                sort: new HiddenFormControl(
                    '',
                    '',
                    {
                        optional: true

                    }
                ),
                keysToColorsButton: new ButtonFormControl(
                    '',
                    marker('Manage colors'),
                    '',
                    () => collectionService.getTermAggregation(this.collection, this.customControls.fieldName.value)
                        .then((keywords: Array<string>) => {
                            globalKeysToColortrl.clear();
                            keywords.forEach((k: string, index: number) => {
                                this.addToColorManualValuesCtrl({
                                    keyword: k.toString(),
                                    color: this.colorService.getColor(k)
                                }, index);
                            });
                            this.addToColorManualValuesCtrl({
                                keyword: 'OTHER',
                                color: defaultConfig.otherColor
                            });

                            const sub = dialog.open(DialogColorTableComponent, {
                                data: {
                                    collection: this.collection,
                                    sourceField: this.customControls.fieldName.value,
                                    keywordColors: globalKeysToColortrl.value
                                } as DialogColorTableData,
                                autoFocus: false,
                            })
                                .afterClosed().subscribe((result: Array<KeywordColor>) => {
                                    if (result !== undefined) {
                                        result.forEach((kc: KeywordColor) => {
                                            /** after closing the dialog, save the [keyword, color] list in the ARLAS color service */
                                            (colorService.colorGenerator as ArlasColorGeneratorLoader).updateKeywordColor(kc.keyword, kc.color);
                                            this.addToColorManualValuesCtrl(kc);
                                        });
                                    }
                                    sub.unsubscribe();
                                });
                        }),
                    marker('A field is required to manage colors'),
                    {
                        optional: true,
                        dependsOn: () => [
                            this.customControls.useColorService,
                            this.customControls.fieldName,
                        ],
                        onDependencyChange: (control: ButtonFormControl) => {
                            control.enableIf(this.customControls.useColorService.value);
                            control.disabledButton = !this.customControls.fieldName.value;
                        }
                    }),
            });
    }

    private addToColorManualValuesCtrl(kc: KeywordColor, index?: number) {
        if (!Object.values(this.globalKeysToColortrl.controls)
            .find(keywordColorGrp => keywordColorGrp.get('keyword').value === kc.keyword)) {
            const keywordColorGrp = new FormGroup({
                keyword: new FormControl(kc.keyword),
                color: new FormControl(kc.color)
            });
            if (index !== undefined) {
                this.globalKeysToColortrl.insert(index, keywordColorGrp);
            } else {
                this.globalKeysToColortrl.push(keywordColorGrp);
            }
        }
    }
}


export class ResultlistQuicklookFormGroup extends FormGroup {

    public customControls = {
        url: this.get('url') as FieldTemplateControl,
        description: this.get('description') as FieldTemplateControl,
        filter: {
            field: this.get('filter.field') as SelectFormControl,
            values: this.get('filter.values') as MultipleSelectFormControl
        }
    };

    /** TODO:
     * Put filter fields as optional
     * Put filterValues only if filterField is set
     */
    public constructor(fieldsObs: Observable<Array<CollectionField>>, collection: string, collectionService: CollectionService) {
        super({
            url: new FieldTemplateControl(
                '',
                marker('Quicklook url'),
                marker('Quicklook url description'),
                fieldsObs,
                true
            ),
            description: new FieldTemplateControl(
                '',
                marker('Quicklook description'),
                marker('Quicklook description description'),
                fieldsObs,
                true,
                {
                    optional: true
                }
            ),
            filter: new ConfigFormGroup({
                field: new SelectFormControl(
                    '',
                    marker('Quicklook filter field'),
                    marker('Quicklook filter field description'),
                    true,
                    toOptionsObs(fieldsObs),
                    {
                        optional: true
                    }
                ),
                values: new MultipleSelectFormControl(
                    // Mark as invalid if there is a value on filterField and not there
                    '',
                    marker('Quicklook filter values'),
                    marker('Quicklook filter values description'),
                    false,
                    [],
                    {
                        optional: true,
                        dependsOn: () => [this.customControls.filter.field],
                        onDependencyChange: (control: MultipleSelectFormControl) => {
                            if (!this.customControls.filter.field.touched) {
                                // Avoid to reset the imported configuration when first loading it
                            } else if (this.customControls.filter.field.value !== '' && !!this.customControls.filter.field.syncOptions
                                && this.customControls.filter.field.syncOptions.map(f => f.value)
                                    .includes(this.customControls.filter.field.value)) {
                                control.setSyncOptions([]);
                                collectionService.getTermAggregation(
                                    collection,
                                    this.customControls.filter.field.value)
                                    .then(keywords => {
                                        control.setSyncOptions(keywords.map(k => ({value: k, label: k})));
                                    });
                            } else {
                                control.setSyncOptions([]);
                            }
                            control.markAsUntouched();
                        }
                    },
                    false
                )
            })
        });
    }
}


export class ResultListVisualisationsFormGroup extends FormGroup {
    public customControls = {
        name: this.get('name') as InputFormControl,
        description: this.get('description') as TextareaFormControl,
        dataGroups: this.get('dataGroups') as FormArray<ResultListVisualisationsDataGroup>,
        default: this.get('default') as HiddenFormControl
    };

    public constructor(fieldsObs?: Observable<Array<CollectionField>>, collection?: string, collectionService?: CollectionService) {
        super({
            name: new InputFormControl(
                '',
                marker('Visualisation name'),
                '',
            ),
            description: new TextareaFormControl(
                '',
                marker('Visualisation description'),
                '',
                '',
                undefined,
                {
                    optional: true,
                }
            ),
            dataGroups: new FormArray<ResultListVisualisationsDataGroup>([], [Validators.required, Validators.minLength(1)]),
            default: new HiddenFormControl(false)
        });
    }
}

export class ResultListVisualisationsDataGroup extends FormGroup {
    public customControls = {
        name: this.get('name') as InputFormControl,
        protocol: this.get('protocol') as SelectFormControl,
        filters: this.get('filters') as FormArray<ResultListVisualisationsDataGroupCondition>,
        visualisationUrl: this.get('visualisationUrl') as InputFormControl
    };

    public constructor() {
        super({
            name: new InputFormControl(
                '',
                marker('Data group name'),
                ''
            ),
            filters: new FormArray<ResultListVisualisationsDataGroupCondition>([]),
            protocol: new SelectFormControl(
                '',
                marker('Result list protocol'),
                '',
                false,
                [
                    {label: marker('Titiler'), value: 'titiler'},
                    {label: marker('Other'), value: 'other'},
                ],
                {
                    validators: [Validators.required]
                }
            ),
            visualisationUrl: new InputFormControl(
                '',
                marker('View URL'),
                '',
                'text',
                {
                    validators: [Validators.required]
                }
            ),
        });
    }
}


export class ResultListVisualisationsDataGroupCondition extends FormGroup {
    public editing = false;
    public editionInfo: { field: string; op: Expression.OpEnum; };
    public customControls = {
        filterField: this.get('filterField') as TypedSelectFormControl,
        filterOperation: this.get('filterOperation') as SelectFormControl,
        filterValues: {
            filterInValues: this.get('filterValues.filterInValues') as MultipleSelectFormControl,
            filterEqualValues: this.get('filterValues.filterEqualValues') as InputFormControl,
            filterMinRangeValues: this.get('filterValues.filterMinRangeValues') as InputFormControl,
            filterMaxRangeValues: this.get('filterValues.filterMaxRangeValues') as InputFormControl,
            filterBoolean: this.get('filterValues.filterBoolean') as ButtonToggleFormControl,
        },
        id: this.get('id') as HiddenFormControl
    };
    protected filter = new GeoFilterInputsBuilder();

    public constructor(
        public collectionFields: Observable<Array<CollectionField>>,
        filterOperations: Array<Expression.OpEnum>,
        collectionService: CollectionService,
        collection: string) {
        super({
            filterField: new TypedSelectFormControl(
                '',
                marker('Criteria\'s fields'),
                '',
                true,
                toNumericOrKeywordOrBooleanObs(collectionFields),
                {
                    optional: false
                }
            ),
            filterOperation: new SelectFormControl(
                '',
                marker('Filter operation'),
                '',
                false,
                filterOperations.map(op => ({
                    label: op,
                    value: op
                })),
                {
                    resetDependantsOnChange: true,
                    dependsOn: () => [this.customControls.filterField],
                    onDependencyChange: (control: SelectFormControl) => {
                        this.filter.operationFilter(this, control);
                    }
                }
            ),
            filterValues: new ConfigFormGroup({
                operator: new HiddenFormControl(
                    '',
                    null,
                    {
                        optional: true,
                        resetDependantsOnChange: true,
                        dependsOn: () => [this.customControls.filterOperation],
                        onDependencyChange: (control: InputFormControl) => {
                            control.setValue(this.customControls.filterOperation.value);
                        }
                    }
                ),
                filterInValues: new MultipleSelectFormControl(
                    '',
                    marker('Filter-in values'),
                    '',
                    false,
                    [],
                    {
                        resetDependantsOnChange: true,
                        dependsOn: () => [this.customControls.filterField],
                        onDependencyChange: (control: MultipleSelectFormControl) => {
                            this.filter.keywordsFilter(this, control, collectionService, collection);
                        }
                    }
                ),
                filterEqualValues: new InputFormControl(
                    '',
                    marker('Filter-equal values'),
                    '',
                    'number',
                    {
                        resetDependantsOnChange: true,
                        dependsOn: () => [this.customControls.filterOperation, this.customControls.filterField],
                        onDependencyChange: (control: InputFormControl) => {
                            this.filter.numberFilter(this, control);
                        }
                    }
                ),
                filterMinRangeValues: new InputFormControl(
                    '',
                    marker('Minimum range filter'),
                    '',
                    'number',
                    {
                        resetDependantsOnChange: true,
                        dependsOn: () => [
                            this.customControls.filterOperation, this.customControls.filterField
                        ],
                        onDependencyChange: (control, isLoading) => {
                            this.filter.minRangeFilter(this, control, isLoading, collectionService, collection);
                        }
                    },
                    () => this.customControls.filterValues.filterMaxRangeValues,
                    undefined
                ),
                filterMaxRangeValues: new InputFormControl(
                    '',
                    marker('Maximum range filter'),
                    '',
                    'number',
                    {
                        resetDependantsOnChange: true,
                        dependsOn: () => [
                            this.customControls.filterOperation, this.customControls.filterField
                        ],
                        onDependencyChange: (control, isLoading) => {
                            this.filter.maxRangeFilter(this, control, isLoading, collectionService, collection);
                        }
                    },
                    undefined,
                    () => this.customControls.filterValues.filterMinRangeValues
                ),
                filterBoolean: new ButtonToggleFormControl(
                    true,
                    [
                        {
                            label: marker('activated'), value: true
                        },
                        {
                            label: marker('not activated'), value: false
                        }
                    ],
                    undefined,
                    {
                        resetDependantsOnChange: true,
                        dependsOn: () => [this.customControls.filterField],
                        onDependencyChange: (control: ButtonToggleFormControl) => {
                            this.filter.booleanFilter(this, control);
                        }
                    })
            }),
            id: new HiddenFormControl(
                '',
                null,
                {
                    optional: true
                }
            ),
        });
    }

    /**
     *  update edit state to know if we reset or not fields
     */
    public syncEditState() {
        this.editing = !!this.customControls.filterField.value.value && !!this.customControls.filterOperation.value;
        if (this.editing) {
            this.editionInfo = {
                field: this.customControls.filterField.value.value,
                op: this.customControls.filterOperation.value
            };
        } else {
            this.editionInfo = null;
        }
    }
}


@Injectable({
    providedIn: 'root'
})
export class ResultlistFormBuilderService extends WidgetFormBuilder {

    public defaultKey = 'analytics.widgets.resultlist';

    public constructor(
        private readonly collectionService: CollectionService,
        private readonly mainFormService: MainFormService,
        private readonly defaultValuesService: DefaultValuesService,
        private readonly dialog: MatDialog,
        private readonly colorService: ArlasColorService
    ) {
        super();
    }

    public build(collection: string) {
        const formGroup = new ResultlistConfigForm(collection, this.collectionService);
        this.defaultValuesService.setDefaultValueRecursively(this.defaultKey, formGroup);
        return formGroup;
    }

    public buildWithValues(value: any, collection: string) {
        const formGroup = this.build(collection);
        // for each column, the related FormGroup must be created before setting its values
        const columns = (value.dataStep || {}).columns || [];
        columns.forEach(c => formGroup.customControls.dataStep.columns
            .push(this.buildColumn(collection)));

        const cardsProp =  (value.dataStep || {}).cardViewProperties || [];
        cardsProp.forEach( resultListCard => {
            const line = new ResultListCardLineFormGroup();
            resultListCard.line.forEach(_ => line.customControls.fields.push(buildCardViewProperties(this.collectionService, collection)));
            formGroup.customControls.dataStep.cardViewProperties.push(line);
        });

        // same for the details, and the fields within
        const details = (value.dataStep || {}).details || [];
        details.forEach(d => {
            const detail = new ResultlistDetailFormGroup();
            d.fields.forEach(f => detail.customControls.fields.push(buildDetailField(this.collectionService, collection)));
            formGroup.customControls.dataStep.details.push(detail);
        });

        formGroup.patchValue(value);
        return formGroup;
    }

    // TODO Optimize by not requesting the collection fields (also for other build methods)
    public buildColumn(collection: string) {
        const fieldObs = toOptionsObs(this.collectionService.getCollectionFields(collection, NUMERIC_OR_DATE_OR_KEYWORD));
        return new ResultlistColumnFormGroup(
            fieldObs,
            collection,
            this.mainFormService.commonConfig.getKeysToColorFa(),
            this.defaultValuesService.getDefaultConfig(),
            this.dialog,
            this.collectionService,
            this.colorService
        );
    }

    public buildQuicklook(collection: string) {
        const fieldObs = this.collectionService.getCollectionFields(collection, TEXT_OR_KEYWORD);
        const control = new ResultlistQuicklookFormGroup(
            fieldObs,
            collection,
            this.collectionService);
        ConfigFormGroupComponent.listenToAllControlsOnDependencyChange(control.get('filter') as ConfigFormGroup, []);
        return control;
    }

    public buildVisualisationsDataGroupCriteria(collection: string) {
        const collectionFields = this.collectionService.getCollectionFields(collection);
        const operators = [Expression.OpEnum.Range,
            Expression.OpEnum.Eq, Expression.OpEnum.Like,
            Expression.OpEnum.Lte, Expression.OpEnum.Lt,
            Expression.OpEnum.Gte, Expression.OpEnum.Gt,
            Expression.OpEnum.Ne
        ];

        const control = new ResultListVisualisationsDataGroupCondition(collectionFields,
            operators, this.collectionService, collection);
        ConfigFormGroupComponent.listenToOnDependencysChange(control.get('filterField') as ConfigFormControl, []);
        ConfigFormGroupComponent.listenToOnDependencysChange(control.get('filterOperation') as ConfigFormControl, []);
        ConfigFormGroupComponent.listenToAllControlsOnDependencyChange(control.get('filterValues') as ConfigFormGroup, []);
        return control;
    }

}
