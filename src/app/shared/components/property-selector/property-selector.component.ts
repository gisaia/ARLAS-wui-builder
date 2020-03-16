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
import { PROPERTY_SELECTOR_SOURCE, KeywordColor } from './models';
import { PropertySelectorComponentForm } from './property-selector.component.form';
import { FormBuilder, NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import { DialogPaletteSelectorData } from '@map-config/components/dialog-palette-selector/model';
import { DialogPaletteSelectorComponent } from '@map-config/components/dialog-palette-selector/dialog-palette-selector.component';
import { MatDialog } from '@angular/material';
import { DialogColorTableComponent, DialogColorTableData } from '@map-config/components/dialog-color-table/dialog-color-table.component';
import { DefaultValuesService } from '@services/default-values/default-values.service';
import { updateValueAndValidity } from '@utils/tools';
import { METRIC_TYPES, CollectionService } from '@services/collection-service/collection.service';
import { ArlasColorGeneratorLoader } from 'arlas-wui-toolkit';
import { FormBuilderWithDefaultService } from '@services/form-builder-with-default/form-builder-with-default.service';
import { NGXLogger } from 'ngx-logger';
import { TranslateService } from '@ngx-translate/core';

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
  public selectionSources: Array<{ key: PROPERTY_SELECTOR_SOURCE, value: string }>;

  @Input() private collection: string;
  @Input() public collectionKeywordFields: Array<string>;
  @Input() public collectionIntegerFields: Array<string>;
  @Input() public defaultKey: string;
  @Input() public sources: Array<string>;

  constructor(
    protected formBuilder: FormBuilder,
    protected formBuilderDefault: FormBuilderWithDefaultService,
    public dialog: MatDialog,
    private defaultValueService: DefaultValuesService,
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
  }

  writeValue(obj: any): void {
    super.writeValue(obj);
    if (obj) {
      this.propertyInterpolatedFieldCtrl.updateValueAndValidity({ onlySelf: true, emitEvent: true });
      // with FormArray, values cannot be simply set, each inner element is a FormGroup to be created
      if (obj && obj.propertyManualFg && obj.propertyManualFg.propertyManualValuesCtrl) {
        obj.propertyManualFg.propertyManualValuesCtrl.forEach((k: KeywordColor) => {
          this.addToColorManualValuesCtrl(k);
        });
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
    this.propertyInterpolatedFieldCtrl.valueChanges.subscribe(f => {
      if (!f) {
        return;
      }
      this.collectionService.getComputationMetric(this.collection, f, METRIC_TYPES.MIN).then(min =>
        this.propertyInterpolatedMinValueCtrl.setValue(min)
      );
      this.collectionService.getComputationMetric(this.collection, f, METRIC_TYPES.MAX).then(max =>
        this.propertyInterpolatedMaxValueCtrl.setValue(max)
      );
    });
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
      min: this.propertyInterpolatedNormalizeCtrl.value ? 0 : this.propertyInterpolatedMinValueCtrl.value,
      max: this.propertyInterpolatedNormalizeCtrl.value ? 1 : this.propertyInterpolatedMaxValueCtrl.value,
      defaultPalettes: this.defaultValueService.getDefaultConfig().palettes,
      selectedPalette: this.propertyInterpolatedPaletteCtrl.value
    };
    const dialogRef = this.dialog.open(DialogPaletteSelectorComponent, {
      data: paletteData,
      autoFocus: false,
      panelClass: 'dialog-with-overflow'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.propertyInterpolatedFg.get('propertyInterpolatedPaletteCtrl').setValue(result);
        this.propertyInterpolatedFg.get('propertyInterpolatedPaletteCtrl').markAsDirty();
      }
    });
  }

  ngAfterContentChecked() {
    // fix ExpressionChangedAfterItHasBeenCheckedError
    this.cdref.detectChanges();
  }

}
