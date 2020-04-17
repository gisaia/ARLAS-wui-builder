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
import { Validators } from '@angular/forms';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';
import { CustomValidators } from '@utils/custom-validators';
import { ComponentSubForm } from '@shared-models/component-sub-form';
import { NGXLogger } from 'ngx-logger';
import { Input } from '@angular/core';

export class TimelineFormComponentForm extends ComponentSubForm {

    @Input() public isDetailedTimeline: boolean;

    constructor(
        protected formBuilderDefault: FormBuilderWithDefaultService,
        protected logger: NGXLogger
    ) {

        super(logger);

        this.formFg = formBuilderDefault.group('timeline.global', {
            isDetailedTimeline: [null],
            field: [null, Validators.required],
            bucketOrInterval: [null],
            bucketsNumber: [
                null,
                CustomValidators.getConditionalValidator(() =>
                    !!this.formFg ? !this.bucketOrInterval.value || this.isDetailedTimeline : false,
                    Validators.required
                )],
            intervalUnit: [
                null,
                CustomValidators.getConditionalValidator(() =>
                    !!this.formFg ? this.bucketOrInterval.value && !this.isDetailedTimeline : false,
                    Validators.required
                )],
            intervalSize: [
                null,
                [
                    CustomValidators.getConditionalValidator(() =>
                        !!this.formFg ? this.bucketOrInterval.value && !this.isDetailedTimeline : false,
                        Validators.required
                    ),
                    Validators.pattern('^[0-9]*$')
                ]
            ],
            chartTitle: [
                null,
                Validators.required
            ],
            chartType: [
                null,
                Validators.required
            ],
            dateFormat: [
                null,
                Validators.required
            ],
            isMultiselectable: [
                false
            ],
            selectionExtentPercent: [
                0
            ]
        });
    }

    get bucketOrInterval() {
        return this.formFg.get('bucketOrInterval');
    }

    get bucketsNumber() {
        return this.formFg.get('bucketsNumber');
    }

    get intervalUnit() {
        return this.formFg.get('intervalUnit');
    }

    get intervalSize() {
        return this.formFg.get('intervalSize');
    }

    get chartTitle() {
        return this.formFg.get('chartTitle');
    }

    get chartType() {
        return this.formFg.get('chartType');
    }

    get isMultiselectable() {
        return this.formFg.get('isMultiselectable');
    }

    get selectionExtentPercent() {
        return this.formFg.get('selectionExtentPercent');
    }
}
