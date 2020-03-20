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
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmExitGuard } from '@guards/confirm-exit/confirm-exit.guard';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmModalComponent } from '@shared/components/confirm-modal/confirm-modal.component';
import { SharedModule } from '@shared/shared.module';
import { DialogColorTableComponent } from './components/dialog-color-table/dialog-color-table.component';
import { DialogPaletteSelectorComponent } from './components/dialog-palette-selector/dialog-palette-selector.component';
import { EditLayerModeFormComponent } from './components/edit-layer-mode-form/edit-layer-mode-form.component';
import { EditLayerComponent } from './components/edit-layer/edit-layer.component';
import { GlobalComponent } from './components/global/global.component';
import { LayersComponent } from './components/layers/layers.component';
import { MapConfigRoutingModule } from './map-config-routing.module';
import { MapConfigComponent } from './map-config.component';
import { EditLayerFeatureMetricComponent } from './components/edit-layer-feature-metric/edit-layer-feature-metric.component';
import { EditLayerFeaturesComponent } from './components/edit-layer-features/edit-layer-features.component';

@NgModule({
  entryComponents: [
    ConfirmModalComponent,
    DialogColorTableComponent,
    DialogPaletteSelectorComponent
  ],
  declarations: [
    MapConfigComponent,
    GlobalComponent,
    LayersComponent,
    EditLayerComponent,
    EditLayerModeFormComponent,
    DialogColorTableComponent,
    DialogPaletteSelectorComponent,
    EditLayerFeatureMetricComponent,
    EditLayerFeaturesComponent
  ],
  imports: [
    CommonModule,
    MapConfigRoutingModule,
    MatTabsModule,
    MatSnackBarModule,
    MatTableModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    SharedModule,
    MatButtonModule,
    MatStepperModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatDialogModule,
    MatIconModule,
    MatTooltipModule,
    MatAutocompleteModule,
    DragDropModule,
    MatDividerModule,
    TranslateModule
  ],
  providers: [
    ConfirmExitGuard
  ]
})
export class MapConfigModule { }
