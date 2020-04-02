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
import { ViewChild, OnInit, Inject } from '@angular/core';
import { MatStepper, MatDialogRef } from '@angular/material';
import { FormGroup } from '@angular/forms';

export abstract class WidgetComponent implements OnInit {

    @ViewChild('stepper', { static: false }) private stepper: MatStepper;
    public widgetFormGroup: FormGroup;

    constructor(
        public dialogRef: MatDialogRef<WidgetComponent>,
        public componentValue: any
    ) {

    }

    public ngOnInit() {
        this.dialogRef.disableClose = true;
        this.dialogRef.updateSize('1200px');

        if (!!this.componentValue) {
            this.widgetFormGroup.patchValue(this.componentValue);
        }
    }

    public save() {
        this.widgetFormGroup.markAllAsTouched();
        this.stepper.steps.setDirty();
        this.stepper.steps.forEach(s => s.interacted = true);
        if (this.widgetFormGroup.valid) {
            this.dialogRef.close(this.widgetFormGroup);
        }
    }

}
