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
import { CollectionService } from '@services/collection-service/collection.service';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { ConfigExportHelper } from '@services/main-form-manager/config-export-helper';
import {
  CollectionsUnitsControl, ConfigFormGroup, InputFormControl, SelectFormControl,
  SliderFormControl,
  SlideToggleFormControl
} from '@shared-models/config-form';
import { MainFormService } from '@services/main-form/main-form.service';


export class CollectionUnitFormGroup extends ConfigFormGroup {
  public constructor() {
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
      ),
      ignored: new SlideToggleFormControl(false,
        '',
        '')
    });
  }

  public customControls = {
    unit: this.get('unit') as InputFormControl,
    collection: this.get('collection') as InputFormControl,
    ignored: this.get('ignored') as SlideToggleFormControl
  };
}
export class LookAndFeelGlobalFormGroup extends ConfigFormGroup {

  public constructor(
    private mainFormService: MainFormService,
    private collectionService: CollectionService
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
          20,
          70,
          5,
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
  public collectionIgnoredMap = new Map();
  public ignoredCollections = new Map();

  public buildUnits(collections): FormArray {
    const collectionsUnits = new FormArray([]);
    const values = this.customControls.units.value as FormArray;
    if (!!values && values.controls) {
      values.controls.forEach((cu: CollectionUnitFormGroup) => {
        if (cu.customControls.unit.value) {
          this.collectionUnitMap.set(cu.customControls.collection.value, cu.customControls.unit.value);
          this.collectionIgnoredMap.set(cu.customControls.collection.value, cu.customControls.ignored.value);
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
          collectionUnitForm.customControls.ignored.setValue(this.collectionIgnoredMap.get(collection));
        } else {
          collectionUnitForm.customControls.unit.setValue(collection);
          collectionUnitForm.customControls.ignored.setValue(false);
        }
      }
      collectionsUnits.insert(i, collectionUnitForm);
    });
    return collectionsUnits;
  }

  public buildCollectioUnitForm(collection: string, unit: string, ignored: boolean): CollectionUnitFormGroup {
    const collectionUnitForm = new CollectionUnitFormGroup();
    collectionUnitForm.customControls.unit.setValue(unit);
    collectionUnitForm.customControls.collection.setValue(collection);
    collectionUnitForm.customControls.ignored.setValue(ignored);
    return collectionUnitForm;
  }

  public buildAtExport() {
    const startingConfig = this.mainFormService.startingConfig.getFg();
    const mapConfigGlobal = this.mainFormService.mapConfig.getGlobalFg();
    const mapConfigLayers = this.mainFormService.mapConfig.getLayersFa();
    const timelineConfigGlobal = this.mainFormService.timelineConfig.getGlobalFg();
    const searchConfigGlobal = this.mainFormService.searchConfig.getGlobalFg();
    const analyticsConfigList = this.mainFormService.analyticsConfig.getListFa();
    const resultLists = this.mainFormService.resultListConfig.getResultListsFa();
    if (startingConfig.customControls && mapConfigGlobal.customControls && timelineConfigGlobal.customControls
        && searchConfigGlobal.customControls) {
      const configuredCollections = ConfigExportHelper.getConfiguredCollections(
        startingConfig,
        mapConfigGlobal,
        mapConfigLayers,
        searchConfigGlobal,
        timelineConfigGlobal,
        analyticsConfigList,
        resultLists,
        this.collectionService
      );
      /** keeping formarray order */
      const formArrayCollections = (this.customControls.units.value as FormArray).controls.map(control =>
        (control as CollectionUnitFormGroup).customControls.collection.value
      );
      const collectionsSet = new Set(configuredCollections);
      const formSetCollections = new Set(formArrayCollections);
      const orderedCollections = [];
      formArrayCollections.forEach(fc => {
        if (collectionsSet.has(fc)) {
          orderedCollections.push(fc);
        }
      });
      /** add newly confiured collections at the end */
      configuredCollections.forEach(c => {
        if (!formSetCollections.has(c)) {
          orderedCollections.push(c);
        }
      });
      const unitsFg = this.buildUnits(orderedCollections);
      this.customControls.units.setValue(unitsFg);
    }
  }
}



@Injectable({
  providedIn: 'root'
})
export class LookAndFeelGlobalFormBuilderService {

  public constructor(
    private defaultValuesService: DefaultValuesService,
    private mainFormService: MainFormService,
    private collectionService: CollectionService
  ) { }

  public build() {
    const globalFg = new LookAndFeelGlobalFormGroup(this.mainFormService, this.collectionService);

    this.defaultValuesService.setDefaultValueRecursively('lookAndFeel.global', globalFg);
    return globalFg;
  }
}
