import { FormArray } from '@angular/forms';
import { marker } from '@colsen1991/ngx-translate-extract-marker';
import { CollectionService } from '@services/collection-service/collection.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { CollectionUnitFormGroup } from '@shared-models/collection-unit-form-group';
import {
    CollectionsUnitsControl, ConfigFormGroup, SelectFormControl, SliderFormControl, SlideToggleFormControl
} from '@shared-models/config-form';
import { ZoomToDataStrategy } from 'arlas-wui-toolkit';

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
        zoomToDataStrategy: new SelectFormControl(
          '',
          marker('Zoom to data strategy'),
          marker('Zoom to data strategy description'),
          null,
          Object.values(ZoomToDataStrategy).map(zts => ({ label: marker(zts), value: zts }))
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
          marker('Spinners color description'),
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
    zoomToDataStrategy: this.get('zoomToDataStrategy') as SelectFormControl,
    indicators: this.get('indicators') as SlideToggleFormControl,
    spinner: this.get('spinner') as SlideToggleFormControl,
    spinnerColor: this.get('spinnerColor') as SelectFormControl,
    spinnerDiameter: this.get('spinnerDiameter') as SliderFormControl,
    units: this.get('units') as CollectionsUnitsControl
  };

  public collectionUnitMap = new Map();
  public collectionIgnoredMap = new Map();
  public ignoredCollections = new Map();

  public buildUnits(collections: string[]): FormArray {
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
    const configuredCollections = this.mainFormService.getAllCollections(this.collectionService);

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
