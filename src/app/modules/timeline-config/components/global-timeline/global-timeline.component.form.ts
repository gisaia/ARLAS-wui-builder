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
import { MainFormService } from '@services/main-form/main-form.service';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { TimelineFormComponent } from '../timeline-form/timeline-form.component';
import { ViewChildren, QueryList, ViewChild } from '@angular/core';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';

export class GlobalTimelineComponentForm {

    public globalFg: FormGroup;

    constructor(
        protected mainFormService: MainFormService,
        protected formBuilderDefault: FormBuilderWithDefaultService
    ) {
        this.mainFormService.timelineConfig.initGlobalFg(formBuilderDefault.group('timeline.global', {
            timeline: [null, Validators.required],
            useDetailedTimeline: [false],
            detailedTimeline: [null, Validators.required]
        }));

        this.globalFg = this.mainFormService.timelineConfig.getGlobalFg();
    }

    get timeline() {
        return this.globalFg.get('timeline');
    }

    get useDetailedTimeline() {
        return this.globalFg.get('useDetailedTimeline');
    }

    get detailedTimeline() {
        return this.globalFg.get('detailedTimeline');
    }

}
