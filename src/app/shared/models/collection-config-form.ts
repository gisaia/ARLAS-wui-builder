import { AbstractControl } from '@angular/forms';
import { ConfigFormGroup, ConfigFormControl, ControlOptionalParams } from '@shared/models/config-form';
import { Observable } from 'rxjs';
import { CollectionField } from '@services/collection-service/models';
export class CollectionConfigFormGroup extends ConfigFormGroup {
    public collection: string;
    public collectionFieldsObs: Observable<Array<CollectionField>>;
    constructor(
        collection,
        controls: {
            [key: string]: AbstractControl;
        }) {
        super(controls);
        this.collection = collection;
    }

    public setCollection(collection: string): void {
        this.collection = collection;
    }

    public setCollectionFieldsObs(collectionFieldsObs: Observable<Array<CollectionField>>): void {
        this.collectionFieldsObs = collectionFieldsObs;
    }
}


export class CollectionConfigFormControl extends ConfigFormControl {
    public collection: string;

    constructor(
        collection,
        formState: any,
        label: string,
        description: string,
        optionalParams: ControlOptionalParams = {}) {
        super(formState, label, description, optionalParams);
        this.collection = collection;
    }

    public setCollection(collection: string): void {
        this.collection = collection;
    }
}
