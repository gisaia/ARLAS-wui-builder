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
import { Component, OnInit, Input, forwardRef, OnDestroy, AfterContentChecked, ChangeDetectorRef } from '@angular/core';
import { PROPERTY_SELECTOR_SOURCE, KeywordColor, PROPERTY_TYPE, ProportionedValues } from './models';
import { PropertySelectorComponentForm } from './property-selector.component.form';
import { FormBuilder, NG_VALUE_ACCESSOR, NG_VALIDATORS, AbstractControl, ValidationErrors } from '@angular/forms';
import { DialogPaletteSelectorData } from '@map-config/components/dialog-palette-selector/model';
import { DialogPaletteSelectorComponent } from '@map-config/components/dialog-palette-selector/dialog-palette-selector.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogColorTableComponent, DialogColorTableData } from '@map-config/components/dialog-color-table/dialog-color-table.component';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { updateValueAndValidity } from '@utils/tools';
import { METRIC_TYPES, CollectionService } from '@services/collection-service/collection.service';
import { ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';
import { NGXLogger } from 'ngx-logger';
import { TranslateService } from '@ngx-translate/core';
import { ensureMinLessThanMax } from '@utils/tools';

@Component({
  selector: 'app-property-selector',
  templateUrl: './property-selector.component.html',
  styleUrls: ['./property-selector.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PropertySelectorComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PropertySelectorComponent),
      multi: true
    }
  ]
})
export class PropertySelectorComponent extends PropertySelectorComponentForm implements OnInit, OnDestroy, AfterContentChecked {

  public PROPERTY_SELECTOR_SOURCE = PROPERTY_SELECTOR_SOURCE;
  public PROPERTY_TYPE = PROPERTY_TYPE;
  public ensureMinLessThanMax = ensureMinLessThanMax;
  public selectionSources: Array<{ key: PROPERTY_SELECTOR_SOURCE, value: string }>;

  @Input() public propertyName: string;
  @Input() public propertyType: PROPERTY_TYPE;
  @Input() private collection: string;
  @Input() public collectionKeywordFields: Array<string>;
  @Input() public collectionIntegerFields: Array<string>;
  @Input() public defaultKey: string;
  @Input() public sources: Array<string>;

  constructor(
    protected formBuilder: FormBuilder,
    protected formBuilderDefault: FormBuilderWithDefaultService,
    public dialog: MatDialog,
    public defaultValueService: DefaultValuesService,
    private collectionService: CollectionService,
    private colorService: ArlasColorGeneratorLoader,
    private cdref: ChangeDetectorRef,
    protected logger: NGXLogger,
    private translate: TranslateService
  ) {
    super(formBuilder, logger);
  }

  ngOnInit() {
    super.ngOnInit();

    this.selectionSources = [
      { key: PROPERTY_SELECTOR_SOURCE.fix, value: this.translate.instant('Fix') },
      { key: PROPERTY_SELECTOR_SOURCE.provided, value: this.translate.instant('Provided by a field') },
      { key: PROPERTY_SELECTOR_SOURCE.generated, value: this.translate.instant('Generated from a field') },
      { key: PROPERTY_SELECTOR_SOURCE.manual, value: this.translate.instant('Manual') },
      { key: PROPERTY_SELECTOR_SOURCE.interpolated, value: this.translate.instant('Interpolated from a field') },
    ].filter(o => this.sources.indexOf(o.key) >= 0);

    // register into the parent form
    this.initForceUpdateValidityOnChange();
    this.initUpdateManualColorKeywordOnSourceFieldChange();
    this.initUpdateMinMaxOnInterpolatedFieldChange();
    this.initUpdateInterpolatedValuesForNumberProperty();
  }

  writeValue(obj: any): void {
    super.writeValue(obj);
    if (obj) {
      this.propertyInterpolatedFieldCtrl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      // with FormArray, values cannot be simply set, each inner element is a FormGroup to be created
      if (obj && obj.propertyManualFg && obj.propertyManualFg.propertyManualValuesCtrl) {
        obj.propertyManualFg.propertyManualValuesCtrl.forEach((k: KeywordColor) => {
          this.addToColorManualValuesCtrl(k);
        });


        // interpolated min/max values cannot be get when import a config file, so we extract them
        const interpolatedValues = this.propertyInterpolatedValuesCtrl.value as Array<ProportionedValues>;
        if (!!interpolatedValues) {
          this.propertyInterpolatedMinFieldValueCtrl.setValue(interpolatedValues[0].proportion);
          this.propertyInterpolatedMaxFieldValueCtrl.setValue(interpolatedValues.slice(-1)[0].proportion);
          this.propertyInterpolatedMinValueCtrl.setValue(interpolatedValues[0].value);
          this.propertyInterpolatedMaxValueCtrl.setValue(interpolatedValues.slice(-1)[0].value);
        }
      }
    }
  }

