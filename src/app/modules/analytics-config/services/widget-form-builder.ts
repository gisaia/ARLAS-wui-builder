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
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { CollectionField } from '@services/collection-service/models';
import { CollectionService } from '@services/collection-service/collection.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { CollectionReferenceDescriptionProperty } from 'arlas-api';
import { ConfigFormGroup } from '@shared-models/config-form';
import { map } from 'rxjs/operators';
import { NUMERIC_OR_DATE_TYPES } from '@utils/tools';

export abstract class WidgetFormBuilder {

    public abstract widgetFormGroup: FormGroup;
    public abstract defaultKey: string;

    protected collectionFieldsObs: Observable<Array<CollectionField>>;
    constructor(
        protected collectionService: CollectionService,
        protected mainFormService: MainFormService

    ) {
        this.collectionFieldsObs = this.collectionService.getCollectionFields(
            this.mainFormService.getCollections()[0]);
    }

    get dataStep() {
        return this.widgetFormGroup.get('dataStep') as ConfigFormGroup;
    }

    get renderStep() {
        return this.widgetFormGroup.get('renderStep') as ConfigFormGroup;
    }

    protected getNumericOrDateFieldsObs() {
        return this.collectionFieldsObs.pipe(map(
            fields => fields
                .filter(f => NUMERIC_OR_DATE_TYPES.indexOf(f.type) >= 0)
                .map(f => ({ value: f.name, label: f.name }))));
    }

    protected getKeywordFieldsObs() {
        return this.collectionFieldsObs.pipe(map(
            fields => fields
                .filter(f => f.type === CollectionReferenceDescriptionProperty.TypeEnum.KEYWORD)
                .map(f => ({ value: f.name, label: f.name }))));
    }

}
