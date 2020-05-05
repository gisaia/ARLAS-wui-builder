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
import { NGXLogger } from 'ngx-logger';
import { ComponentSubForm } from '@shared-models/component-sub-form';
import { TimelineGlobalFormGroup } from '@timeline-config/services/timeline-global-form-builder/timeline-global-form-builder.service';

/**
 * TODO delete this class and use Config Forms instead
 */
export class TimelineFormComponentForm extends ComponentSubForm {
    constructor(
        protected logger: NGXLogger
    ) {
        super(logger);
    }

    get bucketOrInterval() {
        return (this.formFg as TimelineGlobalFormGroup).customControls.bucketOrInterval;
    }

    get bucketsNumber() {
        return (this.formFg as TimelineGlobalFormGroup).customControls.bucketsNumber;
    }

    get intervalUnit() {
        return (this.formFg as TimelineGlobalFormGroup).customControls.intervalUnit;
    }

    get intervalSize() {
        return (this.formFg as TimelineGlobalFormGroup).customControls.intervalSize;
    }

    get chartTitle() {
        return (this.formFg as TimelineGlobalFormGroup).customControls.chartTitle;
    }

    get chartType() {
        return (this.formFg as TimelineGlobalFormGroup).customControls.chartType;
    }

    get isMultiselectable() {
        return (this.formFg as TimelineGlobalFormGroup).customControls.isMultiselectable;
    }

    get selectionExtentPercent() {
        return (this.formFg as TimelineGlobalFormGroup).customControls.selectionExtentPercent;
    }

}