  private initForceUpdateValidityOnChange() {
    [this.propertySourceCtrl, this.propertyInterpolatedFieldCtrl, this.propertyInterpolatedNormalizeCtrl,
    this.propertyInterpolatedScopeCtrl, this.propertyInterpolatedNormalizeCtrl]
      .forEach(ctrl =>
        ctrl.valueChanges.subscribe(value => {
          updateValueAndValidity(this.formFg, true, false);
        })
      );
  }

  private initUpdateManualColorKeywordOnSourceFieldChange() {
    this.propertyManualFieldCtrl.valueChanges.subscribe(v => {
      this.propertyManualValuesCtrl.clear();

      if (v) {
        this.collectionService.getTermAggregation(this.collection, v).then((keywords: Array<string>) => {
          keywords.forEach((k: string) => {
            this.addToColorManualValuesCtrl({
              keyword: k,
              color: this.colorService.getColor(k)
            });
          });
          this.addToColorManualValuesCtrl({
            keyword: 'OTHER',
            color: this.defaultValueService.getDefaultConfig().otherColor
          });
        });
      }
    });
  }

  private initUpdateMinMaxOnInterpolatedFieldChange() {
    [this.propertyInterpolatedFieldCtrl, this.propertyInterpolatedNormalizeCtrl].forEach(c => c.valueChanges.subscribe(v => {
      const interpolatedField = this.propertyInterpolatedFieldCtrl.value;
      if (!!interpolatedField && !this.propertyInterpolatedNormalizeCtrl.value) {
        this.collectionService.getComputationMetric(this.collection, interpolatedField, METRIC_TYPES.MIN).then(min =>
          this.propertyInterpolatedMinFieldValueCtrl.setValue(min)
        );
        this.collectionService.getComputationMetric(this.collection, interpolatedField, METRIC_TYPES.MAX).then(max =>
          this.propertyInterpolatedMaxFieldValueCtrl.setValue(max)
        );
      }
    }));
  }

  private initUpdateInterpolatedValuesForNumberProperty() {
    if (this.propertyType === PROPERTY_TYPE.number) {
      [this.propertyInterpolatedNormalizeCtrl, this.propertyInterpolatedNormalizeByKeyCtrl,
      this.propertyInterpolatedNormalizeLocalFieldCtrl, this.propertyInterpolatedMinFieldValueCtrl,
      this.propertyInterpolatedMaxFieldValueCtrl, this.propertyInterpolatedMinValueCtrl,
      this.propertyInterpolatedMaxValueCtrl]
        .forEach(control => control.valueChanges.subscribe(v => {
          const minValue = this.propertyInterpolatedNormalizeCtrl.value ? 0.0 : this.propertyInterpolatedMinFieldValueCtrl.value;
          const maxValue = this.propertyInterpolatedNormalizeCtrl.value ? 1.0 : this.propertyInterpolatedMaxFieldValueCtrl.value;
          const minInterpolatedValue = this.propertyInterpolatedMinValueCtrl.value;
          const maxInterpolatedValue = this.propertyInterpolatedMaxValueCtrl.value;
          this.propertyInterpolatedValuesCtrl.setValue(
            [...Array(6).keys()].map(k =>
              ({
                proportion: minValue + (maxValue - minValue) * k / 5,
                value: minInterpolatedValue + (maxInterpolatedValue - minInterpolatedValue) * k / 5
              })
            )
          );
        }
        )
        );
    }
  }

  public openManualColorTable() {
    const dialogRef = this.dialog.open(DialogColorTableComponent, {
      data: {
        collection: this.collection,
        sourceField: this.propertyManualFieldCtrl.value,
        keywordColors: this.propertyManualValuesCtrl.value
      } as DialogColorTableData,
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result: Array<KeywordColor>) => {
      if (result !== undefined) {
        this.propertyManualValuesCtrl.clear();
        result.forEach((k: KeywordColor) => {
          this.addToColorManualValuesCtrl(k);
        });
      }
    });
  }

  public openPaletteTable() {
    const paletteData: DialogPaletteSelectorData = {
      min: this.propertyInterpolatedNormalizeCtrl.value ? 0 : this.propertyInterpolatedMinFieldValueCtrl.value,
      max: this.propertyInterpolatedNormalizeCtrl.value ? 1 : this.propertyInterpolatedMaxFieldValueCtrl.value,
      defaultPalettes: this.defaultValueService.getDefaultConfig().palettes,
      selectedPalette: this.propertyInterpolatedValuesCtrl.value
    };
    const dialogRef = this.dialog.open(DialogPaletteSelectorComponent, {
      data: paletteData,
      autoFocus: false,
      panelClass: 'dialog-with-overflow'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.propertyInterpolatedFg.get('propertyInterpolatedValuesCtrl').setValue(result);
        this.propertyInterpolatedFg.get('propertyInterpolatedValuesCtrl').markAsDirty();
      }
    });
  }

  ngAfterContentChecked() {
    // fix ExpressionChangedAfterItHasBeenCheckedError
    this.cdref.detectChanges();
  }

  protected getPropertyType(): PROPERTY_TYPE {
    return this.propertyType;
  }

}
