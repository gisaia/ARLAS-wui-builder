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
import { Injectable } from '@angular/core';
import { FormArray } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import {
  ConfigFormGroup,
  SelectFormControl,
  SliderFormControl,
  SlideToggleFormControl,
  InputFormControl,
  CollectionsUnitsControl
} from '@shared-models/config-form';


export class CollectionUnitFormGroup extends ConfigFormGroup {
  constructor() {
    super({
      unit: new InputFormControl(
        '',
        'collection unit',
        'Unit desc'
      ),
      collection: new InputFormControl(
        '',
        'collection',
        'collection desc'
      )
    });
  }

  public customControls = {
    unit: this.get('unit') as InputFormControl,
    collection: this.get('collection') as InputFormControl
  };
}
export class LookAndFeelGlobalFormGroup extends ConfigFormGroup {

  constructor(
  ) {
    super(
      {
        dragAndDrop: new SlideToggleFormControl(
          '',
          marker('Drag and drop'),
          marker('Drag and drop description'),
          { title: marker('Look and feel') }
        ),
        zoomToData: new SlideToggleFormControl(
          '',
          marker('Zoom to data'),
          marker('Zoom to data description')
        ),
        indicators: new SlideToggleFormControl(
          '',
          marker('Display indicators'),
          marker('Display indicators description')
        ),
        spinner: new SlideToggleFormControl(
          '',
          marker('Display spinners'),
          marker('Display spinners description'),
        ),
        spinnerColor: new SelectFormControl(
          '',
          marker('Spinners color'),
          null,
          null,
          [
            { label: marker('Primary'), value: 'primary' },
            { label: marker('Accent'), value: 'accent' }
          ],
          {
            dependsOn: () => [this.customControls.spinner],
            onDependencyChange: (control) =>
              this.customControls.spinner.value ? control.enable() : control.disable()
          }
        ),
        spinnerDiameter: new SliderFormControl(
          '',
          marker('Spinner diameter'),
          null,
          10,
          100,
          10,
          null,
          null,
          {
            dependsOn: () => [this.customControls.spinner],
            onDependencyChange: (control) =>
              this.customControls.spinner.value ? control.enable() : control.disable()
          }
        ),
        units: new CollectionsUnitsControl(
          new FormArray([], []),
          '',
          marker('collection unit description'),

          {
            title: marker('Units'),
            optional: true,
          }
        ),
      }
    );
  }



  public customControls = {
    dragAndDrop: this.get('dragAndDrop') as SlideToggleFormControl,
    zoomToData: this.get('zoomToData') as SlideToggleFormControl,
    indicators: this.get('indicators') as SlideToggleFormControl,
    spinner: this.get('spinner') as SlideToggleFormControl,
    spinnerColor: this.get('spinnerColor') as SelectFormControl,
    spinnerDiameter: this.get('spinnerDiameter') as SliderFormControl,
    units: this.get('units') as CollectionsUnitsControl
  };

  public collectionUnitMap = new Map();

  public buildUnits(collections): FormArray {
    const collectionsUnits = new FormArray([]);
    const values = this.customControls.units.value as FormArray;
    if (!!values && values.controls) {
      values.controls.forEach((cu: CollectionUnitFormGroup) => {
        if (cu.customControls.unit.value) {
          this.collectionUnitMap.set(cu.customControls.collection.value, cu.customControls.unit.value);
        }
      });
    }
    collections.forEach((collection, i) => {
      let collectionUnitForm = values.controls
        .find((v: CollectionUnitFormGroup) => v.customControls.collection.value === collection) as CollectionUnitFormGroup;
      if (!collectionUnitForm) {
        collectionUnitForm = new CollectionUnitFormGroup();
        collectionUnitForm.customControls.collection.setValue(collection);
        if (this.collectionUnitMap.get(collection)) {
          collectionUnitForm.customControls.unit.setValue(this.collectionUnitMap.get(collection));
        } else {
          collectionUnitForm.customControls.unit.setValue(collection);

        }
      }
      collectionsUnits.insert(i, collectionUnitForm);
    });
    return collectionsUnits;
  }

  public buildCollectioUnitForm(collection: string, unit: string): CollectionUnitFormGroup {
    const collectionUnitForm = new CollectionUnitFormGroup();
    collectionUnitForm.customControls.unit.setValue(unit);
    collectionUnitForm.customControls.collection.setValue(collection);
    return collectionUnitForm;
  }
}



@Injectable({
  providedIn: 'root'
})
export class LookAndFeelGlobalFormBuilderService {

  constructor(
    private defaultValuesService: DefaultValuesService,
  ) { }

  public build() {
    const globalFg = new LookAndFeelGlobalFormGroup();

    this.defaultValuesService.setDefaultValueRecursively('lookAndFeel.global', globalFg);
    return globalFg;
  }
}
