/*
 * Licensed to Gisaïa under one or more contributor
 * license agreements. See the NOTICE.txt file distributed with
 * this work for additional information regarding copyright
 * ownership. Gisaïa licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import {
  MapFilterFormGroup, MapLayerFormBuilderService, MapLayerFormGroup
} from '@map-config/services/map-layer-form-builder/map-layer-form-builder.service';
import { MainFormService } from '@services/main-form/main-form.service';
import { ConfirmModalComponent } from '@shared-components/confirm-modal/confirm-modal.component';
import { ConfigFormGroup } from '@shared-models/config-form';
import { camelize } from '@utils/tools';
import { MapglLegendComponent } from 'arlas-web-components';
import { Subscription } from 'rxjs';
import { DialogFilterComponent } from '../dialog-filter/dialog-filter.component';
import { LAYER_MODE } from '../edit-layer/models';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';


export interface Layer {
  id: string;
  name: string;
  mode: string;
}

@Component({
  selector: 'arlas-layer-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit, OnDestroy {
  @Input() public layerFg: MapLayerFormGroup;

  public filtersFa: FormArray;
  public displayedColumns: string[] = ['field', 'operation', 'value', 'action'];

  private confirmDeleteSub: Subscription;

  public constructor(
    public dialog: MatDialog,
    private mainFormService: MainFormService,
    private mapLayerFormBuilder: MapLayerFormBuilderService
  ) { }

  public ngOnInit() {
    const layerFg = this.layerFg as MapLayerFormGroup;
    /** import existing filters */
    if (layerFg.customControls.mode.value === LAYER_MODE.featureMetric) {
      this.filtersFa = (layerFg.customControls.featureMetricFg.controls.visibilityStep as ConfigFormGroup)
        .controls.filters.value;
    } else if (layerFg.customControls.mode.value === LAYER_MODE.features) {
      this.filtersFa = (layerFg.customControls.featuresFg.controls.visibilityStep as ConfigFormGroup)
        .controls.filters.value;
    }
    for (let i = 0; i < this.filtersFa.length; i++) {
      const ffg = this.filtersFa.at(i) as MapLayerFormGroup;
      ffg.customControls.id.setValue(i);
      this.filtersFa.setControl(i, ffg);
    }
    layerFg.clearFilters.subscribe(f => this.filtersFa = (layerFg.customControls.featuresFg.controls.visibilityStep as ConfigFormGroup)
      .controls.filters.value);
  }

  public ngOnDestroy() {
    if (this.confirmDeleteSub) {
      this.confirmDeleteSub.unsubscribe();
    }
  }

  public open(filterId?: number) {
    const mapFormGroup: MapFilterFormGroup = this.mapLayerFormBuilder.buildMapFilter(this.layerFg.customControls.collection.value);
    /** if we edit an existing filter */
    if (filterId !== undefined) {
      const formGroupIndex = (this.filtersFa.value as any[]).findIndex(el => el.id === filterId);
      const oldmapFormGroup = this.filtersFa.at(formGroupIndex) as MapFilterFormGroup;
      mapFormGroup.customControls.id.setValue(filterId);
      mapFormGroup.customControls.filterField.setValue(oldmapFormGroup.customControls.filterField.value);
      mapFormGroup.customControls.filterOperation.setValue(oldmapFormGroup.customControls.filterOperation.value);
      mapFormGroup.customControls.filterInValues.setValue(oldmapFormGroup.customControls.filterInValues.value);
      mapFormGroup.customControls.filterBoolean.setValue(oldmapFormGroup.customControls.filterBoolean.value);
      mapFormGroup.customControls.filterEqualValues.setValue(oldmapFormGroup.customControls.filterEqualValues.value);
      mapFormGroup.customControls.filterMinRangeValues.setValue(oldmapFormGroup.customControls.filterMinRangeValues.value);
      mapFormGroup.customControls.filterMaxRangeValues.setValue(oldmapFormGroup.customControls.filterMaxRangeValues.value);
      if (mapFormGroup.customControls.filterInValues.enabled) {
        mapFormGroup.customControls.filterInValues.selectedMultipleItems = oldmapFormGroup.customControls.filterInValues.value;
        if (mapFormGroup.customControls.filterOperation.value === 'IN' || mapFormGroup.customControls.filterOperation.value === 'NOT_IN') {
          mapFormGroup.customControls.filterInValues.savedItems = new Set(
            mapFormGroup.customControls.filterInValues.selectedMultipleItems.map(i => i.value)
          );
        }
      }
      /** editing attribute allows to avoid reseting the form value due to ondependencyChange */
      mapFormGroup.editing = true;
      mapFormGroup.editionInfo = {
        field: oldmapFormGroup.customControls.filterField.value.value,
        op: oldmapFormGroup.customControls.filterOperation.value
      };
    }
    this.dialog.open(DialogFilterComponent, {
      data: {
        mapForm: mapFormGroup,
        collection: this.mainFormService.getMainCollection()
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        if (filterId !== undefined) {
          const formGroupIndex = (this.filtersFa.value as any[]).findIndex(el => el.id === filterId);
          this.filtersFa.setControl(formGroupIndex, mapFormGroup);
        } else {
          const index = this.filtersFa.length;
          mapFormGroup.customControls.id.setValue(index);
          this.filtersFa.insert(index, mapFormGroup);
        }
      }
    });
  }

  public getColorLegend(paint) {
    const styleColor = paint['circle-color'] || paint['heatmap-color'] || paint['fill-color'] || paint['line-color'];
    const colorLegend = MapglLegendComponent.buildColorLegend(styleColor as any, true, null);
    return colorLegend[0];
  }

  public confirmDelete(filterId: number): void {
    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      width: '400px',
      data: { message: marker('Do you really want to delete the filter?') }
    });
    this.confirmDeleteSub = dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const formGroupIndex = (this.filtersFa.value as any[]).findIndex(el => el.id === filterId);
        this.filtersFa.removeAt(formGroupIndex);
      }
      this.ngOnInit();
    });
  }

  public camelize(text: string): string {
    return camelize(text);
  }
}
