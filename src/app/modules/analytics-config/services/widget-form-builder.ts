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
import { CollectionService } from '@services/collection-service/collection.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { ConfigFormGroup } from '@shared-models/config-form';

export abstract class WidgetFormBuilder {

    public abstract defaultKey: string;

    constructor(
        protected collectionService: CollectionService,
        protected mainFormService: MainFormService
    ) { }

    /**
     * Must return a FormGroup with controls "dataStep" and "renderStep"
     */
    protected abstract build(collection: string): ConfigFormGroup;

    /**
     * Build the FormGroup and set the value to it
     * It may be overriden to create inner controls (like in FormArray)
     * before setting the value.
     */
    public buildWithValues(value: any, collection) {
        const formGroup = this.build(collection);
        formGroup.patchValue(value);
        return formGroup;
    }

}
