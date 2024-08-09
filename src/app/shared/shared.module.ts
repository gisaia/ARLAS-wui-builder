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

import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injector, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacySliderModule as MatSliderModule } from '@angular/material/legacy-slider';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { FiltersComponent } from '@map-config/components/filters/filters.component';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { StartupService } from '@services/startup/startup.service';
import { CollectionsUnitsComponent } from '@shared-components/collections-units/collections-units.component';

import { ArlasToolkitSharedModule } from 'arlas-wui-toolkit';
import { ColorPickerModule } from 'ngx-color-picker';
import { ColorPickerWrapperComponent } from './components/color-picker-wrapper/color-picker-wrapper.component';
import { ConfigElementComponent } from './components/config-element/config-element.component';
import { ConfigFormControlComponent } from './components/config-form-control/config-form-control.component';
import { ConfigFormGroupArrayComponent } from './components/config-form-group-array/config-form-group-array.component';
import { ConfigFormGroupComponent } from './components/config-form-group/config-form-group.component';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal.component';
import { HistogramBucketFormGroupComponent } from './components/histogram-bucket-form-group/histogram-bucket-form-group.component';
import { InputModalComponent } from './components/input-modal/input-modal.component';
import { AlertOnChangeDirective } from './directives/alert-on-change/alert-on-change.directive';
import { AutoFocusDirective } from './directives/auto-focus/auto-focus.directive';
import { ResetOnChangeDirective } from './directives/reset-on-change/reset-on-change.directive';
import { HistogramBucketPipe } from './pipes/histogram-buckets/histogram-buckets.pipe';
import { ObjectvaluesPipe } from './pipes/objectvalues.pipe';
import { GroupCollectionPipe } from './pipes/group-collection.pipe';
import { MatExpansionModule } from '@angular/material/expansion';
import { GetCollectionDisplayModule } from 'arlas-web-components';


export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    ConfigElementComponent,
    ConfirmModalComponent,
    AlertOnChangeDirective,
    ColorPickerWrapperComponent,
    ResetOnChangeDirective,
    ObjectvaluesPipe,
    HistogramBucketPipe,
    AutoFocusDirective,
    ConfigFormGroupComponent,
    HistogramBucketFormGroupComponent,
    ConfigFormControlComponent,
    InputModalComponent,
    ConfigFormGroupArrayComponent,
    FiltersComponent,
    CollectionsUnitsComponent,
    GroupCollectionPipe
  ],
  imports: [
    ArlasToolkitSharedModule,
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCheckboxModule,
    ColorPickerModule,
    MatSelectModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    FormsModule,
    MatExpansionModule,
    MatInputModule,
    MatSliderModule,
    MatAutocompleteModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatStepperModule,
    MatAutocompleteModule,
    MatDividerModule,
    MatTooltipModule,
    MatRadioModule,
    MatChipsModule,
    DragDropModule,
    MatSidenavModule,
    MatBadgeModule,
    MatListModule,
    MatButtonToggleModule,
    HttpClientModule,
    MatPaginatorModule,
    MatMenuModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      },
      isolate: false
    }),
    GetCollectionDisplayModule
  ],
  exports: [
    ConfigElementComponent,
    ConfirmModalComponent,
    InputModalComponent,
    AlertOnChangeDirective,
    ColorPickerWrapperComponent,
    ResetOnChangeDirective,
    ObjectvaluesPipe,
    HistogramBucketPipe,
    GroupCollectionPipe,
    AutoFocusDirective,
    ConfigFormGroupComponent,
    ConfigFormControlComponent,
    HistogramBucketFormGroupComponent,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatInputModule,
    MatSliderModule,
    MatIconModule,
    ColorPickerModule,
    MatTabsModule,
    MatTableModule,
    MatStepperModule,
    MatAutocompleteModule,
    MatDividerModule,
    MatTooltipModule,
    MatRadioModule,
    MatChipsModule,
    DragDropModule,
    MatSidenavModule,
    MatBadgeModule,
    MatListModule,
    HttpClientModule,
    MatPaginatorModule,
    MatMenuModule,
    MatCheckboxModule,
    MatTreeModule,
    TranslateModule,
    MatSortModule
  ]
})
export class SharedModule {
  public constructor(translateService: TranslateService, injector: Injector) {
    StartupService.translationLoaded(translateService, injector);
  }
}
